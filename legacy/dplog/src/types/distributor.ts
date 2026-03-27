export interface Distributor {
  userId: number;
  distributorId: number;
  companyName: string;
  username: string;
  tel: string;
  email: string;
  deposit: string;
  accountNumber: string;
  bankName: string;
  googleSheetUrl?: string;
  googleCredentialJson?: string;
  memo?: string;
}

export interface DistributorListResponse {
  distributorList: Distributor[];
}

export interface DistributorResponse {
  distributor: Distributor;
}

export interface DistributorCreateRequest {
  companyName: string;
  userName: string;
  password: string;
  tel: string;
  email: string;
  deposit: string;
  accountNumber: string;
  bankName: string;
  googleSheetUrl?: string;
  memo?: string;
}

export interface DistributorCreateDto {
  distributor: DistributorCreateRequest;
}

export interface DistributorUpdateRequest {
  distributorId: number;
  companyName?: string;
  tel?: string;
  email?: string;
  deposit?: string;
  accountNumber?: string;
  bankName?: string;
  googleSheetUrl?: string;
  memo?: string;
}

export interface DistributorUpdateDto {
  distributor: DistributorUpdateRequest;
} 