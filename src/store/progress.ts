import AsyncStorage from '@react-native-async-storage/async-storage';
const ANAHTAR = 'mizmiz_progress';
export interface SoruIlerlemesi { soruId: string; dogru: number; yanlis: number; sonGorulme: number; sonrakiTekrar: number; aralik: number; }
export interface Ilerleme { sorular: Record<string, SoruIlerlemesi>; toplamDogru: number; toplamYanlis: number; streak: number; sonAktivite: number; }
const BOSLUK: Ilerleme = { sorular: {}, toplamDogru: 0, toplamYanlis: 0, streak: 0, sonAktivite: 0 };
export async function ilerlemeYukle(): Promise<Ilerleme> {
  try { const v = await AsyncStorage.getItem(ANAHTAR); return v ? JSON.parse(v) : { ...BOSLUK }; } catch { return { ...BOSLUK }; }
}
export async function ilerlemeSkaydet(i: Ilerleme) { try { await AsyncStorage.setItem(ANAHTAR, JSON.stringify(i)); } catch {} }
export function sonrakiTekrarHesapla(aralik: number, dogru: boolean) {
  const yeni = !dogru ? 1 : aralik === 0 ? 1 : aralik === 1 ? 3 : Math.round(aralik * 2.5);
  return { aralik: yeni, sonrakiTekrar: Date.now() + yeni * 86400000 };
}
export async function cevapKaydet(soruId: string, dogru: boolean) {
  const ilerleme = await ilerlemeYukle();
  const mevcut = ilerleme.sorular[soruId] || { soruId, dogru: 0, yanlis: 0, sonGorulme: 0, sonrakiTekrar: 0, aralik: 0 };
  const { aralik, sonrakiTekrar } = sonrakiTekrarHesapla(mevcut.aralik, dogru);
  ilerleme.sorular[soruId] = { ...mevcut, dogru: mevcut.dogru + (dogru ? 1 : 0), yanlis: mevcut.yanlis + (dogru ? 0 : 1), sonGorulme: Date.now(), sonrakiTekrar, aralik };
  if (dogru) ilerleme.toplamDogru++; else ilerleme.toplamYanlis++;
  const bugun = new Date().setHours(0, 0, 0, 0);
  const son = new Date(ilerleme.sonAktivite).setHours(0, 0, 0, 0);
  if (son === bugun) {} else if (son === bugun - 86400000) ilerleme.streak++; else ilerleme.streak = 1;
  ilerleme.sonAktivite = Date.now();
  await ilerlemeSkaydet(ilerleme);
}
export async function tekrarSorulari(ids: string[]): Promise<string[]> {
  const ilerleme = await ilerlemeYukle();
  const simdi = Date.now();
  return ids.filter(id => { const s = ilerleme.sorular[id]; return !s || s.sonrakiTekrar <= simdi; });
}