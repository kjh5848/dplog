export interface RealtimeData {
  id: number;
  trackId: number;
  trackName: string;
  timestamp: string;
  data: Record<string, any>;
  status: "ACTIVE" | "INACTIVE";
}

export interface RealtimeSession {
  sessionId: string;
  userId: number;
  trackId: number;
  startTime: string;
  endTime?: string;
  status: "CONNECTED" | "DISCONNECTED";
}

export interface RealtimeListResponse {
  dataList: RealtimeData[];
  sessionList: RealtimeSession[];
}

export interface RealtimeSubscribeRequest {
  trackId: number;
  userId: number;
  filters?: Record<string, any>;
}

export interface RealtimeUnsubscribeRequest {
  sessionId: string;
  userId: number;
} 