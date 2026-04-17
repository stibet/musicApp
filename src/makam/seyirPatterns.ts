// seyirPatterns.ts
// Her makam için:
//   - Seyir yönü (çıkıcı/inici/inici-çıkıcı)
//   - Tipik açılış cümlesi
//   - Karakteristik motifler
//   - Karar hareketi (yedenden karara geliş)
//   - Güçlü vurgusu

export type SeyirYon = 'cikici' | 'inici' | 'inici-cikici';

export interface SeyirCumlesi {
  id: string;
  baslik: string;
  aciklama: string;
  // Derece indexleri (0 = karar)
  dereceler: number[];
  // Müzik teorisi notası
  not?: string;
}

export interface MakamSeyir {
  makamId: string;
  yon: SeyirYon;
  karakterAciklama: string;
  acilisMotifi: number[];        // Seyirin başladığı derece sırası
  karakteristikMotif: number[];  // Makamı tanımlayan karakteristik cümle
  gucluVurgu: number[];          // Güçlü perde çevresi
  kararHareketi: number[];       // Yedenden karara geliş
  tipikCumleler: SeyirCumlesi[];
}

export const seyirKaliplari: Record<string, MakamSeyir> = {

  // ────────────────────────────────────────────────────────────────
  rast: {
    makamId: 'rast',
    yon: 'cikici',
    karakterAciklama: 'Rast neşeli ve dengeli bir makamdır. Seyir aşağıdan yukarı doğru çıkar, güçlü Re üzerinde durur ve yavaşça karara Sol\'e döner. Si koma♭ perdesi Batı Si♭\'inden biraz tiz çalınır.',
    acilisMotifi: [0, 1, 2, 3],           // Sol La Si♭k Do
    karakteristikMotif: [0, 1, 2, 3, 4, 3, 2, 1, 0], // Sol La Si♭k Do Re Do Si♭k La Sol
    gucluVurgu: [3, 4, 5, 4, 3],          // Do Re Mi Re Do (güçlü Re çevresi)
    kararHareketi: [6, 7, 6, 0],          // Fa♯k Sol Fa♯k Sol (yeden hareketi)
    tipikCumleler: [
      {
        id: 'rast_acilis',
        baslik: 'Rast Açılışı',
        aciklama: 'Karar Sol\'den güçlü Re\'ye doğru çıkıcı hareket',
        dereceler: [0, 1, 2, 3, 4],
        not: 'Si koma♭ Batı Si♭\'inden 15 cent tiz çalınır',
      },
      {
        id: 'rast_karar',
        baslik: 'Karar Cümlesi',
        aciklama: 'Fa♯ koma♭ yedenden Sol kararına iniş',
        dereceler: [5, 4, 3, 2, 6, 7, 0],
        not: 'Fa♯ koma♭ yeden perdesi, Sol\'e güçlü çekim yapar',
      },
      {
        id: 'rast_guclu',
        baslik: 'Güçlü Vurgusu',
        aciklama: 'Re güçlü perdesi üzerinde dolaşım',
        dereceler: [3, 4, 5, 4, 3, 2, 1, 0],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  hicaz: {
    makamId: 'hicaz',
    yon: 'inici-cikici',
    karakterAciklama: 'Hicaz dramatik ve hüzünlü bir makamdır. Karakterini Mi♭ koma ile Fa♯ arasındaki büyük artık ikili (13 koma) verir. Seyir genellikle orta bölgeden başlar, güçlü La\'ya çıkar ve Re kararına iner.',
    acilisMotifi: [0, 1, 2, 3],           // Re Mi♭k Fa♯ Sol
    karakteristikMotif: [0, 1, 2, 3, 2, 1, 0], // Re Mi♭k Fa♯ Sol Fa♯ Mi♭k Re (karakteristik artık ikili)
    gucluVurgu: [3, 4, 5, 4, 3],          // Sol La Si♭k La Sol (güçlü La çevresi)
    kararHareketi: [6, 5, 4, 3, 2, 1, 0], // Do♯ Si♭k La Sol Fa♯ Mi♭k Re
    tipikCumleler: [
      {
        id: 'hicaz_karakteristik',
        baslik: 'Hicaz Karakteri',
        aciklama: 'Mi♭ koma ile Fa♯ arasındaki büyük artık ikili',
        dereceler: [0, 1, 2, 1, 0],
        not: 'Bu aralık 13 koma ≈ 295 cent — Hicaz\'ın sesi buradan gelir',
      },
      {
        id: 'hicaz_guclu',
        baslik: 'Güçlüye Çıkış',
        aciklama: 'Re\'den La güçlüsüne çıkıcı hareket',
        dereceler: [0, 1, 2, 3, 4],
      },
      {
        id: 'hicaz_karar',
        baslik: 'Karar Dönüşü',
        aciklama: 'La\'dan Re kararına iniş',
        dereceler: [4, 5, 4, 3, 2, 1, 0],
        not: 'Si♭ koma yeden perdesi, Re kararına çekim yapar',
      },
      {
        id: 'hicaz_tam',
        baslik: 'Tam Hicaz Cümlesi',
        aciklama: 'Karakteristik açılış ve karar',
        dereceler: [0, 1, 2, 3, 4, 3, 2, 1, 0],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  usak: {
    makamId: 'usak',
    yon: 'inici',
    karakterAciklama: 'Uşşak hüzünlü ve içlidir. İnici seyiriyle yukarıdan aşağı doğru hareket eder. Re güçlüsünden La kararına doğru süzülür.',
    acilisMotifi: [3, 2, 1, 0],           // Re Do Si♭k La (inici)
    karakteristikMotif: [3, 2, 1, 0, 1, 2, 3], // Re Do Si♭k La Si♭k Do Re
    gucluVurgu: [3, 4, 3, 2, 3],          // Re Mi Re Do Re (güçlü Re)
    kararHareketi: [2, 1, 0],             // Do Si♭k La
    tipikCumleler: [
      {
        id: 'usak_inici',
        baslik: 'İnici Açılış',
        aciklama: 'Güçlü Re\'den karar La\'ya iniş',
        dereceler: [3, 2, 1, 0],
        not: 'Si koma♭ Uşşak\'ta Rast\'tan daha pest çalınır (8 koma = 181 cent)',
      },
      {
        id: 'usak_karar',
        baslik: 'Karar Hareketi',
        aciklama: 'La kararına geliş',
        dereceler: [2, 1, 2, 1, 0],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  huseyni: {
    makamId: 'huseyni',
    yon: 'inici-cikici',
    karakterAciklama: 'Hüseyni olgun ve asil karakterlidir. Si tam ve Do koma perdeleri makamı karakterize eder.',
    acilisMotifi: [0, 1, 2, 3],
    karakteristikMotif: [4, 3, 2, 1, 0, 1, 2, 3, 4],
    gucluVurgu: [4, 5, 4, 3, 4],
    kararHareketi: [6, 0],
    tipikCumleler: [
      {
        id: 'huseyni_acilis',
        baslik: 'Hüseyni Açılışı',
        aciklama: 'La\'dan Mi güçlüsüne çıkıcı hareket',
        dereceler: [0, 1, 2, 3, 4],
        not: 'Do koma perdesine dikkat — Do\'dan 17 cent tiz',
      },
      {
        id: 'huseyni_karar',
        baslik: 'Karar Hareketi',
        aciklama: 'Sol koma yedenden La kararına',
        dereceler: [5, 6, 5, 4, 3, 2, 1, 0],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  nihavend: {
    makamId: 'nihavend',
    yon: 'inici-cikici',
    karakterAciklama: 'Nihavend Batı minörüne en yakın makamdır. İnici seyirinde Do♯ (harmonik) kullanılır, bu Nihavend\'in dramatik karakterini verir.',
    acilisMotifi: [0, 1, 2, 3],
    karakteristikMotif: [4, 3, 2, 1, 0],
    gucluVurgu: [4, 3, 4, 5, 4],
    kararHareketi: [6, 5, 4, 3, 2, 1, 0], // Do♯ Si♭ La Sol Fa Mi Re
    tipikCumleler: [
      {
        id: 'nihavend_acilis',
        baslik: 'Nihavend Açılışı',
        aciklama: 'Re\'den La güçlüsüne',
        dereceler: [0, 1, 2, 3, 4],
      },
      {
        id: 'nihavend_harmonik',
        baslik: 'Harmonik Karar',
        aciklama: 'Do♯ ile dramatik iniş',
        dereceler: [4, 5, 6, 5, 4, 3, 2, 1, 0],
        not: 'Do♯ perdesinin Si♭\'ye geçişi Nihavend\'in en karakteristik anı',
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────
  segah: {
    makamId: 'segah',
    yon: 'inici-cikici',
    karakterAciklama: 'Segah derin ve mistik bir makamdır. Si koma♭ ve Mi koma♭ perdeleri karakteristiktir. Tasavvuf müziğinde sıkça kullanılır.',
    acilisMotifi: [0, 1, 2, 3],
    karakteristikMotif: [3, 2, 1, 0, 1, 2, 3],
    gucluVurgu: [3, 4, 3, 2, 3],
    kararHareketi: [7, 6, 7, 0],
    tipikCumleler: [
      {
        id: 'segah_acilis',
        baslik: 'Segah Açılışı',
        aciklama: 'Si koma♭ karardan Mi koma♭ güçlüye',
        dereceler: [0, 1, 2, 3],
        not: 'Her iki perde de yarım tonun altında — derin ve yoğun karakter',
      },
      {
        id: 'segah_karar',
        baslik: 'Mistik Karar',
        aciklama: 'La yedenden Si koma♭ kararına',
        dereceler: [6, 7, 6, 0],
      },
    ],
  },
};

// Seyir yönü Türkçe açıklaması
export function seyirYonAciklama(yon: SeyirYon): string {
  const map: Record<SeyirYon, string> = {
    cikici:       '↗ Çıkıcı — aşağıdan yukarı',
    inici:        '↘ İnici — yukarıdan aşağı',
    'inici-cikici': '↕ İnici-Çıkıcı — her iki yön',
  };
  return map[yon];
}
