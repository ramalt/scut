import { globalShortcut, BrowserWindow } from 'electron'
import type { Binding } from './store'

let mainWindow: BrowserWindow | null = null

export function setWindow(win: BrowserWindow): void {
  mainWindow = win
}

function isValidAccelerator(acc: string): boolean {
  // Electron yalnızca ASCII accelerator kabul ediyor
  return /^[\x00-\x7F]+$/.test(acc)
}

export function register(binding: Binding): boolean {
  if (!binding.enabled || !binding.accelerator) return false
  if (!isValidAccelerator(binding.accelerator)) return false

  try {
    if (globalShortcut.isRegistered(binding.accelerator)) {
      globalShortcut.unregister(binding.accelerator)
    }

    const success = globalShortcut.register(binding.accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('play-sound', binding.id)
      }
    })

    return success
  } catch {
    return false
  }
}

export function unregister(accelerator: string): void {
  if (!accelerator || !isValidAccelerator(accelerator)) return
  try {
    if (globalShortcut.isRegistered(accelerator)) {
      globalShortcut.unregister(accelerator)
    }
  } catch {
    // ignore invalid accelerator
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
