import { get, post } from '@/shared/api';
import * as authApi from '@/entities/auth/api/authApi';
import type { OwnerVerificationRequest, OwnerVerificationResponse } from '../model/types';

export async function getMyOwnerVerifications(): Promise<OwnerVerificationResponse[]> {
  return get<OwnerVerificationResponse[]>('/v1/owner-verifications/me');
}

export async function submitOwnerVerification(
  request: OwnerVerificationRequest,
): Promise<OwnerVerificationResponse> {
  await authApi.ensureCsrf();
  return post<OwnerVerificationResponse>('/v1/owner-verifications', request);
}
