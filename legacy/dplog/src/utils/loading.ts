/**
 * [Role]   로딩 메시지 유틸리티 함수들
 * [Input]  상황별 로딩 타입
 * [Output] 표준화된 로딩 메시지와 설정
 * [NOTE]   Pure Fn · Utility
 */

// 로딩 타입 정의
export type LoadingType = 
  | 'auth'           // 인증 관련
  | 'page'           // 페이지 로딩
  | 'form'           // 폼 로딩
  | 'data'           // 데이터 로딩
  | 'shop'           // 상점 관련
  | 'search'         // 검색 관련
  | 'upload'         // 업로드 관련
  | 'download'       // 다운로드 관련
  | 'redirect'       // 리다이렉트
  | 'status'         // 상태 확인
  | 'custom';        // 커스텀

// 로딩 메시지 매핑
const LOADING_MESSAGES: Record<LoadingType, string> = {
  auth: '사용자 인증 확인 중...',
  page: '페이지 로딩 중...',
  form: '폼 로딩 중...',
  data: '데이터 로딩 중...',
  shop: '상점 정보 로딩 중...',
  search: '검색 중...',
  upload: '업로드 중...',
  download: '다운로드 중...',
  redirect: '페이지 이동 중...',
  status: '상태 확인 중...',
  custom: '로딩 중...'
};

// 로딩 크기 매핑
const LOADING_SIZES: Record<LoadingType, 'sm' | 'md' | 'lg'> = {
  auth: 'md',
  page: 'lg',
  form: 'md',
  data: 'md',
  shop: 'md',
  search: 'md',
  upload: 'md',
  download: 'md',
  redirect: 'md',
  status: 'sm',
  custom: 'md'
};

/**
 * 로딩 타입에 따른 표준 메시지 반환
 */
export function getLoadingMessage(type: LoadingType): string {
  return LOADING_MESSAGES[type];
}

/**
 * 로딩 타입에 따른 표준 크기 반환
 */
export function getLoadingSize(type: LoadingType): 'sm' | 'md' | 'lg' {
  return LOADING_SIZES[type];
}

/**
 * 로딩 설정 객체 생성
 */
export function createLoadingConfig(type: LoadingType, customMessage?: string) {
  return {
    message: customMessage || getLoadingMessage(type),
    size: getLoadingSize(type)
  };
}

/**
 * 인증 관련 로딩 설정
 */
export function authLoading(message?: string) {
  return createLoadingConfig('auth', message);
}

/**
 * 페이지 로딩 설정
 */
export function pageLoading(message?: string) {
  return createLoadingConfig('page', message);
}

/**
 * 폼 로딩 설정
 */
export function formLoading(message?: string) {
  return createLoadingConfig('form', message);
}

/**
 * 데이터 로딩 설정
 */
export function dataLoading(message?: string) {
  return createLoadingConfig('data', message);
}

/**
 * 상점 관련 로딩 설정
 */
export function shopLoading(message?: string) {
  return createLoadingConfig('shop', message);
}

/**
 * 검색 관련 로딩 설정
 */
export function searchLoading(message?: string) {
  return createLoadingConfig('search', message);
}

/**
 * 업로드 관련 로딩 설정
 */
export function uploadLoading(message?: string) {
  return createLoadingConfig('upload', message);
}

/**
 * 다운로드 관련 로딩 설정
 */
export function downloadLoading(message?: string) {
  return createLoadingConfig('download', message);
}

/**
 * 리다이렉트 관련 로딩 설정
 */
export function redirectLoading(message?: string) {
  return createLoadingConfig('redirect', message);
}

/**
 * 상태 확인 관련 로딩 설정
 */
export function statusLoading(message?: string) {
  return createLoadingConfig('status', message);
}

/**
 * 커스텀 로딩 설정
 */
export function customLoading(message: string, size: 'sm' | 'md' | 'lg' = 'md') {
  return {
    message,
    size
  };
}

// 특화된 로딩 함수들
export const loadingUtils = {
  // 인증 관련
  userAuth: () => authLoading(),
  oauthKakao: () => authLoading('로그인 중입니다.'),
  sessionCheck: () => statusLoading('로그인 중입니다.'),
  loginProcessing: () => authLoading('로그인 중입니다.'),
  loginRedirect: () => redirectLoading('로그인 페이지로 이동 중...'),
  dashboardRedirect: () => redirectLoading('대시보드로 이동 중...'),
  
  // 폼 관련
  loginForm: () => formLoading('로그인 폼 로딩 중...'),
  joinForm: () => formLoading('회원가입 폼 로딩 중...'),
  
  // 페이지 관련
  pageLoad: () => pageLoading(),
  contentLoad: () => pageLoading('컨텐츠 로딩 중...'),
  
  // 데이터 관련
  shopList: () => dataLoading('상점 목록 로딩 중...'),
  shopInfo: () => shopLoading(),
  dataLoading: () => dataLoading(),
  searchResults: () => searchLoading('검색 결과 로딩 중...'),
  
  // 파일 관련
  fileUpload: () => uploadLoading(),
  fileDownload: () => downloadLoading(),
  excelUpload: () => uploadLoading('엑셀 파일 업로드 중...'),
  
  // 상태 관련
  pageStatus: () => statusLoading('사용자 상태 확인 중...'),
  systemStatus: () => statusLoading('시스템 상태 확인 중...'),
  
  // 게스트 리다이렉트 관련
  guestRedirect: () => redirectLoading('로그인 페이지로 이동 중...'),
  guestAuth: () => authLoading('사용자 인증 확인 중...'),
  
  // 로그아웃 관련
  logoutRedirect: () => redirectLoading('로그아웃 처리 중...'),
  logoutAuth: () => authLoading('로그아웃 확인 중...')
}; 
