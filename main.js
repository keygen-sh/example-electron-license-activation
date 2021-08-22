const console = require('console')
const { app, ipcMain, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const { machineId } = require('node-machine-id')

if (!app.isPackaged) {
  require('electron-reload')(__dirname)
}

// Handle sending app version to renderer
ipcMain.on('GET_APP_VERSION', event => event.returnValue = app.getVersion())

// Handle device fingerprinting
let deviceFingerprint = null

ipcMain.on('GET_DEVICE_FINGERPRINT', async event => {
  if (deviceFingerprint == null) {
    deviceFingerprint = await machineId()
  }

  if (!deviceFingerprint) {
    console.error('[FATAL] Failed to obtain a device fingerprint. Exiting...')

    app.exit(1)
  }

  event.returnValue = deviceFingerprint
})

// Handle auto-updates
ipcMain.on('CHECK_FOR_UPDATES', async (_event, license) => {
  if (process.env.NODE_ENV !== 'production') {
    const log = require('electron-log')

    log.transports.file.level = 'debug'

    autoUpdater.logger = log
  }

  autoUpdater.addAuthHeader(`Bearer ${license?.attributes?.metadata?.token ?? ''}`)
  autoUpdater.checkForUpdatesAndNotify()
})

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    }
  })

  window.loadFile('./build/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
