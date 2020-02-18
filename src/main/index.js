import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import ProgressBar from 'electron-progressbar'
import openDirectory from '@/utils/open-directory'
import spider from '@/utils/spider'
import moveFile from '@/utils/move-file'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, progressBar
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setMainMenu() {
  const template = [
    {
      label: '檔案',
      submenu: [
        {
          label: '首頁',
          click() {
            routeTo(mainWindow, 'Home')
          },
        },
        {
          label: '系統設定',
          click() {
            routeTo(mainWindow, 'Setting')
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function showProgressbar() {
  if (progressBar) {
    return false
  }

  progressBar = new ProgressBar({
    indeterminate: false,
    browserWindow: {
      parent: mainWindow,
      text: 'Preparing data...',
      detail: 'Wait...',
      webPreferences: {
        nodeIntegration: true,
      },
    },
  })

  progressBar
    .on('completed', () => {
      console.info(`completed...`)
      progressBar.detail = 'Task completed. Exiting...'
      progressBar = null
    })
    .on('aborted', value => {
      console.info(`aborted... ${value}`)
    })
    .on('progress', value => {
      // progressBar.detail = `Value ${value} out of ${progressBar.getOptions().maxValue}...`
    })
}

function routeTo(win, to = '', props = {}) {
  win.webContents.send('href', to, props)
}

app.on('ready', () => {
  createWindow()
  setMainMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 開啟資料夾
ipcMain.on('openDirectory', (event, arg) => {
  const directory = openDirectory()

  // 產生預覽資訊
  const tableList = directory.map(async(d, index) => {
    try {
      // 爬取圖片及資訊
      const { substitute } = await spider(d.originName, d.path)
      substitute.originId = d.name

      return substitute
    } catch (error) {
      console.error(`${d.name} 找不到此番號`)
    }
  })

  Promise.all(tableList).then(list => {
    mainWindow.webContents.send('tableList', { directory, list })
  })
})

// 下載資訊
ipcMain.on('download', (event, directory) => {
  const total = directory.length

  // 產生進度條
  if (total) {
    showProgressbar()
  }

  directory.forEach(async(d, index) => {
    try {
      // 爬取圖片及資訊
      const { newFileName } = await spider(d.originName, d.path)

      // 搬移影片至資料夾
      const videoSplit = newFileName.video.split('/')
      const videoFileName = `${videoSplit.pop()}${d.suffix}.${d.ext}`
      const videoPath = require('path').join(d.path, ...videoSplit, videoFileName)
      moveFile(d.file, videoPath)

      console.log(`${d.name} 已完成`)
    } catch (error) {
      console.error(`${d.name} 找不到此番號`)
    } finally {
      // 進度條
      if (progressBar) {
        progressBar.value = ((index + 1) / total) * 100
      }
    }
  })
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
