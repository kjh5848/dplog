import { get, post } from '@/shared/api';
import * as authApi from '@/entities/auth/api/authApi';
import type {
  AdminDashboardSummary,
  AdminDeleteKeyRequestDto,
  AdminDeleteKeyApprovalResponse,
  AdminLicenseDto,
  DownloadArtifactsResponse,
  LicenseResponse,
  LicenseStateResponse,
} from '../model/types';

export async function getLicenseState(): Promise<LicenseStateResponse> {
  return get<LicenseStateResponse>('/v1/account/license');
}

export async function requestProductKey(): Promise<LicenseResponse> {
  await authApi.ensureCsrf();
  return post<LicenseResponse>('/v1/account/license/request');
}

export async function getDownloadArtifacts(): Promise<DownloadArtifactsResponse> {
  return get<DownloadArtifactsResponse>('/v1/downloads/artifacts');
}

export async function getAdminSummary(): Promise<AdminDashboardSummary> {
  return get<AdminDashboardSummary>('/v1/admin/dashboard/summary');
}

export async function getAdminLicenses(): Promise<AdminLicenseDto[]> {
  return get<AdminLicenseDto[]>('/v1/admin/licenses');
}

export async function getAdminDeleteKeyRequests(): Promise<AdminDeleteKeyRequestDto[]> {
  return get<AdminDeleteKeyRequestDto[]>('/v1/admin/delete-key-requests');
}

export async function approveDeleteKey(requestId: string): Promise<AdminDeleteKeyApprovalResponse> {
  await authApi.ensureCsrf();
  return post<AdminDeleteKeyApprovalResponse>(`/v1/admin/delete-key-requests/${requestId}/approve`);
}

export async function revokeLicense(licenseId: string): Promise<LicenseResponse> {
  await authApi.ensureCsrf();
  return post<LicenseResponse>(`/v1/admin/licenses/${licenseId}/revoke`);
}
