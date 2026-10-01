import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { importKicadPcb } from "@borneo/parsers";

const isDev = !app.isPackaged;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Borneo — iPhone 8 Repair Workstation",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    void win.loadURL(process.env.BORNEO_DEV_URL ?? "http://localhost:5173");
  } else {
    void win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

ipcMain.handle("board:open-boardview", async (event) => {
  const options: Electron.OpenDialogOptions = {
    title: "Open boardview file",
    properties: ["openFile"],
    filters: [{ name: "KiCad PCB", extensions: ["kicad_pcb"] }],
  };
  // Only allow the focused window to trigger file dialogs.
  const owner = BrowserWindow.fromWebContents(event.sender);
  const result = owner ? await dialog.showOpenDialog(owner, options) : await dialog.showOpenDialog(options);
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }
  const filePath = result.filePaths[0] ?? null;
  if (!filePath) {
    return { canceled: true };
  }

  const source = await readFile(filePath, "utf8");
  const imported = importKicadPcb(source, {
    sourceName: path.basename(filePath),
    sourceFormat: "kicad_pcb",
    description: `Opened from: ${filePath}`,
  });
  return {
    canceled: false,
    filePath,
    board: imported.board,
    warnings: imported.warnings,
  };
});

void app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});