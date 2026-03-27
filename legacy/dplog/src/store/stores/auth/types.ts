/**
 * [역할] 인증 관련 타입 정의
 * [입력] -
 * [출력] 인증 타입 정의
 */

export interface LoginUser {
  id: number;
  username: string;
  authority: string[];
  expireDate: string;
  // Kakao/SSO derived fields (optional)
  name?: string;
  nickname?: string;
  profileImage?: string;
  profileImageUrl?: string; // kakao_account.profile.profile_image_url
  thumbnailImageUrl?: string; // kakao_account.profile.thumbnail_image_url
  provider?: string; // e.g., 'KAKAO'
  providerId?: string; // e.g., Kakao user id
  distributorEntity?: {
    id: number;
    email: string;
    accountNumber: string;
    deposit: string;
    bankName: string;
    googleSheetUrl: string;
    googleCredentialJson: any;
    memo: string | null;
    createDate: string;
    updateDate: string | null;
    deleteDate: string | null;
  };
  // 하위 호환성
  userName?: string;
  companyName?: string;
  companyNumber?: string;
  tel?: string;
  roleList?: string[];
}

export interface AuthState {
  loginUser: LoginUser | null;
  isAuthPending: boolean;
  isLogoutPending: boolean;
  
  // 액션
  setLoginUser: (user: LoginUser | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  forceRecheck: () => Promise<void>;
} 
