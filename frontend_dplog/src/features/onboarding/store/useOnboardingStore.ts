import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  totalCapital: number | null;
  targetAudience: string | null;
  mainItem: string | null;
  dDay: string | null;
  /** 가게 등록 후 저장된 storeId (키워드 저장 시 사용) */
  storeId: number | null;
  
  phase2Data: {
    depositAmt: number;
    premiumAmt: number;
    interiorAmt: number;
    equipmentAmt: number;
    etcAmt: number;
    facilityAmt: number; // This can be the sum of premium, interior, equipment, etc.
    reserveAmt: number;
    targetProfit: number; 
    bepRevenue: number;
    totalInvestment: number;
    paybackMonths: number;
    monthlyPayback: number;
    realNetProfit: number;
  } | null;

  setTotalCapital: (amount: number) => void;
  setTargetAudience: (audience: string) => void;
  setMainItem: (item: string) => void;
  setDDay: (date: string) => void;
  setStoreId: (id: number) => void;
  setPhase2Data: (data: Partial<OnboardingState['phase2Data']>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      totalCapital: null,
      targetAudience: null,
      mainItem: null,
      dDay: null,
      storeId: null,
      phase2Data: null,

      setTotalCapital: (amount) => set({ totalCapital: amount }),
      setTargetAudience: (audience) => set({ targetAudience: audience }),
      setMainItem: (item) => set({ mainItem: item }),
      setDDay: (date) => set({ dDay: date }),
      setStoreId: (id) => set({ storeId: id }),
      setPhase2Data: (data) => set((state) => ({ 
        phase2Data: state.phase2Data ? { ...state.phase2Data, ...data } : { ...data } as any
      })),
      
      reset: () => set({
        totalCapital: null,
        targetAudience: null,
        mainItem: null,
        dDay: null,
        storeId: null,
        phase2Data: null,
      }),
    }),
    {
      name: 'onboarding-storage', // 로컬 스토리지 키 이름 (고유해야 함)
    }
  )
);
