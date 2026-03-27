/**
 * [역할]   리포트 파일명을 생성
 * [입력]   baseName, startDate, endDate
 * [출력]   string (생성된 파일명)
 * [NOTE]   날짜 포맷팅 포함
 */

import { format } from 'date-fns';
import { IFileNameGenerator } from './interfaces/IFileNameGenerator';

export class FileNameGenerator implements IFileNameGenerator {
  generate(baseName: string, startDate?: Date | null, endDate?: Date | null): string {
    const sanitizedBaseName = this.sanitizeBaseName(baseName);
    const dateString = this.generateDateString(startDate, endDate);
    
    return `${sanitizedBaseName}_${dateString}`;
  }

  private sanitizeBaseName(baseName: string): string {
    return baseName
      .replace(/[^a-zA-Z0-9가-힣\-_]/g, "_")
      .replace(/\s+/g, "_")
      .trim();
  }

  private generateDateString(startDate?: Date | null, endDate?: Date | null): string {
    if (startDate && endDate) {
      return `${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}`;
    }
    
    return format(new Date(), 'yyyyMMdd');
  }
} 