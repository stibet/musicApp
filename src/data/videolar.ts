export interface MakamVideo {
  id: string;
  youtubeId: string;
  baslik: string;
  aciklama: string;
  enstruman: string;
  sure: string;
  seviye: 'başlangıç' | 'orta' | 'ileri';
}

export const makamVideolari: Record<string, MakamVideo[]> = {
  hicaz: [
    {
      id: 'hicaz_1',
      youtubeId: 'NlCEFKOHVCk',
      baslik: 'Hicaz Makamı — Ud Taksimi',
      aciklama: 'Ud üzerinde Hicaz makamının karakteristik artık ikili aralığı ve dizi yürüyüşü.',
      enstruman: 'Ud', sure: '5:20', seviye: 'orta',
    },
    {
      id: 'hicaz_2',
      youtubeId: 'H3v9unphfi0',
      baslik: 'Hicaz Makamı Nedir? — Teori',
      aciklama: 'Hicaz makamının koma dizisi, perdeler ve örnek eserler üzerine açıklama.',
      enstruman: 'Piyano', sure: '9:15', seviye: 'başlangıç',
    },
  ],
  rast: [
    {
      id: 'rast_1',
      youtubeId: 'O3U6xDMbBMY',
      baslik: 'Rast Makamı — Ney Taksimi',
      aciklama: 'Ney ile Rast makamının dengeli ve huzurlu karakterini yansıtan dizi çalışması.',
      enstruman: 'Ney', sure: '6:40', seviye: 'orta',
    },
    {
      id: 'rast_2',
      youtubeId: 'Mk5vF3WGDFE',
      baslik: 'Rast Makamı Teorisi',
      aciklama: 'Rast makamının çıkıcı seyiri, güçlü perdesi ve perde dizisi.',
      enstruman: 'Ud', sure: '7:10', seviye: 'başlangıç',
    },
  ],
  usak: [
    {
      id: 'usak_1',
      youtubeId: 'fUiIGCxG8aQ',
      baslik: 'Uşşak Makamı — Taksim',
      aciklama: 'Uşşak makamının hüzünlü ve içli karakterini yansıtan taksim.',
      enstruman: 'Keman', sure: '4:50', seviye: 'orta',
    },
  ],
  huseyni: [
    {
      id: 'huseyni_1',
      youtubeId: 'UNnHMBRPMXQ',
      baslik: 'Hüseyni Makamı — Ud Taksimi',
      aciklama: 'Hüseyni makamının olgun ve asil karakterini yansıtan taksim.',
      enstruman: 'Ud', sure: '5:30', seviye: 'ileri',
    },
  ],
  nihavend: [
    {
      id: 'nihavend_1',
      youtubeId: 'VYLcMzQ5m_k',
      baslik: 'Nihavend Makamı — Keman',
      aciklama: 'Batı minörüne en yakın makam olan Nihavend\'in romantik karakteri.',
      enstruman: 'Keman', sure: '4:20', seviye: 'orta',
    },
  ],
  segah: [
    {
      id: 'segah_1',
      youtubeId: 'b1B3SXRJR6A',
      baslik: 'Segâh Makamı — Ney',
      aciklama: 'Tasavvuf müziğinde sıkça kullanılan Segâh makamının derin karakteri.',
      enstruman: 'Ney', sure: '6:00', seviye: 'ileri',
    },
  ],
};

export const seviyeRenk: Record<string, string> = {
  başlangıç: '#10B981',
  orta:       '#F59E0B',
  ileri:      '#EF4444',
};

export const seviyeLabel: Record<string, { tr: string; en: string }> = {
  başlangıç: { tr: 'Başlangıç', en: 'Beginner' },
  orta:      { tr: 'Orta',      en: 'Intermediate' },
  ileri:     { tr: 'İleri',     en: 'Advanced' },
};
