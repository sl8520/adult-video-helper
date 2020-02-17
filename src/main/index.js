import { app, BrowserWindow, Menu } from 'electron'
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
          label: '選擇資料夾',
          click() {
            const directory = openDirectory()
            const total = directory.length

            // 產生進度條
            if (directory.length) {
              showProgressbar()
            }

            directory.forEach(async(d, index) => {
              try {
                // 爬取圖片及資訊
                const url = `https://www.javbus.com/${d.name}`
                const newFileName = await spider(url, d.path, d.name)

                // 搬移影片至資料夾
                moveFile(d.file, require('path').join(d.path, `${newFileName.video}.${d.ext}`))

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

function routeTo(win, to = '') {
  win.webContents.send('href', to)
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
