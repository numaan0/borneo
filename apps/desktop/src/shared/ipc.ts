import type { Board } from "@borneo/domain";

export interface OpenBoardViewResult {
  canceled: boolean;
  filePath: string | null;
  board: Board | null;
  warnings: string[];
}

/**
 * The only API surface the renderer sees (AGENTS.md §17):
 * one channel to open a boardview file. IPC returns plain JSON,
 * so Board transports across contextIsolation boundary.
 */
export interface BorneoBridge {
  openBoardView(): Promise<OpenBoardViewResult>;
}