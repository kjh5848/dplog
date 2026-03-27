export interface NaverStatusResponse {
  exists: boolean;
}

export interface UserNaverCredentials {
  userId: number;
  naverId: string;
  naverPw: string;
}

export interface NaverAccountResponse {
  userNaver: UserNaverCredentials;
}

export interface NaverAccountPayload {
  naverId: string;
  naverPw: string;
}

export interface NaverAccountRequest {
  userNaver: NaverAccountPayload;
}

export interface NplaceReplyInfo {
  id: number;
  placeId: string;
  active: boolean;
}

export interface NplaceReplyListResponse {
  nplaceReplyList: NplaceReplyInfo[];
}

export interface ToggleReplyRequest {
  nplaceReplyInfo: {
    placeId: string;
    active: boolean;
  };
}
