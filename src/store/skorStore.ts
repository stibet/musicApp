// skorStore.ts
// Kullanıcı ilerleme, skor, günlük pratik süresi, favori enstrüman

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EgzersizSeviye } from '../makam/makamDef';

const ANAHTAR = 'makam_coach_skor_v2';

export interface MakamSkor {
  makamId: string;
  toplamEgzersiz: number;
  dogruSayisi: number;
  yanlisSayisi: number;
  basariYuzde: number;
  avgAbsCent: number;       // Pitch egzersizlerinden
  sonAktivite: number;
  zayifDereceler: string[]; // En çok yanlış yapılan perdeler
  gucluDereceler: string[];
}

export interface GunlukPratik {
  tarih: string; // YYYY-MM-DD
  pratikSureDk: number;
  tamamlananEgzersiz: number;
  kazanilanPuan: number;
}

export interface KullaniciProfil {
  seviye: EgzersizSeviye;
  toplamPuan: number;
  streak: number;
  sonAktivite: number;
  favoriEnstruman: string;
  sonKullanilaTempo: number;
  sonCalinanMakam: string;
  makamSkorlar: Record<string, MakamSkor>;
  gunlukPratikler: Record<string, GunlukPratik>;
  tamamlananEgzersizler: string[];  // egzersiz id listesi
  rozetler: string[];
}

const BOSLUK: KullaniciProfil = {
  seviye: 'baslangic',
  toplamPuan: 0,
  streak: 0,
  sonAktivite: 0,
  favoriEnstruman: 'clarinet',
  sonKullanilaTempo: 70,
  sonCalinanMakam: 'rast',
  makamSkorlar: {},
  gunlukPratikler: {},
  tamamlananEgzersizler: [],
  rozetler: [],
};

function bugunStr(): string {
  return new Date().toISOString().split('T')[0];
}

export async function profilYukle(): Promise<KullaniciProfil> {
  try {
    const raw = await AsyncStorage.getItem(ANAHTAR);
    if (!raw) return { ...BOSLUK };
    return { ...BOSLUK, ...JSON.parse(raw) };
  } catch { return { ...BOSLUK }; }
}

export async function profilKaydet(p: KullaniciProfil): Promise<void> {
  try { await AsyncStorage.setItem(ANAHTAR, JSON.stringify(p)); } catch {}
}

// Egzersiz sonucunu kaydet
export async function egzersizSonucuKaydet(
  makamId: string,
  dogru: boolean,
  puan: number,
  centFark?: number,
  yanlisPerde?: string,
  dogruPerde?: string,
): Promise<void> {
  const profil = await profilYukle();
  const tarih  = bugunStr();

  // Makam skoru güncelle
  const mSkor: MakamSkor = profil.makamSkorlar[makamId] ?? {
    makamId, toplamEgzersiz: 0, dogruSayisi: 0, yanlisSayisi: 0,
    basariYuzde: 0, avgAbsCent: 0, sonAktivite: 0,
    zayifDereceler: [], gucluDereceler: [],
  };
  mSkor.toplamEgzersiz++;
  if (dogru) {
    mSkor.dogruSayisi++;
    if (dogruPerde && !mSkor.gucluDereceler.includes(dogruPerde))
      mSkor.gucluDereceler = [dogruPerde, ...mSkor.gucluDereceler].slice(0, 5);
  } else {
    mSkor.yanlisSayisi++;
    if (yanlisPerde && !mSkor.zayifDereceler.includes(yanlisPerde))
      mSkor.zayifDereceler = [yanlisPerde, ...mSkor.zayifDereceler].slice(0, 5);
  }
  mSkor.basariYuzde = Math.round((mSkor.dogruSayisi / mSkor.toplamEgzersiz) * 100);
  if (centFark !== undefined) {
    mSkor.avgAbsCent = Math.round(
      ((mSkor.avgAbsCent * (mSkor.toplamEgzersiz - 1) + Math.abs(centFark)) / mSkor.toplamEgzersiz) * 10) / 10;
  }
  mSkor.sonAktivite = Date.now();
  profil.makamSkorlar[makamId] = mSkor;

  // Günlük pratik güncelle
  const gun: GunlukPratik = profil.gunlukPratikler[tarih] ?? {
    tarih, pratikSureDk: 0, tamamlananEgzersiz: 0, kazanilanPuan: 0,
  };
  gun.tamamlananEgzersiz++;
  gun.kazanilanPuan += dogru ? puan : 0;
  profil.gunlukPratikler[tarih] = gun;

  // Genel puan
  if (dogru) profil.toplamPuan += puan;

  // Streak
  const son = new Date(profil.sonAktivite).toISOString().split('T')[0];
  if (son === tarih) {}
  else if (son === new Date(Date.now() - 86400000).toISOString().split('T')[0])
    profil.streak++;
  else profil.streak = 1;
  profil.sonAktivite = Date.now();
  profil.sonCalinanMakam = makamId;

  // Seviye güncelle
  if (profil.toplamPuan >= 500 && profil.seviye === 'baslangic') profil.seviye = 'orta';
  if (profil.toplamPuan >= 2000 && profil.seviye === 'orta') profil.seviye = 'ileri';

  // Rozetler
  const kontrol = (id: string, kosul: boolean) => {
    if (kosul && !profil.rozetler.includes(id)) profil.rozetler.push(id);
  };
  kontrol('ilk_dogru', profil.toplamPuan >= 10);
  kontrol('streak_3', profil.streak >= 3);
  kontrol('streak_7', profil.streak >= 7);
  kontrol('usta_rast', (profil.makamSkorlar['rast']?.basariYuzde ?? 0) >= 80);
  kontrol('usta_hicaz', (profil.makamSkorlar['hicaz']?.basariYuzde ?? 0) >= 80);
  kontrol('100_puan', profil.toplamPuan >= 100);
  kontrol('500_puan', profil.toplamPuan >= 500);

  await profilKaydet(profil);
}

// Tempo ve enstrüman tercihi kaydet
export async function tercihKaydet(enstruman?: string, tempo?: number): Promise<void> {
  const profil = await profilYukle();
  if (enstruman) profil.favoriEnstruman = enstruman;
  if (tempo !== undefined) profil.sonKullanilaTempo = tempo;
  await profilKaydet(profil);
}

// Pratik süresi ekle (dakika)
export async function pratikSuresiEkle(dakika: number): Promise<void> {
  const profil = await profilYukle();
  const tarih = bugunStr();
  const gun = profil.gunlukPratikler[tarih] ?? {
    tarih, pratikSureDk: 0, tamamlananEgzersiz: 0, kazanilanPuan: 0,
  };
  gun.pratikSureDk += dakika;
  profil.gunlukPratikler[tarih] = gun;
  await profilKaydet(profil);
}

// Seviye adı
export function seviyeIsim(s: EgzersizSeviye): string {
  return s === 'baslangic' ? 'Başlangıç' : s === 'orta' ? 'Orta' : 'İleri';
}

// Rozet bilgileri
export const rozetler: Record<string, { isim: string; emoji: string }> = {
  ilk_dogru:  { isim: 'İlk Doğru',    emoji: '🥉' },
  streak_3:   { isim: '3 Gün Serisi',  emoji: '🔥' },
  streak_7:   { isim: '7 Gün Serisi',  emoji: '🏆' },
  usta_rast:  { isim: 'Rast Ustası',   emoji: '⭐' },
  usta_hicaz: { isim: 'Hicaz Ustası',  emoji: '🌙' },
  '100_puan': { isim: '100 Puan',      emoji: '💯' },
  '500_puan': { isim: '500 Puan',      emoji: '🎖️' },
};
