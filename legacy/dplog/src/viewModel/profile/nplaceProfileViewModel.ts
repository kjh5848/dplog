import { create } from 'zustand';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  authority: string[];
  createdAt?: string;
  lastLoginAt: string;
  profileImage?: string;
  phoneNumber?: string;
  company?: string;
  department?: string;
  // auth provider info
  provider?: 'KAKAO' | 'LOCAL' | string;
  providerId?: string;
  // external service credentials (client-side only)
  naverId?: string;
  naverPassword?: string;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  
  setProfile: (profile) => set({ profile, error: null }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearProfile: () => set({ profile: null, error: null, isLoading: false }),
}));

// 프로필 관련 유틸리티 함수들
export const profileUtils = {
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  getAuthorityDisplayName: (authority: string) => {
    const authorityMap: Record<string, string> = {
      'ADMIN': '관리자',
      'USER': '일반 사용자',
      'PREMIUM': '프리미엄 사용자',
      'MANAGER': '매니저'
    };
    return authorityMap[authority] || authority;
  },
  
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePhoneNumber: (phone: string) => {
    const phoneRegex = /^[0-9-+\s()]+$/;
    return phoneRegex.test(phone);
  }
}; 
