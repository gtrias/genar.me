/** The texture's size and the terminal's cell grid on it, all in texture pixels */
export interface SaverGrid {
  width: number;
  height: number;
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
}

export interface SaverInstance {
  /** Paints one frame over the cleared phosphor background; time is performance.now() */
  draw(ctx: CanvasRenderingContext2D, time: number): void;
}

export type SaverFactory = (grid: SaverGrid) => SaverInstance;
