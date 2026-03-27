/**
 * [역할]   DOM 스타일을 캔버스 렌더링에 맞게 처리하는 인터페이스
 * [입력]   Document
 * [출력]   void (Document 직접 수정)
 */

export interface IStyleProcessor {
  processStyles(document: Document): void;
} 