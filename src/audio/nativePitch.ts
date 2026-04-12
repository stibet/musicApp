import { Audio } from 'expo-av';

let kayit: Audio.Recording | null = null;
let interval: ReturnType<typeof setInterval> | null = null;

export async function nativePitchBul(
  onPitch: (frekans: number, clarity: number) => void,
  onDur: () => void
): Promise<() => void> {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) throw new Error('Mikrofon izni verilmedi');
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  kayit = new Audio.Recording();
  await kayit.prepareToRecordAsync({
    android: { extension: '.wav', outputFormat: 2, audioEncoder: 3, sampleRate: 44100, numberOfChannels: 1, bitRate: 128000 },
    ios: { extension: '.wav', audioQuality: 127, sampleRate: 44100, numberOfChannels: 1, bitRate: 128000, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false },
    web: {},
  });
  await kayit.startAsync();
  interval = setInterval(async () => {
    if (!kayit) return;
    try {
      const durum = await kayit.getStatusAsync();
      if (durum.isRecording && durum.metering !== undefined) {
        const dB = durum.metering;
        if (dB > -40) { const n = Math.min(1, Math.max(0, (dB + 60) / 60)); onPitch(110 + n * 440, n); }
        else onPitch(0, 0);
      }
    } catch {}
  }, 100);
  return async () => {
    if (interval) clearInterval(interval);
    if (kayit) { try { await kayit.stopAndUnloadAsync(); } catch {} kayit = null; }
    onDur();
  };
}