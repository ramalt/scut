import { globalShortcut, BrowserWindow } from 'electron'
import type { Binding } from './store'

let mainWindow: BrowserWindow | null = null

export function setWindow(win: BrowserWindow): void {
  mainWindow = win
}

export function register(binding: Binding): boolean {
  if (!binding.enabled || !binding.accelerator) return false

  if (globalShortcut.isRegistered(binding.accelerator)) {
    globalShortcut.unregister(binding.accelerator)
  }

  const success = globalShortcut.register(binding.accelerator, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('play-sound', binding.id)
    }
  })

  return success
}

export function unregister(accelerator: string): void {
  if (globalShortcut.isRegistered(accelerator)) {
    globalShortcut.unregister(accelerator)
  }
}

export function registerAll(bindings: Binding[]): void {
  unregisterAll()
  for (const binding of bindings) {
    if (binding.enabled) {
      register(binding)
    }
  }
}

export function unregisterAll(): void {
  globalShortcut.unregisterAll()
}
