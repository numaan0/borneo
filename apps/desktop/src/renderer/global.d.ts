import type { BorneoBridge } from "../shared/ipc";

declare global {
  interface Window {
    borneo: BorneoBridge;
  }
}

export {};