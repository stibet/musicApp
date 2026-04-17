// egzersizMotoru.ts
// 9 farklı egzersiz tipi. Native audio gerekmez.

import { getMakamDef, getMakamlariSeviyeye, makamDefler, type EgzersizSeviye } from '../makam/makamDef';
import type { EgzersizTip, IEgzersizMotoru, IEgzersizSoru } from '../interfaces';

function rastgele<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function karistir<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Yanlış seçenekler üret (doğru hariç)
function yanlisMakamlar(dogruId: string, sayi = 3): string[] {
  const diger = makamDefler.filter(m => m.id !== dogruId);
  return karistir(diger).slice(0, sayi).map(m => m.turAdi);
}

function yanlisPerdeler(makamId: string, dogruAd: string, sayi = 3): string[] {
  const makam = getMakamDef(makamId);
  if (!makam) return [];
  return karistir(makam.dereceler.filter(d => d.turAdi !== dogruAd)).slice(0, sayi).map(d => d.turAdi);
}

// Egzersiz soru üreteci
export function soruOlustur(tip: EgzersizTip, makamId: string, seviye: EgzersizSeviye = 'orta'): IEgzersizSoru {
  const makam = getMakamDef(makamId);
  if (!makam) throw new Error(`Makam bulunamadı: ${makamId}`);

  const id = `${tip}-${makamId}-${Date.now()}`;

  switch (tip) {

    case 'dizi-dinlet': {
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} makamının dizisini dinledin. Bu dizi hangi makama aittir?`,
        secenekler: karistir([makam.turAdi, ...yanlisMakamlar(makamId)]),
        dogruCevap: makam.turAdi,
        ipucu: `Bu makamın durağı ${makam.dereceler.find(d => d.rol === 'karar')?.turAdi}`,
        puan: 10,
      };
    }

    case 'seyir-dinlet': {
      const cumle = rastgele(makam.seyirCumleleri);
      return {
        id, tip, makamId,
        soru: `"${cumle.baslik}" cümlesini dinledin. Bu hangi makama ait bir seyir kalıbı?`,
        secenekler: karistir([makam.turAdi, ...yanlisMakamlar(makamId)]),
        dogruCevap: makam.turAdi,
        ipucu: cumle.aciklama,
        puan: 15,
      };
    }

    case 'eksik-nota-bul': {
      // Diziden bir derece kaldır, hangisi eksik?
      const eksikDerece = rastgele(makam.dereceler.filter(d => d.rol !== 'karar'));
      const diziStr = makam.dereceler
        .map(d => d.index === eksikDerece.index ? '___' : d.turAdi)
        .join(' - ');
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} dizisinde eksik nota hangisi?\n${diziStr}`,
        secenekler: karistir([eksikDerece.turAdi, ...yanlisPerdeler(makamId, eksikDerece.turAdi)]),
        dogruCevap: eksikDerece.turAdi,
        ipucu: `Kümülatif koma: ${eksikDerece.komaKumulatif}`,
        puan: 20,
      };
    }

    case 'dogru-perdeyi-sec': {
      const hedefDerece = rastgele(makam.dereceler.filter(d => d.rol !== 'karar'));
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} makamında ${hedefDerece.komaKumulatif}. komada hangi perde yer alır?`,
        secenekler: karistir([hedefDerece.turAdi, ...yanlisPerdeler(makamId, hedefDerece.turAdi)]),
        dogruCevap: hedefDerece.turAdi,
        ipucu: `Bu perde ${hedefDerece.hz.toFixed(0)} Hz civarındadır.`,
        puan: 20,
      };
    }

    case 'makam-tahmin': {
      const karakter = makam.karakterAciklama.split('.')[0]; // İlk cümle
      return {
        id, tip, makamId,
        soru: `"${karakter}" — Bu açıklama hangi makama aittir?`,
        secenekler: karistir([makam.turAdi, ...yanlisMakamlar(makamId)]),
        dogruCevap: makam.turAdi,
        ipucu: `Seyir tipi: ${makam.seyirTipi}`,
        puan: 15,
      };
    }

    case 'iki-makam-karsilastir': {
      const diger = rastgele(makamDefler.filter(m => m.id !== makamId));
      const aynıSeyir = makam.seyirTipi === diger.seyirTipi;
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} ve ${diger.turAdi} makamlarının seyir tipleri aynı mıdır?`,
        secenekler: ['Evet, ikisi de aynı', 'Hayır, farklılar'],
        dogruCevap: aynıSeyir ? 'Evet, ikisi de aynı' : 'Hayır, farklılar',
        ipucu: `${makam.turAdi}: ${makam.seyirTipi} | ${diger.turAdi}: ${diger.seyirTipi}`,
        puan: 10,
      };
    }

    case 'inici-cikici-ayirt': {
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} makamının seyir tipi nedir?`,
        secenekler: karistir(['çıkıcı', 'inici', 'inici-çıkıcı']),
        dogruCevap: makam.seyirTipi === 'cikici' ? 'çıkıcı' : makam.seyirTipi === 'inici' ? 'inici' : 'inici-çıkıcı',
        ipucu: makam.karakterAciklama.split('.')[0],
        puan: 10,
      };
    }

    case 'guclu-perdesi-bul': {
      const guclu = makam.dereceler.find(d => d.rol === 'guclu');
      if (!guclu) throw new Error(`Güçlü perde yok: ${makamId}`);
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} makamının güçlü perdesi hangisidir?`,
        secenekler: karistir([guclu.turAdi, ...yanlisPerdeler(makamId, guclu.turAdi)]),
        dogruCevap: guclu.turAdi,
        ipucu: 'Güçlü perde seyirde en çok durulan, üzerinde yoğunlaşılan perdedir.',
        puan: 15,
      };
    }

    case 'karar-sesi-bul': {
      const karar = makam.dereceler.find(d => d.rol === 'karar');
      if (!karar) throw new Error(`Karar perde yok: ${makamId}`);
      return {
        id, tip, makamId,
        soru: `${makam.turAdi} makamının karar perdesi (durağı) hangisidir?`,
        secenekler: karistir([karar.turAdi, ...yanlisPerdeler(makamId, karar.turAdi)]),
        dogruCevap: karar.turAdi,
        ipucu: 'Karar perdesi seyirin bittiği, dinlendiği perdedir.',
        puan: 10,
      };
    }

    default:
      throw new Error(`Bilinmeyen egzersiz tipi: ${tip}`);
  }
}

