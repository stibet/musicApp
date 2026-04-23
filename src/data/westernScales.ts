// westernScales.ts — Genişletilmiş Batı Gamları

export interface Gam {
  id: string;
  isim: string; isimEn: string;
  tip: 'major' | 'minor' | 'mod' | 'pentatonik' | 'diger';
  yariSesler: number[];
  aciklama: string; aciklamaEn: string;
  karakter: string[];
  kullanimAlanlari: string[];
  ornekTonlar: string[];
  ornekEserler: string[];
  ilgiliGamlar: string[];
  karakteristikAralik: string;
  dereceFormuller: string;
  zorluk: 1 | 2 | 3;
}

export const batıGamları: Gam[] = [
  {
    id: 'major', isim: 'Majör Gam', isimEn: 'Major Scale', tip: 'major',
    yariSesler: [2,2,1,2,2,2,1],
    aciklama: 'Batı müziğinin temel gamıdır. Parlak, neşeli ve kararlı bir his verir. Tüm majör tonalite bu gam üzerine inşa edilmiştir.',
    aciklamaEn: 'The foundation of Western music. Bright, joyful and decisive.',
    karakter: ['neşeli','parlak','kararlı','umut dolu'],
    kullanimAlanlari: ['Klasik','Pop','Rock','Caz','Folk'],
    ornekTonlar: ['Do Majör','Sol Majör','Re Majör','Fa Majör'],
    ornekEserler: ['Beethoven - Ode to Joy','Beatles - Let It Be','Vivaldi - Dört Mevsim İlkbahar'],
    ilgiliGamlar: ['lydian','mixolydian','pentatonic-major'],
    karakteristikAralik: 'Büyük 3. (Do-Mi): majörün "mutlu" karakterini verir',
    dereceFormuller: '1 – 2 – 3 – 4 – 5 – 6 – 7', zorluk: 1,
  },
  {
    id: 'natural-minor', isim: 'Doğal Minör', isimEn: 'Natural Minor', tip: 'minor',
    yariSesler: [2,1,2,2,1,2,2],
    aciklama: 'Majörün paralel minörüdür. Hüzünlü, karanlık ve duygusal. 3., 6. ve 7. dereceler pesttir.',
    aciklamaEn: 'The parallel minor of major. Melancholic and dark. 3rd, 6th and 7th lowered.',
    karakter: ['hüzünlü','karanlık','duygusal','içli'],
    kullanimAlanlari: ['Klasik','Rock','Metal','Folk','Flamenco'],
    ornekTonlar: ['La Minör','Re Minör','Mi Minör','Sol Minör'],
    ornekEserler: ['Beethoven - Moonlight Sonata','Metallica - Nothing Else Matters','Bach - Toccata Re Minör'],
    ilgiliGamlar: ['harmonic-minor','melodic-minor','dorian'],
    karakteristikAralik: 'Küçük 3. (Do-Mi♭): minörün "hüzünlü" karakterini verir',
    dereceFormuller: '1 – 2 – ♭3 – 4 – 5 – ♭6 – ♭7', zorluk: 1,
  },
  {
    id: 'harmonic-minor', isim: 'Harmonik Minör', isimEn: 'Harmonic Minor', tip: 'minor',
    yariSesler: [2,1,2,2,1,3,1],
    aciklama: 'Doğal minörün 7. derecesi yarım ses tizleştirilmiştir. 6. ile 7. arasında arttırılmış ikili (3 yarım ses) oluşur. Dramatik ve egzotik.',
    aciklamaEn: '7th degree raised. Creates augmented second between 6th and 7th. Dramatic and exotic.',
    karakter: ['dramatik','egzotik','gerilimli','güçlü'],
    kullanimAlanlari: ['Klasik','Metal','Flamenco','Orta Doğu','Film müziği'],
    ornekTonlar: ['La Harmonik Minör','Re Harmonik Minör','Mi Harmonik Minör'],
    ornekEserler: ['Bach - Keman Partitası No.2','Yngwie Malmsteen - Far Beyond the Sun','Rimsky-Korsakov - Şehrazat'],
    ilgiliGamlar: ['natural-minor','phrygian-dominant'],
    karakteristikAralik: 'Arttırılmış ikili (♭6–7): 3 yarım ses boşluk, egzotik his',
    dereceFormuller: '1 – 2 – ♭3 – 4 – 5 – ♭6 – 7', zorluk: 2,
  },
  {
    id: 'melodic-minor', isim: 'Melodik Minör', isimEn: 'Melodic Minor', tip: 'minor',
    yariSesler: [2,1,2,2,2,2,1],
    aciklama: 'Doğal minörün 6. ve 7. dereceleri tizleştirilmiştir. Cazda her iki yönde kullanılır. Sofistike ve akıcı.',
    aciklamaEn: 'Natural minor with raised 6th and 7th. Used both ways in jazz.',
    karakter: ['akıcı','sofistike','modern','caz'],
    kullanimAlanlari: ['Caz','Klasik','Füzyon'],
    ornekTonlar: ['La Melodik Minör','Re Melodik Minör'],
    ornekEserler: ['John Coltrane - Impressions','Bill Evans - Waltz for Debby'],
    ilgiliGamlar: ['natural-minor','harmonic-minor','dorian'],
    karakteristikAralik: '♭3 + majör 6. ve 7. aynı anda: minör ama parlak üst dereceler',
    dereceFormuller: '1 – 2 – ♭3 – 4 – 5 – 6 – 7', zorluk: 2,
  },
  {
    id: 'dorian', isim: 'Dorian Mod', isimEn: 'Dorian Mode', tip: 'mod',
    yariSesler: [2,1,2,2,2,1,2],
    aciklama: 'Majör gamın 2. derecesinden başlar. Minöre benzer ama 6. derecesi majördür. "Minör ama umutlu" karakteri. Caz ve rock\'ta çok yaygın.',
    aciklamaEn: '2nd mode of major. Like minor but with major 6th. "Minor but hopeful."',
    karakter: ['minör ama umutlu','groovy','serin','folk'],
    kullanimAlanlari: ['Caz','Rock','Blues','Folk','Funk'],
    ornekTonlar: ['Re Dorian','Mi Dorian','La Dorian'],
    ornekEserler: ['Miles Davis - So What','Santana - Oye Como Va','Pink Floyd - Another Brick in the Wall'],
    ilgiliGamlar: ['natural-minor','mixolydian'],
    karakteristikAralik: 'Majör 6. derece: ♭3 ile 6 kombinasyonu, minörden parlak',
    dereceFormuller: '1 – 2 – ♭3 – 4 – 5 – 6 – ♭7', zorluk: 2,
  },
  {
    id: 'phrygian', isim: 'Frigyen Mod', isimEn: 'Phrygian Mode', tip: 'mod',
    yariSesler: [1,2,2,2,1,2,2],
    aciklama: 'Majör gamın 3. derecesinden başlar. ♭2 (pest ikinci derece) karakteristik özelliğidir. Çok karanlık ve egzotik. İspanyol, Flamenco ve Metal müziğinin vazgeçilmezidir.',
    aciklamaEn: '3rd mode of major. ♭2 is its signature. Very dark. Essential in flamenco and metal.',
    karakter: ['karanlık','egzotik','İspanyol','gerilimli'],
    kullanimAlanlari: ['Flamenco','Metal','İspanyol müziği','Film müziği'],
    ornekTonlar: ['Mi Frigyen','La Frigyen','Re Frigyen'],
    ornekEserler: ['Metallica - Wherever I May Roam','Rodrigo - Concierto de Aranjuez'],
    ilgiliGamlar: ['phrygian-dominant','natural-minor'],
    karakteristikAralik: 'Küçük 2. (♭2): ilk adımda yarım ses — çok karanlık açılış',
    dereceFormuller: '1 – ♭2 – ♭3 – 4 – 5 – ♭6 – ♭7', zorluk: 2,
  },
  {
    id: 'phrygian-dominant', isim: 'Frigyen Dominant', isimEn: 'Phrygian Dominant', tip: 'mod',
    yariSesler: [1,3,1,2,1,2,2],
    aciklama: 'Harmonik minörün 5. derecesinden türetilir. ♭2 ve büyük 3. aynı anda — çok egzotik, Orta Doğu\'ya has. Flamenco\'nun en önemli modlarından biri.',
    aciklamaEn: '5th mode of harmonic minor. ♭2 and major 3rd coexist — very exotic, Middle Eastern.',
    karakter: ['Orta Doğu','dramatik','flamenco','tapınak'],
    kullanimAlanlari: ['Flamenco','Orta Doğu müziği','Metal','Film müziği'],
    ornekTonlar: ['Mi Frigyen Dominant','La Frigyen Dominant'],
    ornekEserler: ['Joe Satriani - Surfing with the Alien','Misirlou (Dick Dale)'],
    ilgiliGamlar: ['phrygian','harmonic-minor'],
    karakteristikAralik: '♭2 + büyük 3. birlikte: arttırılmış ikili içerir',
    dereceFormuller: '1 – ♭2 – 3 – 4 – 5 – ♭6 – ♭7', zorluk: 3,
  },
  {
    id: 'lydian', isim: 'Lidyen Mod', isimEn: 'Lydian Mode', tip: 'mod',
    yariSesler: [2,2,2,1,2,2,1],
    aciklama: 'Majör gamın 4. derecesinden başlar. ♯4 (tiz dörtlü) majörden daha parlak ve mistik bir karakter kazandırır. Film müziği ve Caz\'da çok kullanılır.',
    aciklamaEn: '4th mode of major. ♯4 gives it a dreamy quality brighter than major.',
    karakter: ['mistik','hayali','uçuş hissi','parlak'],
    kullanimAlanlari: ['Film müziği','Caz','Pop','Ambient'],
    ornekTonlar: ['Fa Lidyen','Sol Lidyen','Re Lidyen'],
    ornekEserler: ['John Williams - E.T. tema','Simpsons tema','Joe Satriani - Flying in a Blue Dream'],
    ilgiliGamlar: ['major','mixolydian'],
    karakteristikAralik: 'Arttırılmış 4. (♯4): majörden tek fark, büyük mistiklik',
    dereceFormuller: '1 – 2 – 3 – ♯4 – 5 – 6 – 7', zorluk: 2,
  },
  {
    id: 'mixolydian', isim: 'Miksolidyen Mod', isimEn: 'Mixolydian Mode', tip: 'mod',
    yariSesler: [2,2,1,2,2,1,2],
    aciklama: 'Majör gamın 5. derecesinden başlar. Majöre benzer ama 7. derecesi pesttir (♭7). Blues, Rock ve Folk\'ta dominant akorların üzerinde çok kullanılır.',
    aciklamaEn: '5th mode of major. Major with ♭7. The rock and blues essential.',
    karakter: ['blues','rock','sıcak','dominant'],
    kullanimAlanlari: ['Blues','Rock','Folk','Country','Caz'],
    ornekTonlar: ['Sol Miksolidyen','Re Miksolidyen','La Miksolidyen'],
    ornekEserler: ['Doors - Light My Fire','Norwegian Wood - Beatles','Sweet Home Chicago'],
    ilgiliGamlar: ['major','dorian','blues'],
    karakteristikAralik: 'Pest 7. (♭7): majörün yedincisi pesttir — blues ve rock karakteri',
    dereceFormuller: '1 – 2 – 3 – 4 – 5 – 6 – ♭7', zorluk: 2,
  },
  {
    id: 'locrian', isim: 'Lokryen Mod', isimEn: 'Locrian Mode', tip: 'mod',
    yariSesler: [1,2,2,1,2,2,2],
    aciklama: 'Majör gamın 7. derecesinden başlar. 5. derecesi de pesttir (♭5). Çok gerilimli ve kararsız. Pratikte en az kullanılan mod.',
    aciklamaEn: '7th mode of major. ♭5 makes it very tense and unstable. Rarely used in practice.',
    karakter: ['gerilimli','kararsız','karanlık','avangard'],
    kullanimAlanlari: ['Metal','Avangard','Teorik çalışma'],
    ornekTonlar: ['Si Lokryen','Mi Lokryen'],
    ornekEserler: ['Teorik çalışma','Avangard kompozisyon'],
    ilgiliGamlar: ['phrygian','harmonic-minor'],
    karakteristikAralik: 'Azalmış 5. (♭5/tritone): en gerilimli aralık, yok kararlılık',
    dereceFormuller: '1 – ♭2 – ♭3 – 4 – ♭5 – ♭6 – ♭7', zorluk: 3,
  },
  {
    id: 'pentatonic-major', isim: 'Majör Pentatonik', isimEn: 'Major Pentatonic', tip: 'pentatonik',
    yariSesler: [2,2,3,2,3],
    aciklama: 'Majör gamın 4. ve 7. dereceleri çıkarılmıştır. 5 sesten oluşur. Her tona uyar, çok yönlüdür.',
    aciklamaEn: 'Major scale without 4th and 7th. 5 notes. Highly versatile.',
    karakter: ['neşeli','evrensel','folk','çok yönlü'],
    kullanimAlanlari: ['Rock','Pop','Blues','Folk','Country','Caz'],
    ornekTonlar: ['Do Majör Pentatonik','Sol Majör Pentatonik','Re Majör Pentatonik'],
    ornekEserler: ['Amazing Grace','My Girl - Temptations','Country Road - John Denver'],
    ilgiliGamlar: ['major','pentatonic-minor'],
    karakteristikAralik: '4. ve 7. yok: hiç yarım ses yok — tamamen akıcı',
    dereceFormuller: '1 – 2 – 3 – 5 – 6', zorluk: 1,
  },
  {
    id: 'pentatonic-minor', isim: 'Minör Pentatonik', isimEn: 'Minor Pentatonic', tip: 'pentatonik',
    yariSesler: [3,2,2,3,2],
    aciklama: 'Blues ve rock gitarın temel gamıdır. Doğal minörün 2. ve 6. dereceleri çıkarılmıştır. Gitar soloları için en yaygın tercih.',
    aciklamaEn: 'The essential guitar solo scale. Natural minor without 2nd and 6th.',
    karakter: ['blues','gitar','rock','güçlü'],
    kullanimAlanlari: ['Blues','Rock','Metal','Pop','R&B'],
    ornekTonlar: ['La Minör Pentatonik','Mi Minör Pentatonik','Re Minör Pentatonik'],
    ornekEserler: ['Jimi Hendrix - Purple Haze','Eric Clapton - Crossroads','Led Zeppelin - Stairway (solo)'],
    ilgiliGamlar: ['natural-minor','pentatonic-major','blues'],
    karakteristikAralik: '♭3 ve ♭7 arka arkaya: blues hissinin temeli',
    dereceFormuller: '1 – ♭3 – 4 – 5 – ♭7', zorluk: 1,
  },
  {
    id: 'blues', isim: 'Blues Gamı', isimEn: 'Blues Scale', tip: 'pentatonik',
    yariSesler: [3,2,1,1,3,2],
    aciklama: 'Minör pentatoniğe "blue note" (♭5/♯4) eklenerek elde edilir. Bu ekstra nota gerginlik ve blues karakterini yaratır.',
    aciklamaEn: 'Minor pentatonic plus the blue note (♭5). Creates blues tension.',
    karakter: ['blues','gerilimli','ifadeli','duygusal'],
    kullanimAlanlari: ['Blues','Rock','Jazz','R&B','Soul'],
    ornekTonlar: ['La Blues','Mi Blues','Sol Blues'],
    ornekEserler: ['BB King - The Thrill is Gone','Stevie Ray Vaughan - Pride and Joy','Gary Moore - Still Got the Blues'],
    ilgiliGamlar: ['pentatonic-minor','dorian'],
    karakteristikAralik: 'Blue note (♭5): minör pentatonik + tritone gerilimi',
    dereceFormuller: '1 – ♭3 – 4 – ♭5 – 5 – ♭7', zorluk: 2,
  },
  {
    id: 'whole-tone', isim: 'Tam Ses Gamı', isimEn: 'Whole Tone Scale', tip: 'diger',
    yariSesler: [2,2,2,2,2,2],
    aciklama: 'Tamamı tam seslerden oluşur. 6 notası vardır ve her derece birbirinden eşit uzaklıktadır. Belirsiz ve yüzen bir his verir. Debussy bu gamı çok kullanmıştır.',
    aciklamaEn: 'All whole tones. 6 notes equally spaced. Floating and ambiguous. Loved by Debussy.',
    karakter: ['belirsiz','yüzen','empresyonist','simetrik'],
    kullanimAlanlari: ['Empresyonizm','Caz','Film müziği','Avangard'],
    ornekTonlar: ['Do Tam Ses','Re♭ Tam Ses'],
    ornekEserler: ['Debussy - Voiles','Debussy - La Cathédrale engloutie'],
    ilgiliGamlar: ['lydian'],
    karakteristikAralik: 'Tüm aralıklar tam ses: ağırlık merkezi yok, sürekli belirsizlik',
    dereceFormuller: '1 – 2 – 3 – ♯4 – ♯5 – ♭7', zorluk: 3,
  },
  {
    id: 'diminished', isim: 'Azalmış Gam', isimEn: 'Diminished Scale', tip: 'diger',
    yariSesler: [2,1,2,1,2,1,2,1],
    aciklama: 'Tam ses-yarım ses-tam ses-yarım ses şeklinde tekrar eden simetrik bir gamdır. 8 seslidir. Gerilim ve gizem yaratır. Caz ve klasik müzikte kullanılır.',
    aciklamaEn: 'Symmetrical alternating whole-half pattern. 8 notes. Creates tension and mystery.',
    karakter: ['gerilimli','gizemli','simetrik','chromatic'],
    kullanimAlanlari: ['Caz','Klasik','Film müziği','Avangard'],
    ornekTonlar: ['Do Azalmış','Re Azalmış'],
    ornekEserler: ['Coltrane - Giant Steps (kısmen)','Stravinsky - Ateş Kuşu'],
    ilgiliGamlar: ['locrian','whole-tone'],
    karakteristikAralik: 'Tam-yarım dönüşümlü: 2 tonun simetrik bölüşümü',
    dereceFormuller: '1 – 2 – ♭3 – 4 – ♭5 – ♭6 – 6 – 7', zorluk: 3,
  },
];

export function gamBul(id: string): Gam | undefined {
  return batıGamları.find(g => g.id === id);
}

export const TIP_ISIM: Record<string, string> = {
  major: 'Majör', minor: 'Minör', mod: 'Mod', pentatonik: 'Pentatonik', diger: 'Diğer'
};
export const TIP_RENK: Record<string, string> = {
  major: '#10B981', minor: '#EF4444', mod: '#8B5CF6', pentatonik: '#F59E0B', diger: '#6B7280'
};
