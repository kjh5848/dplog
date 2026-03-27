export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    userId: number;
    username: string;
    email?: string;
    companyName?: string;
    authority: string[];
    distributorId?: number;
  };
  token?: string;
  isAuthenticated: boolean;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
  username: string;
}

export interface JoinRequest {
  user: {
    userName: string;
    password: string;
    name: string;
    email: string;
    gender: string;
    birthDate: string;
    tel: string;
    companyName: string;
    companyNumber: string;
    marketingConsent?: boolean; // 마케팅 정보활용 동의 (선택)
  };
}   