// Cevap kontrol
export function cevapKontrol(soru: IEgzersizSoru, cevap: string | number): boolean {
  if (typeof soru.dogruCevap === 'number' && typeof cevap === 'number') {
    return Math.abs(soru.dogruCevap - cevap) < 0.1;
  }
  return String(soru.dogruCevap).trim().toLowerCase() === String(cevap).trim().toLowerCase();
}

// Seviyeye göre egzersiz tipleri
export const seviyeEgzersizler: Record<EgzersizSeviye, EgzersizTip[]> = {
  baslangic: ['dizi-dinlet', 'karar-sesi-bul', 'guclu-perdesi-bul', 'inici-cikici-ayirt'],
  orta:      ['seyir-dinlet', 'eksik-nota-bul', 'dogru-perdeyi-sec', 'makam-tahmin', 'iki-makam-karsilastir'],
  ileri:     ['seyir-dinlet', 'eksik-nota-bul', 'makam-tahmin', 'iki-makam-karsilastir', 'inici-cikici-ayirt'],
};

export const egzersizAciklamalari: Record<EgzersizTip, { baslik: string; aciklama: string; emoji: string }> = {
  'dizi-dinlet':           { baslik: 'Dizi Tanı',        aciklama: 'Çalınan diziyi dinle, makamı bul',        emoji: '🎵' },
  'seyir-dinlet':          { baslik: 'Seyir Tanı',        aciklama: 'Seyir cümlesini dinle, makamı bul',       emoji: '🎼' },
  'eksik-nota-bul':        { baslik: 'Eksik Nota',        aciklama: 'Dizide hangi nota eksik?',                emoji: '🔍' },
  'dogru-perdeyi-sec':     { baslik: 'Perde Bul',         aciklama: 'Verilen komada hangi perde var?',         emoji: '🎯' },
  'makam-tahmin':          { baslik: 'Makam Tahmin',      aciklama: 'Karakteri oku, makamı tahmin et',         emoji: '🧠' },
  'iki-makam-karsilastir': { baslik: 'Karşılaştır',      aciklama: 'İki makamı karşılaştır',                  emoji: '⚖️' },
  'inici-cikici-ayirt':    { baslik: 'Seyir Tipi',        aciklama: 'Makamın seyir tipini belirle',            emoji: '↕️' },
  'guclu-perdesi-bul':     { baslik: 'Güçlü Perde',       aciklama: 'Makamın güçlü perdesini bul',             emoji: '💪' },
  'karar-sesi-bul':        { baslik: 'Karar Perdesi',     aciklama: 'Makamın durağını bul',                    emoji: '🏁' },
};
