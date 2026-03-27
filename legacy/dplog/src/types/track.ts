export interface Track {
  trackId: number;
  name: string;
  location: string;
  type: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  createdDate: string;
  updatedDate?: string;
}

export interface TrackListResponse {
  trackList: Track[];
  totalCount: number;
}

export interface TrackCreateRequest {
  name: string;
  location: string;
  type: string;
  description?: string;
}

export interface TrackUpdateRequest {
  trackId: number;
  name?: string;
  location?: string;
  type?: string;
  status?: string;
  description?: string;
}

export interface TrackSearchRequest {
  keyword?: string;
  type?: string;
  status?: string;
  page?: number;
  size?: number;
} 