/**
 * [역할] 상태 유효성 검사 함수
 * [입력] 검증할 값, 검증 규칙
 * [출력] 유효성 검사 결과
 */

export const validateColumns = (columns: number, isMobile: boolean): number => {
  const [min, max] = isMobile ? [1, 3] : [3, 7];
  return Math.max(min, Math.min(max, columns));
};

export const validateViewMode = (mode: string): boolean => {
  return ['grid', 'list', 'report'].includes(mode);
};

export const validateTrackGridMode = (mode: string): boolean => {
  return ['grid', 'report'].includes(mode);
};

export const clampNumber = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
}; 