export interface Gam {
  id: string; isim: string; isimEn: string; tip: 'major' | 'minor' | 'mod' | 'pentatonik';
  yariSesler: number[]; aciklama: string; aciklamaEn: string; ornekTonlar: string[]; zorluk: 1 | 2 | 3;
}
export const batıGamları: Gam[] = [
  { id: 'major', isim: 'Majör Gam', isimEn: 'Major Scale', tip: 'major', yariSesler: [2, 2, 1, 2, 2, 2, 1],
    aciklama: 'Neşeli ve parlak karakterli, Batı müziğinin temel gamıdır.', aciklamaEn: 'Joyful and bright, the fundamental scale of Western music.', ornekTonlar: ['Do Majör', 'Sol Majör', 'Re Majör'], zorluk: 1 },
  { id: 'natural-minor', isim: 'Doğal Minör', isimEn: 'Natural Minor', tip: 'minor', yariSesler: [2, 1, 2, 2, 1, 2, 2],
    aciklama: 'Hüzünlü ve karanlık karakterli, en yaygın minör gamdır.', aciklamaEn: 'Melancholic and dark, the most common minor scale.', ornekTonlar: ['La Minör', 'Re Minör', 'Mi Minör'], zorluk: 1 },
  { id: 'harmonic-minor', isim: 'Harmonik Minör', isimEn: 'Harmonic Minor', tip: 'minor', yariSesler: [2, 1, 2, 2, 1, 3, 1],
    aciklama: 'Doğal minörün 7. derecesi yarım ses tizleştirilmiştir. Dramatik ve egzotik bir his verir.', aciklamaEn: 'The 7th degree of natural minor is raised. Gives a dramatic and exotic feel.', ornekTonlar: ['La Harmonik Minör', 'Re Harmonik Minör'], zorluk: 2 },
  { id: 'dorian', isim: 'Dorian Mod', isimEn: 'Dorian Mode', tip: 'mod', yariSesler: [2, 1, 2, 2, 2, 1, 2],
    aciklama: 'Minöre benzer ama 6. derecesi majördür. Jazz ve folk\'ta çok kullanılır.', aciklamaEn: 'Similar to minor but with a major 6th. Widely used in jazz and folk.', ornekTonlar: ['Re Dorian', 'Mi Dorian'], zorluk: 2 },
  { id: 'phrygian', isim: 'Frigyen Mod', isimEn: 'Phrygian Mode', tip: 'mod', yariSesler: [1, 2, 2, 2, 1, 2, 2],
    aciklama: 'Karanlık ve egzotik karakterli. İspanyol ve flamenco müziğinde sıkça görülür.', aciklamaEn: 'Dark and exotic. Frequently found in Spanish and flamenco music.', ornekTonlar: ['Mi Frigyen', 'La Frigyen'], zorluk: 2 },
  { id: 'lydian', isim: 'Lidyen Mod', isimEn: 'Lydian Mode', tip: 'mod', yariSesler: [2, 2, 2, 1, 2, 2, 1],
    aciklama: 'Majörden parlak ve gizemli. 4. derecesi tizleştirilmiştir. Film müziğinde çok kullanılır.', aciklamaEn: 'Brighter than major. Raised 4th degree. Widely used in film music.', ornekTonlar: ['Fa Lidyen', 'Sol Lidyen'], zorluk: 2 },
  { id: 'mixolydian', isim: 'Miksolidyen Mod', isimEn: 'Mixolydian Mode', tip: 'mod', yariSesler: [2, 2, 1, 2, 2, 1, 2],
    aciklama: 'Majöre benzer ama 7. derecesi pesttir. Blues ve rock\'ta yaygındır.', aciklamaEn: 'Similar to major but with a lowered 7th. Common in blues and rock.', ornekTonlar: ['Sol Miksolidyen', 'Re Miksolidyen'], zorluk: 2 },
  { id: 'pentatonic-major', isim: 'Majör Pentatonik', isimEn: 'Major Pentatonic', tip: 'pentatonik', yariSesler: [2, 2, 3, 2, 3],
    aciklama: '5 sesli gam. Rock, blues ve folk müziğinin vazgeçilmezidir.', aciklamaEn: '5-note scale. Essential in rock, blues and folk.', ornekTonlar: ['Do Pentatonik', 'Sol Pentatonik'], zorluk: 1 },
  { id: 'pentatonic-minor', isim: 'Minör Pentatonik', isimEn: 'Minor Pentatonic', tip: 'pentatonik', yariSesler: [3, 2, 2, 3, 2],
    aciklama: 'Blues ve rock gitarın temel gamı. 5 sesten oluşur.', aciklamaEn: 'The fundamental scale of blues and rock guitar. 5 notes.', ornekTonlar: ['La Minör Pentatonik', 'Mi Minör Pentatonik'], zorluk: 1 },
  { id: 'blues', isim: 'Blues Gamı', isimEn: 'Blues Scale', tip: 'pentatonik', yariSesler: [3, 2, 1, 1, 3, 2],
    aciklama: 'Minör pentatoniğe "blue note" eklenerek elde edilir. Blues\'un karakteristik sesi.', aciklamaEn: 'Minor pentatonic plus the "blue note". The characteristic sound of blues.', ornekTonlar: ['La Blues', 'Mi Blues'], zorluk: 2 },
];