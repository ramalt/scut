import { ipcMain, dialog, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import * as store from './store'
import * as hotkeyManager from './hotkey-manager'
import type { Binding } from './store'

function getSoundsDir(): string {
  return path.join(app.getPath('userData'), 'sounds')
}

function ensureSoundsDir(): void {
  const dir = getSoundsDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyToUserData(srcPath: string): string {
  ensureSoundsDir()
  const ext = path.extname(srcPath)
  const dest = path.join(getSoundsDir(), `${uuidv4()}${ext}`)
  fs.copyFileSync(srcPath, dest)
  return dest
}

export function registerHandlers(): void {
  ipcMain.handle('get-bindings', () => {
    return store.getBindings()
  })

  ipcMain.handle('get-global-volume', () => {
    return store.getGlobalVolume()
  })

  ipcMain.handle('set-global-volume', (_e, volume: number) => {
    store.setGlobalVolume(volume)
  })

  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Ses Dosyası Seç',
      filters: [
        { name: 'Ses Dosyaları', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('add-binding', (_e, data: { name: string; filePath: string; accelerator: string; volume: number }) => {
    const localPath = copyToUserData(data.filePath)
    const binding: Binding = {
      id: uuidv4(),
      name: data.name,
      filePath: localPath,
      accelerator: data.accelerator,
      volume: data.volume,
      enabled: true
    }
    store.addBinding(binding)
    const success = hotkeyManager.register(binding)
    if (!success) {
      return { binding, warning: `"${data.accelerator}" tuş kombinasyonu zaten kullanımda.` }
    }
    return { binding }
  })

  ipcMain.handle('update-binding', (_e, id: string, partial: Partial<Binding>) => {
    const existing = store.getBindings().find((b) => b.id === id)
    if (!existing) return null

    if (existing.accelerator) {
      hotkeyManager.unregister(existing.accelerator)
    }

    const updated = store.updateBinding(id, partial)
    if (!updated) return null

    if (updated.enabled && updated.accelerator) {
      hotkeyManager.register(updated)
    }

    return updated
  })

  ipcMain.handle('delete-binding', (_e, id: string) => {
    const existing = store.getBindings().find((b) => b.id === id)
    if (existing?.accelerator) {
      hotkeyManager.unregister(existing.accelerator)
    }
    if (existing?.filePath && fs.existsSync(existing.filePath)) {
      try { fs.unlinkSync(existing.filePath) } catch { /* ignore */ }
    }
    return store.deleteBinding(id)
  })

  ipcMain.handle('get-sound-path', (_e, filePath: string) => {
    return filePath
  })
}
