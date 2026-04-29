export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type DeleteKeyRequestStatus = 'PENDING_ADMIN_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface LicenseResponse {
  licenseId: string;
  status: LicenseStatus;
  plan: string;
  keyPrefix: string;
  keyLast4: string;
  oneTimeProductKey?: string | null;
  issuedAt: string;
  deleteKeyStatus?: DeleteKeyRequestStatus | null;
}

export interface LicenseStateResponse {
  hasVerifiedOwner: boolean;
  license?: LicenseResponse | null;
}

export interface DownloadArtifactsResponse {
  macUrl: string;
  windowsUrl: string;
  minimumVersion: string;
}

export interface AdminDashboardSummary {
  activeLicenses: number;
  pendingDeleteKeys: number;
  totalActivations: number;
}

export interface AdminLicenseDto {
  licenseId: string;
  ownerEmail: string;
  keyPrefix: string;
  keyLast4: string;
  plan: string;
  status: LicenseStatus;
  issuedAt: string;
}

export interface AdminDeleteKeyApprovalResponse {
  requestId: string;
  licenseId: string;
  status: DeleteKeyRequestStatus;
  oneTimeDeleteKey: string;
}

export interface AdminDeleteKeyRequestDto {
  requestId: string;
  licenseId: string;
  ownerEmail: string;
  status: DeleteKeyRequestStatus;
  requestedAt: string;
  approvedAt?: string | null;
  oneTimeViewedAt?: string | null;
}
