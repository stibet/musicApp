// SolAnahtari.tsx
// Web'de inline SVG olarak çalışır.
// Platform.OS !== 'web' ise null döner (native'de react-native-svg gerekir).

import { Platform } from 'react-native';
import { C } from '../constants/Design';

// Sol anahtarında nota pozisyonları
// y koordinatı: 5 çizgi porteye göre (top = 0, bottom = portaHeight)
// Çizgiler arası mesafe: LINE_GAP

const LINE_GAP = 12;   // piksel, çizgiler arası
const LINES = 5;
const STAFF_TOP = 40;  // SVG içinde portanın başladığı y
const STAFF_HEIGHT = LINE_GAP * (LINES - 1); // 48px
const STAFF_BOTTOM = STAFF_TOP + STAFF_HEIGHT;
const NOTE_R = 6;      // nota yarıçapı

// Nota adından y pozisyonuna (sol anahtarı, C4 referans)
// Pozisyon 0 = 1. çizgi altı (C4), her +1 bir adım yukarı
// Sol anahtarı pozisyonları (diatonik nota adımları)
// C4=0, D4=1, E4=2, F4=3, G4=4, A4=5, B4=6
// Kromatik notalar yakın diatonik pozisyona iner
const NOTE_POS: Record<string, number> = {
  'G3': -3, 'G#3': -3, 'A3': -2, 'A#3': -1, 'B3': -1, 'Bb3': -1,
  'C4': 0,  'C#4': 0,  'D4': 1,  'D#4': 1,  'Eb4': 1,
  'E4': 2,  'F4': 3,   'F#4': 3, 'Gb4': 3,
  'G4': 4,  'G#4': 4,  'Ab4': 4,
  'A4': 5,  'A#4': 5,  'Bb4': 5,
  'B4': 6,  'C5': 7,   'C#5': 7, 'Db5': 7,
  'D5': 8,  'D#5': 8,  'E5': 9,  'F5': 10, 'F#5': 10, 'G5': 11, 'A5': 12, 'B5': 13,
};

// Orta Do (C4) yardımcı çizgiden başlayarak çizgilerin y konumu
// Pozisyon 0 = C4 yardımcı çizgi (portenin 2 adım altı)
// Pozisyon 2 = E4 = 1. çizgi
// Pozisyon 4 = G4 = 2. çizgi
// Pozisyon 6 = B4 = 3. çizgi
// Pozisyon 8 = D5 = 4. çizgi
// Pozisyon 10 = F5 = 5. çizgi

function posToY(pos: number): number {
  // pos=0 → C4 yardımcı çizgi = STAFF_BOTTOM + LINE_GAP
  // Artan pos = yukarı (azalan y)
  return STAFF_BOTTOM + LINE_GAP - (pos * LINE_GAP / 2);
}

function needsLedgerBelow(pos: number): boolean { return pos <= 0; }
function needsLedgerAbove(pos: number): boolean { return pos >= 12; }

// Nota harfi → diyez/bemol?
function getAccidental(midi: string): string | null {
  const hasSharp  = midi.includes('#');
  const hasFlat   = midi.includes('b') && !['B3','B4','B5'].includes(midi);
  if (hasSharp) return '♯';
  if (hasFlat)  return '♭';
  return null;
}

// Türkçe perde adını en yakın standart nota adına çevir (SVG gösterim için)
function turkcePerdeyiMidiAdaEvir(turAdi: string): string | null {
  const map: Record<string, string> = {
    'Sol': 'G3', 'La': 'A3', 'Si koma♭': 'B3', 'Do': 'C4', 'Re': 'D4',
    'Mi': 'E4', 'Fa♯ koma♭': 'G4', // F#4 yerine G4 göster (yakın)
    'Mi♭ koma': 'E4', 'Fa♯': 'F#4',
    'Si♭ koma': 'A#4', 'Do♯': 'C#5',
    'Si koma♭_usak': 'B3', 'Fa koma': 'F4', 'Sol♯': 'G4',
    'Do koma': 'C4', 'Sol koma': 'G4',
    'Si♭': 'A#4', 'Fa': 'F4', 'Mi koma♭': 'E4',
  };
  return map[turAdi] ?? null;
}

interface SolAnahtariProps {
  notalar: string[];      // MIDI nota adları: ['G3','A3','B3',...]
  perdeAdlari?: string[]; // Türkçe perde adları (altında gösterilir)
  vurguluIndex?: number;  // Hangi nota vurgulanacak
  genislik?: number;
  yukseklik?: number;
}

