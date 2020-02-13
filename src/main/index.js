import { app, BrowserWindow, Menu } from 'electron'
import openDirectory from '@/utils/open-directory'
import spider from '@/utils/spider'
import moveFile from '@/utils/move-file'
import ProgressBar from 'electron-progressbar'

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
                await spider(url, d.path, d.name)

                // 搬移影片至資料夾
                moveFile(d.file, d.newFile)

                console.log(`${d.name} 已完成`)
              } catch (error) {
                console.error(`${d.name} 找不到此番號`)
              } finally {
                // 進度條
                progressBar.value = ((index + 1) / total) * 100
              }
            })
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

  // launch a task and set the value of the progress bar each time a part of the task is done;
  // the progress bar will be set as completed when it reaches its maxValue (default maxValue: 100);
  // ps: setInterval is used here just to simulate a task being done
  // setInterval(function() {
  //   if (progressBar) {
  //     if (!progressBar.isCompleted()) {
  //       progressBar.value += 1
  //     }
  //   }
  // }, 100)
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
