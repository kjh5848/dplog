export interface SystemStatus {
  backend: {
    connected: boolean;
    version: string;
    appMode: string;
    port: number;
    serverTime: string;
  };
  database: {
    type: string;
    exists: boolean;
    sizeBytes: number;
    location: string;
  };
  staticAssets: {
    exists: boolean;
    indexExists: boolean;
    assetDirExists: boolean;
  };
  store: {
    id: number;
    name: string;
    category: string;
    updatedAt: string | null;
    scrapeStatus: string;
    keywordsCount: number;
  } | null;
  keywordTask: {
    status: string;
    seedKeyword: string;
    createdAt: string | null;
    completedAt: string | null;
    error: string | null;
  } | null;
}
