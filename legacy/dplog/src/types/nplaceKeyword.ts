export interface NplaceKeywordRequestBody {
  nplaceKeywordNsearchadKeywordstoolKeyword: {
    keywordString: string;
  };
}

export type KeywordRequestType = "RELATION" | "TRACK";

export interface NplaceKeywordRelationParams {
  keywordList: string[];
  requestType: KeywordRequestType;
}

export interface KeywordToolItem {
  relKeyword: string;
  monthlyPcQcCnt?: number;
  monthlyMobileQcCnt?: number;
  monthlyAvePcClkCnt?: number;
  monthlyAveMobileClkCnt?: number;
  monthlyAvePcCtr?: number;
  monthlyAveMobileCtr?: number;
  plAvgDepth?: number;
  compIdx?: string;
}

export interface KeywordToolListResponse {
  keywordToolList: KeywordToolItem[];
}
