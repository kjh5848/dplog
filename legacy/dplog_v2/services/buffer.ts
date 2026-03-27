
// Types based on https://buffer.com/developers/api

export interface BufferProfile {
  avatar: string;
  created_at: number;
  default: boolean;
  formatted_service: string; // e.g. "Twitter", "LinkedIn"
  formatted_username: string; // e.g. "@username"
  id: string;
  schedules: Array<{
    days: string[];
    times: string[];
  }>;
  service: string;
  service_id: string;
  service_username: string;
  statistics: {
    followers: number;
  };
  timezone: string;
  user_id: string;
}

export interface BufferMedia {
  link?: string;
  description?: string;
  title?: string;
  picture?: string; // URL
  thumbnail?: string; // URL
}

export interface BufferUpdate {
  id: string;
  created_at: number;
  day?: string;
  due_at: number;
  due_time?: string;
  media?: BufferMedia;
  profile_id: string;
  profile_service: string;
  sent_at?: number;
  service_update_id?: string;
  statistics?: {
    clicks: number;
    favorites: number;
    mentions: number;
    reach: number;
    retweets: number;
    likes?: number;
    comments?: number;
  };
  status: 'buffer' | 'sent' | 'compliance';
  text: string;
  text_formatted: string;
  user_id: string;
  via: string;
  service_link?: string; // Sometimes populated for sent updates
}

export interface CreateUpdateOptions {
  profile_ids: string[];
  text: string;
  now?: boolean; // Send immediately
  top?: boolean; // Add to top of queue
  media?: BufferMedia;
  attachment?: boolean;
  scheduled_at?: string; // UTC date string
}

export interface UpdateResponse {
    success: boolean;
    buffer_count: number;
    buffer_percentage: number;
    updates: BufferUpdate[];
}

export interface UpdatesListResponse {
    total: number;
    updates: BufferUpdate[];
}

const API_BASE = "https://api.bufferapp.com/1";

export class BufferService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    // Auth via Header is preferred over query param for security
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${this.accessToken}`
    };

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Try to parse error message from Buffer
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `Buffer API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Buffer API Request Failed [${endpoint}]:`, error);
      throw error;
    }
  }

  // Get user info (useful for validating token)
  async getUser(): Promise<any> {
    return this.request('/user.json');
  }

  // Get connected social media profiles
  async getProfiles(): Promise<BufferProfile[]> {
    return this.request<BufferProfile[]>('/profiles.json');
  }

  // Get pending updates (scheduled/buffered)
  async getPendingUpdates(profileId: string, page = 1, count = 20): Promise<UpdatesListResponse> {
    return this.request<UpdatesListResponse>(`/profiles/${profileId}/updates/pending.json?page=${page}&count=${count}`);
  }

  // Get sent updates history
  async getSentUpdates(profileId: string, page = 1, count = 20): Promise<UpdatesListResponse> {
    return this.request<UpdatesListResponse>(`/profiles/${profileId}/updates/sent.json?page=${page}&count=${count}`);
  }

  // Create an update (Schedule or Send Now)
  async createUpdate(options: CreateUpdateOptions): Promise<UpdateResponse> {
    const formData = new URLSearchParams();
    formData.append('text', options.text);
    
    options.profile_ids.forEach(id => formData.append('profile_ids[]', id));
    
    if (options.now) formData.append('now', 'true');
    if (options.top) formData.append('top', 'true');
    if (options.scheduled_at) formData.append('scheduled_at', options.scheduled_at);

    if (options.media) {
      if (options.media.link) formData.append('media[link]', options.media.link);
      if (options.media.description) formData.append('media[description]', options.media.description);
      if (options.media.title) formData.append('media[title]', options.media.title);
      if (options.media.picture) formData.append('media[picture]', options.media.picture);
      if (options.media.thumbnail) formData.append('media[thumbnail]', options.media.thumbnail);
    }

    return this.request<UpdateResponse>('/updates/create.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
  }
  
  // Shuffle updates in the buffer
  async shuffleUpdates(profileId: string): Promise<any> {
     return this.request(`/profiles/${profileId}/updates/shuffle.json`, {
         method: 'POST'
     });
  }
}
