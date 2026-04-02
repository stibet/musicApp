import { create } from 'zustand';
import { Dil, dilKaydet, dilYukle, t, TercumeSozlugu } from '../i18n';
interface DilStore { dil: Dil; tr: TercumeSozlugu; dilDegistir: (dil: Dil) => void; dilBaslat: () => void; }
export const useDilStore = create<DilStore>((set) => ({
  dil: 'tr', tr: t.tr,
  dilDegistir: (dil: Dil) => { dilKaydet(dil); set({ dil, tr: t[dil] }); },
  dilBaslat: async () => { const dil = await dilYukle(); set({ dil, tr: t[dil] }); },
}));