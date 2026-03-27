/**
 * [역할]   리포트 파일명을 생성하는 인터페이스
 * [입력]   baseName, startDate, endDate
 * [출력]   string (생성된 파일명)
 */

export interface IFileNameGenerator {
  generate(baseName: string, startDate?: Date | null, endDate?: Date | null): string;
} 