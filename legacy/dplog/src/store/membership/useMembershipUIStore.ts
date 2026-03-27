"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MembershipPeriod = "MONTHLY" | "YEARLY";

export type PendingMembership = {
  membershipId: number;
  period: MembershipPeriod;
  timestamp: number; // Date.now()
} | null;

type MembershipUIState = {
  // 선택된 결제 주기(월/연)
  selectedPeriod: MembershipPeriod;
  setSelectedPeriod: (p: MembershipPeriod) => void;

  // 비로그인 → 로그인 전환 시 이어서 결제하기 위한 보류 상태
  pending: PendingMembership;
  setPending: (p: PendingMembership) => void;
  clearPending: () => void;
};

export const useMembershipUIStore = create<MembershipUIState>()(
  persist(
    (set) => ({
      selectedPeriod: "YEARLY",
      setSelectedPeriod: (p) => set({ selectedPeriod: p }),

      pending: null,
      setPending: (p) => set({ pending: p }),
      clearPending: () => set({ pending: null }),
    }),
    {
      name: "membership-ui",
      version: 1,
      // 필요 시 마이그레이션/부분 저장 설정 가능
      // partialize: (state) => ({ selectedPeriod: state.selectedPeriod, pending: state.pending }),
    }
  )
);

