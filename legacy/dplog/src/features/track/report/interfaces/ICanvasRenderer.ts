/**
 * [역할]   HTML 요소를 캔버스로 렌더링하는 인터페이스
 * [입력]   HTMLElement, RenderOptions
 * [출력]   Promise<HTMLCanvasElement>
 */

export interface RenderOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
}

export interface ICanvasRenderer {
  render(element: HTMLElement, options?: RenderOptions): Promise<HTMLCanvasElement>;
} 