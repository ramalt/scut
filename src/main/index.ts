import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import * as hotkeyManager from './hotkey-manager'
import * as store from './store'
import { registerHandlers } from './ipc-handlers'

const isDev = process.env['NODE_ENV'] === 'development' || !!process.env['ELECTRON_RENDERER_URL']

// Tek instance zorunluluğu — ikinci instance açılmaya çalışılırsa mevcut pencere öne getirilir
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    title: 'Scut — Soundboard',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow?.hide()
  })

  if (isDev) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] as string)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  const iconPath = join(__dirname, '../../resources/icon.png')
  let icon: Electron.NativeImage
  try {
    icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  } catch {
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)
  tray.setToolTip('Scut — Soundboard')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Göster / Gizle',
      click: () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
          mainWindow?.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Çıkış',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

app.whenReady().then(() => {
  registerHandlers()
  createWindow()
  createTray()

  hotkeyManager.setWindow(mainWindow!)
  const bindings = store.getBindings()
  hotkeyManager.registerAll(bindings)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('will-quit', () => {
  hotkeyManager.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  mainWindow?.show()
  mainWindow?.focus()
})

// Suppress security warning for dev
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
