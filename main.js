const console = require('console')
const { app, ipcMain, BrowserWindow } = require('electron')
const { MacUpdater } = require('electron-updater')
const { machineId } = require('node-machine-id')

if (!app.isPackaged) {
  require('electron-reload')(__dirname)
}

const KEYGEN_ACCOUNT_ID = '1fddcec8-8dd3-4d8d-9b16-215cac0f9b52'
const KEYGEN_BASE_URL = 'https://api.keygen.sh'

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
  const { platform } = process
  const options = {
    url: `${KEYGEN_BASE_URL}/v1/accounts/${KEYGEN_ACCOUNT_ID ?? ''}/artifacts/electron-example?token=${license?.attributes?.metadata?.token ?? ''}`,
    useMultipleRangeRequest: false,
    provider: 'generic',
  }

  let updater = null

  switch (platform) {
    case 'darwin':
      updater = new MacUpdater(options)

      break
  }

  if (updater != null) {
    updater.checkForUpdates()
  }
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
