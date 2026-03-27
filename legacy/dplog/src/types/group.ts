export interface Group {
  groupId: number;
  name: string;
  description?: string;
  memberCount: number;
  ownerId: number;
  ownerName: string;
  status: "ACTIVE" | "INACTIVE";
  createdDate: string;
  updatedDate?: string;
}

export interface GroupMember {
  userId: number;
  username: string;
  companyName: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedDate: string;
}

export interface GroupListResponse {
  groupList: Group[];
  totalCount: number;
}

export interface GroupMemberListResponse {
  memberList: GroupMember[];
}

export interface GroupCreateRequest {
  name: string;
  description?: string;
}

export interface GroupUpdateRequest {
  groupId: number;
  name?: string;
  description?: string;
  status?: string;
}

export interface GroupMemberRequest {
  groupId: number;
  userId: number;
  role?: string;
}

// Track 관련 Group 타입
export interface TrackGroup {
  id: number;
  groupName: string;
  memo?: string;
  serviceSort?: string;
  createDate?: string;
  updateDate?: string;
}

export interface GroupChangeData {
  group: TrackGroup;
} 