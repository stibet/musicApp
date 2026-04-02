import AsyncStorage from '@react-native-async-storage/async-storage';
export type Dil = 'tr' | 'en';
const DIL_ANAHTAR = 'mizmiz_dil';
export async function dilYukle(): Promise<Dil> {
  try { return ((await AsyncStorage.getItem(DIL_ANAHTAR)) as Dil) || 'tr'; } catch { return 'tr'; }
}
export async function dilKaydet(dil: Dil) { await AsyncStorage.setItem(DIL_ANAHTAR, dil); }
export const t = {
  tr: {
    ogren: 'Öğren', pratik: 'Pratik', ilerleme: 'İlerleme', soruCoz: 'Soru Çöz',
    ansiklopedi: 'Ansiklopedi', makamListesi: 'Makam Listesi', gamListesi: 'Gam & Mod Listesi',
    gunlukSeri: 'günlük seri', kesifEt: 'Keşfet →', pratikModu: 'Pratik Modu',
    enstrumanCal: 'Enstrümanını çal, makama göre analiz et', makamSec: 'Makam Seç',
    baslat: '▶ Dinlemeye Başla', durdur: '⏹ Durdur', dogru: 'Doğru', yanlis: 'Yanlış',
    basari: 'Başarı', soruGoruldu: 'Soru Görüldü', zayifKonular: '⚠️ Zayıf Konular',
    gucluKonular: '💪 Güçlü Konular', genelBasari: 'Genel Başarı',
    hicSoruYok: 'Henüz soru çözmedin. Hadi başla!', tamamlandi: 'Tamamlandı!',
    tekrarCoz: 'Tekrar Çöz', anaSayfa: 'Ana Sayfa', sonrakiSoru: 'Sonraki Soru →',
    sonuclariGor: 'Sonuçları Gör 🏆', bugunSoruKalmadi: 'Bugünlük soru kalmadı. Yarın yeni sorular gelecek.',
    anaSayfayaDon: 'Ana Sayfaya Dön', harika: 'Harika! Çok iyi biliyorsun.',
    iyiGidiyor: 'İyi gidiyor, biraz daha pratik yap.', tekrarEt: 'Tekrar et, öğreneceksin!',
    turkMuzigi: '🕌 Türk Müziği', batiMuzigi: '🎼 Batı Müziği',
    makamlarKomalar: 'Makamlar & Komalar', gamlarModlar: 'Gamlar & Modlar',
    hakkinda: '📖 Hakkında', perdeler: '🎵 Perdeler', komaDizisi: '📏 Koma Dizisi',
    ornekEserler: '🎼 Örnek Eserler', buMakamSoruCoz: 'Bu Makamı Soru Çöz 🎯',
    buKonudanSoruCoz: 'Bu Konudan Soru Çöz 🎯', notaDizisi: '🎵 Nota Dizisi (Do üzerinden)',
    klavyeGosterimi: '🎹 Klavye Gösterimi', adimYapisi: '📏 Adım Yapısı', ornekTonlar: '🎼 Örnek Tonlar',
    durak: 'Durak', guclu: 'Güçlü', seyir: 'Seyir', zorluk: 'Zorluk', tur: 'Tür',
    sesSayisi: 'Ses Sayısı', yarimSes: 'yarım', tamSes: 'tam', geri: '← Geri',
    makamlar: 'Makamlar', gamlarVeModlar: 'Gamlar & Modlar', oktav: '1 oktav = 53 koma',
    enYakinPerde: 'En yakın perde:', biNotaCal: '🎵 Bir nota çal...',
    baslamakIcin: '🎤 Başlamak için butona bas', pest: 'pest', dogru2: 'doğru', tiz: 'tiz', makami: 'Makamı',
    komaYukarida: 'koma tiz', komaAsagida: 'koma pest',
  },
  en: {
    ogren: 'Learn', pratik: 'Practice', ilerleme: 'Progress', soruCoz: 'Quiz',
    ansiklopedi: 'Encyclopedia', makamListesi: 'Maqam List', gamListesi: 'Scales & Modes',
    gunlukSeri: 'day streak', kesifEt: 'Explore →', pratikModu: 'Practice Mode',
    enstrumanCal: 'Play your instrument and analyze by maqam', makamSec: 'Select Maqam',
    baslat: '▶ Start Listening', durdur: '⏹ Stop', dogru: 'Correct', yanlis: 'Wrong',
    basari: 'Success', soruGoruldu: 'Questions Seen', zayifKonular: '⚠️ Weak Topics',
    gucluKonular: '💪 Strong Topics', genelBasari: 'Overall Success',
    hicSoruYok: "No questions solved yet. Let's start!", tamamlandi: 'Completed!',
    tekrarCoz: 'Retry', anaSayfa: 'Home', sonrakiSoru: 'Next Question →',
    sonuclariGor: 'See Results 🏆', bugunSoruKalmadi: 'No questions left for today. New questions tomorrow.',
    anaSayfayaDon: 'Back to Home', harika: 'Amazing! You know it very well.',
    iyiGidiyor: 'Good progress, practice a bit more.', tekrarEt: "Keep trying, you'll learn!",
    turkMuzigi: '🕌 Turkish Music', batiMuzigi: '🎼 Western Music',
    makamlarKomalar: 'Maqams & Commas', gamlarModlar: 'Scales & Modes',
    hakkinda: '📖 About', perdeler: '🎵 Notes', komaDizisi: '📏 Comma Series',
    ornekEserler: '🎼 Example Pieces', buMakamSoruCoz: 'Quiz on This Maqam 🎯',
    buKonudanSoruCoz: 'Quiz on This Topic 🎯', notaDizisi: '🎵 Note Series (from C)',
    klavyeGosterimi: '🎹 Keyboard Display', adimYapisi: '📏 Step Structure', ornekTonlar: '🎼 Example Tones',
    durak: 'Tonic', guclu: 'Dominant', seyir: 'Progression', zorluk: 'Difficulty', tur: 'Type',
    sesSayisi: 'Note Count', yarimSes: 'half', tamSes: 'whole', geri: '← Back',
    makamlar: 'Maqams', gamlarVeModlar: 'Scales & Modes', oktav: '1 octave = 53 commas',
    enYakinPerde: 'Nearest note:', biNotaCal: '🎵 Play a note...',
    baslamakIcin: '🎤 Press button to start', pest: 'flat', dogru2: 'correct', tiz: 'sharp',makami: 'Maqam',
    komaYukarida: 'commas sharp', komaAsagida: 'commas flat',
  },
};
export type TercumeSozlugu = typeof t.tr;