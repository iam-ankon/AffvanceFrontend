'use client';

import type { CreditBalance } from '@/types/subscription';
import { create } from 'zustand';

interface CreditState {
  credits: CreditBalance | null;
  showUpgradeModal: boolean;
  upgradeMessage: string;
  creditType: 'ai' | 'keyword' | null;

  setCredits: (credits: CreditBalance) => void;
  clearCredits: () => void;
  openUpgradeModal: (message: string, creditType?: 'ai' | 'keyword' | null) => void;
  closeUpgradeModal: () => void;
}

export const useCreditStore = create<CreditState>()((set) => ({
  credits: null,
  showUpgradeModal: false,
  upgradeMessage: '',
  creditType: null,

  setCredits: (credits) => set({ credits }),
  clearCredits: () => set({ credits: null }),

  openUpgradeModal: (message, creditType = null) =>
    set({ showUpgradeModal: true, upgradeMessage: message, creditType }),

  closeUpgradeModal: () =>
    set({ showUpgradeModal: false, upgradeMessage: '', creditType: null }),
}));