export function SolAnahtariSVG({
  notalar,
  perdeAdlari,
  vurguluIndex = -1,
  genislik = 360,
  yukseklik = 140,
}: SolAnahtariProps) {
  if (Platform.OS !== 'web') return null;

  const MARGIN_LEFT = 60;
  const NOTE_SPACING = Math.min(44, (genislik - MARGIN_LEFT - 20) / Math.max(notalar.length, 1));

  // SVG string oluştur
  const lines: string[] = [];

  // Arka plan
  lines.push(`<rect width="${genislik}" height="${yukseklik}" fill="transparent"/>`);

  // 5 çizgi
  for (let i = 0; i < 5; i++) {
    const y = STAFF_TOP + i * LINE_GAP;
    lines.push(`<line x1="${MARGIN_LEFT - 10}" y1="${y}" x2="${genislik - 10}" y2="${y}" stroke="${C.border}" stroke-width="1"/>`);
  }

  // Sol anahtarı metni (Unicode)
  lines.push(`<text x="${MARGIN_LEFT - 42}" y="${STAFF_TOP + 44}" font-size="56" fill="${C.textMuted}" font-family="serif">𝄞</text>`);

  // Notalar
  notalar.forEach((midi, idx) => {
    const x = MARGIN_LEFT + 10 + idx * NOTE_SPACING;
    // En yakın standart midi adı bul
    const cleanMidi = midi.replace('b', '').replace('#', '');
    const baseMidi  = midi.includes('#') ? midi : midi; // F#4 → ok
    const pos = NOTE_POS[baseMidi] ?? NOTE_POS[midi.replace('#','').replace('b','')] ?? 4;
    const y   = posToY(pos);
    const isVurgu = idx === vurguluIndex;
    const noteColor = isVurgu ? C.gold : C.textSecondary;

    // Yardımcı çizgiler (orta Do için)
    if (pos <= 0) {
      // C4 ve altı için yardımcı çizgi
      for (let p = 0; p >= pos; p -= 2) {
        const ly = posToY(p);
        lines.push(`<line x1="${x - 10}" y1="${ly}" x2="${x + 10}" y2="${ly}" stroke="${C.textMuted}" stroke-width="1"/>`);
      }
    }
    if (pos >= 12) {
      for (let p = 12; p <= pos; p += 2) {
        const ly = posToY(p);
        lines.push(`<line x1="${x - 10}" y1="${ly}" x2="${x + 10}" y2="${ly}" stroke="${C.textMuted}" stroke-width="1"/>`);
      }
    }

    // Diyez / bemol
    if (midi.includes('#')) {
      lines.push(`<text x="${x - 13}" y="${y + 4}" font-size="12" fill="${noteColor}" text-anchor="middle">♯</text>`);
    } else if (midi.includes('b') && !['B3','B4','B5','Bb3','Bb4'].includes(midi)) {
      lines.push(`<text x="${x - 13}" y="${y + 4}" font-size="12" fill="${noteColor}" text-anchor="middle">♭</text>`);
    }

    // Nota kafası
    lines.push(`<ellipse cx="${x}" cy="${y}" rx="${NOTE_R}" ry="${NOTE_R * 0.75}" fill="${noteColor}" stroke="${noteColor}" stroke-width="1"/>`);

    // Kuyruk (4. çizgiden aşağıdaki notalar yukarı, üstündekiler aşağı)
    const stemUp = pos < 6;
    if (stemUp) {
      lines.push(`<line x1="${x + NOTE_R - 1}" y1="${y}" x2="${x + NOTE_R - 1}" y2="${y - 28}" stroke="${noteColor}" stroke-width="1.5"/>`);
    } else {
      lines.push(`<line x1="${x - NOTE_R + 1}" y1="${y}" x2="${x - NOTE_R + 1}" y2="${y + 28}" stroke="${noteColor}" stroke-width="1.5"/>`);
    }

    // Perde adı (altında)
    const label = perdeAdlari?.[idx] ?? midi;
    lines.push(`<text x="${x}" y="${STAFF_BOTTOM + LINE_GAP * 2 + 14}" font-size="9" fill="${isVurgu ? C.gold : C.textMuted}" text-anchor="middle" font-family="sans-serif">${label}</text>`);
  });

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${genislik}" height="${yukseklik}" viewBox="0 0 ${genislik} ${yukseklik}">${lines.join('')}</svg>`;

  // Web'de dangerouslySetInnerHTML yerine object tag kullan
  return {
    svgString: svgContent,
    width: genislik,
    height: yukseklik,
  };
}

