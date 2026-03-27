import { logInfo } from '@/src/utils/logger';

// Lightweight mappers to normalize user objects from different sources

export interface KakaoCallbackData {
  id: string | number;
  nickname?: string;
  email?: string;
  birthDate?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  profileImage?: string;
  profileImageUrl?: string;
  thumbnailImageUrl?: string;
}

// Try to map Kakao callback payload to our LoginUser-like shape
export const mapKakaoDataToLoginUser = (data: KakaoCallbackData) => {
  const providerId = String(data.id);
  const username = data.nickname || (data.email ? data.email.split('@')[0] : `kakao_${providerId}`);

  const mapped: any = {
    id: Number.isNaN(Number(providerId)) ? Date.now() : Number(providerId),
    username,
    userName: username,
    name: data.nickname || username,
    nickname: data.nickname,
    email: data.email,
    authority: ['USER'],
    roleList: ['USER'],
    expireDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    provider: 'KAKAO',
    providerId,
    profileImage: data.profileImage,
    profileImageUrl: data.profileImageUrl,
    thumbnailImageUrl: data.thumbnailImageUrl,
    phoneNumber: data.phoneNumber || undefined,
  };

  logInfo('[mapUser] Kakao -> LoginUser', { username: mapped.username, providerId });
  return mapped;
};

// Backward-friendly alias for clarity with spec naming
export const mapKakaoResponseToLoginUser = mapKakaoDataToLoginUser;

// Normalize a local user coming from our backend info endpoint
export const mapLocalUserToLoginUser = (user: any) => {
  if (!user) return null;
  const username = user.username || user.userName || 'user';
  const authority = user.authority || user.roleList || ['USER'];

  const mapped: any = {
    ...user,
    username,
    userName: username,
    authority,
    roleList: authority,
    provider: user.provider || 'LOCAL',
  };
  return mapped;
};

export const deriveDisplayName = (user: any): string => {
  return user?.nickname || user?.name || user?.username || user?.userName || '사용자';
};

export const deriveAvatar = (user: any): string | undefined => {
  return user?.profileImage || user?.profileImageUrl || user?.thumbnailImageUrl || undefined;
};
