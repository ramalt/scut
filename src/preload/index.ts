import { contextBridge, ipcRenderer } from 'electron'
import type { Binding } from '../main/store'

const electronAPI = {
  getBindings: (): Promise<Binding[]> => ipcRenderer.invoke('get-bindings'),
  getGlobalVolume: (): Promise<number> => ipcRenderer.invoke('get-global-volume'),
  setGlobalVolume: (volume: number): Promise<void> => ipcRenderer.invoke('set-global-volume', volume),
  openFileDialog: (): Promise<string | null> => ipcRenderer.invoke('open-file-dialog'),
  addBinding: (data: {
    name: string
    filePath: string
    accelerator: string
    volume: number
  }): Promise<{ binding: Binding; warning?: string }> => ipcRenderer.invoke('add-binding', data),
  updateBinding: (id: string, partial: Partial<Binding>): Promise<Binding | null> =>
    ipcRenderer.invoke('update-binding', id, partial),
  deleteBinding: (id: string): Promise<boolean> => ipcRenderer.invoke('delete-binding', id),
  onPlaySound: (callback: (id: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, id: string) => callback(id)
    ipcRenderer.on('play-sound', handler)
    return () => ipcRenderer.removeListener('play-sound', handler)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
