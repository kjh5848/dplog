export interface UserMembership {
  name: string;
  membershipUserId: number;
  startDate: string;
  endDate: string;
  membershipState: "ACTIVATE" | "EXPIRED" | "STOP" | "READY";
}

export interface User {
  userId: number;
  distributorId: number;
  companyName: string;
  username: string;
  tel: string | null;
  email?: string;
  status: "COMPLETION" | "STOP" | "WAITING" | "WITHDRAW";
  authority?: string[];
  membershipList: UserMembership[];
  lastLoginDate: string | null;
  createdDate?: string;
}

export interface UserListResponse {
  userList: User[];
}

// 백엔드 API와 맞는 DTO 형태
export interface UserCompleteDto {
  user: {
    userName: string;
  };
}

export interface UserWithdrawDto {
  user: {
    userName: string;
  };
}

export interface UserUpdateDto {
  user: {
    userId: number;
    username: string;
    companyName: string;
    tel: string;
    status: string;
  };
}

export interface UserUpdateDistributorDto {
  user: {
    userId: number;
    distirbutorId: number;  // 원본 코드에서 오타 있어서 그대로 유지
  };
}

export interface UserAuthorityUpdateDto {
  authority: string;
}

export interface MembershipListRequestDto {
  userAuthoritySort: string;
}

export interface SaveUserMembershipDto {
  membership: {
    membershipId: number;
    startDate: string;
    endDate: string;
  };
}

// 사용자 등록 관련 타입 추가
export interface UserCreateDto {
  user: {
    userName: string;
    password: string;
    companyName: string;
    companyNumber: string;
    tel: string;
  };
}

export interface UserCreateRequest {
  userName: string;
  password: string;
  companyName: string;
  companyNumber: string;
  tel: string;
} 