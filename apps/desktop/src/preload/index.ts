import { contextBridge, ipcRenderer } from "electron";
import type { BorneoBridge } from "../shared/ipc";

const bridge: BorneoBridge = {
  openBoardView: () => ipcRenderer.invoke("board:open-boardview"),
};

contextBridge.exposeInMainWorld("borneo", bridge);