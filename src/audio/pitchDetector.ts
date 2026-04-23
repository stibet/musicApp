const NOTALAR = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];

export interface PitchResult { frekans: number; nota: string; oktav: number; clarity: number; cent: number; }

export function frekansToNota(frekans: number): PitchResult {
  const yarimSes = 12 * Math.log2(frekans / 440) + 69;
  const yuvarla = Math.round(yarimSes);
  const cent = Math.round((yarimSes - yuvarla) * 100);
  const oktav = Math.floor(yuvarla / 12) - 1;
  const notaIndex = ((yuvarla % 12) + 12) % 12;
  return { frekans: Math.round(frekans * 10) / 10, nota: NOTALAR[notaIndex], oktav, clarity: 0, cent };
}

export function komaHesapla(frekans: number, hedefFrekans: number): number {
  const centFark = 1200 * Math.log2(frekans / hedefFrekans);
  return Math.round(centFark / (1200 / 53));
}

export function makamFrekanslar(komaDizisi: number[], durakHz: number = 440): number[] {
  const centPerKoma = 1200 / 53;
  const frekanslar: number[] = [durakHz];
  let toplamCent = 0;
  for (const koma of komaDizisi) { toplamCent += koma * centPerKoma; frekanslar.push(durakHz * Math.pow(2, toplamCent / 1200)); }
  return frekanslar;
}

export function enYakinPerde(frekans: number, perdeFrekanslar: number[], perdeIsimleri: string[]): { isim: string; frekans: number; komaFark: number } {
  let enYakin = { isim: perdeIsimleri[0], frekans: perdeFrekanslar[0], komaFark: 999 };
  for (let i = 0; i < perdeFrekanslar.length; i++) {
    const koma = komaHesapla(frekans, perdeFrekanslar[i]);
    if (Math.abs(koma) < Math.abs(enYakin.komaFark)) enYakin = { isim: perdeIsimleri[i], frekans: perdeFrekanslar[i], komaFark: koma };
  }
  return enYakin;
}