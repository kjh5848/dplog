export interface LoginUser {
  userId: number;
  username: string;
  email?: string;
  companyName?: string;
  authority: string[];
  distributorId?: number;
}

export interface SessionResponse {
  user: LoginUser;
  isAuthenticated: boolean;
} 