// React Native Web için WebView'e gömmeden inline HTML olarak döndür
// Bu fonksiyon doğrudan HTML string döndürür — gam-detay ve makam-detay bunu kullanır
export function solAnahtariHTML(
  notalar: string[],
  perdeAdlari?: string[],
  vurguluIndex = -1,
  genislik = 340,
): string {
  // En alt nota pozisyonuna göre yüksekliği ayarla
  const minPos = Math.min(...notalar.map(m => NOTE_POS[m] ?? 0));
  const extraBottom = minPos < -1 ? Math.abs(minPos) * 6 : 0;
  const yukseklik = 136 + extraBottom;
  const MARGIN_LEFT = 56;
  const NOTE_SPACING = Math.min(42, (genislik - MARGIN_LEFT - 20) / Math.max(notalar.length, 1));
  const bg = 'transparent';
  const strokeColor = '#374151';
  const noteColor = '#9CA3AF';
  const vurguColor = '#D4A843';
  const mutedColor = '#6B7280';

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${genislik}" height="${yukseklik}">`;
  svg += `<rect width="${genislik}" height="${yukseklik}" fill="${bg}"/>`;

  // 5 çizgi
  for (let i = 0; i < 5; i++) {
    const y = STAFF_TOP + i * LINE_GAP;
    svg += `<line x1="${MARGIN_LEFT - 8}" y1="${y}" x2="${genislik - 8}" y2="${y}" stroke="${strokeColor}" stroke-width="1"/>`;
  }

  // Sol anahtarı
  svg += `<text x="${MARGIN_LEFT - 44}" y="${STAFF_TOP + 44}" font-size="54" fill="${mutedColor}" font-family="serif">𝄞</text>`;

  notalar.forEach((midi, idx) => {
    const x = MARGIN_LEFT + 8 + idx * NOTE_SPACING;
    const pos = NOTE_POS[midi] ?? 4;
    const y   = posToY(pos);
    const isVurgu = idx === vurguluIndex;
    const nc = isVurgu ? vurguColor : noteColor;

    // Yardımcı çizgiler
    if (pos <= 0) {
      for (let p = 0; p >= pos; p -= 2) {
        const ly = posToY(p);
        svg += `<line x1="${x - 10}" y1="${ly}" x2="${x + 10}" y2="${ly}" stroke="${mutedColor}" stroke-width="1"/>`;
      }
    }
    if (pos >= 12) {
      for (let p = 12; p <= pos; p += 2) {
        const ly = posToY(p);
        svg += `<line x1="${x - 10}" y1="${ly}" x2="${x + 10}" y2="${ly}" stroke="${mutedColor}" stroke-width="1"/>`;
      }
    }

    // Diyez/bemol
    if (midi.includes('#')) {
      svg += `<text x="${x - 12}" y="${y + 4}" font-size="11" fill="${nc}" text-anchor="middle" font-family="serif">♯</text>`;
    }

    // Nota kafası
    svg += `<ellipse cx="${x}" cy="${y}" rx="${NOTE_R}" ry="${NOTE_R * 0.73}" fill="${nc}"/>`;

    // Kuyruk
    const stemUp = pos < 6;
    if (stemUp) {
      svg += `<line x1="${x + NOTE_R - 1}" y1="${y}" x2="${x + NOTE_R - 1}" y2="${y - 26}" stroke="${nc}" stroke-width="1.5"/>`;
    } else {
      svg += `<line x1="${x - NOTE_R + 1}" y1="${y}" x2="${x - NOTE_R + 1}" y2="${y + 26}" stroke="${nc}" stroke-width="1.5"/>`;
    }

    // Perde adı
    const label = perdeAdlari?.[idx] ?? midi;
    const labelY = Math.max(STAFF_BOTTOM + LINE_GAP * 2 + 14, y + 22);
    svg += `<text x="${x}" y="${labelY}" font-size="8.5" fill="${isVurgu ? vurguColor : mutedColor}" text-anchor="middle">${label}</text>`;
  });

  svg += '</svg>';
  return svg;
}

// Makam dizisinden MIDI listesi üret (centTables'dan)
export function makamMidiListesi(dereceler: Array<{ midi: string; perde: string }>): { notalar: string[]; perdeAdlari: string[] } {
  return {
    notalar: dereceler.map(d => d.midi),
    perdeAdlari: dereceler.map(d => d.perde),
  };
}

// Batı gamından Do üzerinde MIDI listesi üret
const DO_BASLANGIC = 60; // C4
const MIDI_NOTALAR = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export function gamMidiListesi(yariSesler: number[]): { notalar: string[]; perdeAdlari: string[] } {
  const notalar: string[] = [];
  const perdeAdlari: string[] = [];
  let pos = DO_BASLANGIC;
  const turk = ['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'];

  notalar.push(`${MIDI_NOTALAR[pos % 12]}${Math.floor(pos/12)-1}`);
  perdeAdlari.push('Do');

  for (const adim of yariSesler) {
    pos += adim;
    const oktav = Math.floor(pos / 12) - 1;
    const notaIdx = pos % 12;
    notalar.push(`${MIDI_NOTALAR[notaIdx]}${oktav}`);
    perdeAdlari.push(turk[notaIdx]);
  }
  return { notalar, perdeAdlari };
}
