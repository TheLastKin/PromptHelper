// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    onURLReceived: (callback: (e: Electron.IpcRendererEvent, url: string) => void) => ipcRenderer.on("onURLReceived", callback),
    startChecking: () => ipcRenderer.send("startChecking"),
    stopChecking: () => ipcRenderer.send("stopChecking"),
    saveFromHTTPS: (url: string, refID: number) => ipcRenderer.invoke("saveFromHTTPS", url, refID),
    saveFromBuffer: (buffer: Buffer, fileName: string, refID: number) => ipcRenderer.invoke("saveFromBuffer", buffer, fileName, refID),
    removeFile: (path: string) => ipcRenderer.send("removeRefImage", path),
    toggleWindowMode: () => ipcRenderer.send("toggleWindowMode"),
    startDownload: (downloadURL: string) => ipcRenderer.invoke("startDownload", downloadURL),
    downloadProgress: (callback: (e: Electron.IpcRendererEvent, progress: number) => void) => ipcRenderer.on("downloadProgress", callback),
    selectDownloadFolder: () => ipcRenderer.invoke("selectDownloadFolder"),
});