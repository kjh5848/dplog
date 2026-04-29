export type OwnerVerificationStatus =
  | 'VERIFIED'
  | 'PENDING_REVIEW'
  | 'REJECTED_INVALID_BUSINESS'
  | 'REJECTED_NOT_RESTAURANT'
  | 'EXTERNAL_UNAVAILABLE';

export interface OwnerVerificationRequest {
  businessNumber: string;
  openingDate: string;
  representativeName: string;
  placeId: string;
  placeName: string;
  category: string;
}

export interface OwnerVerificationResponse {
  id: string;
  status: OwnerVerificationStatus;
  statusReason: string;
  placeId: string;
  placeName: string;
  category: string;
  openingDate: string;
  verifiedAt?: string | null;
  createdAt: string;
}
