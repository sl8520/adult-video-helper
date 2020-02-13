const { dialog } = require('electron')
const fs = require('fs')
const path = require('path')

export default () => {
  const directory = []

  // 開啟選擇檔案視窗
  const folder = dialog.showOpenDialogSync({ properties: ['openDirectory'] })
  if (folder) {
    // 選擇資料夾路徑
    const choosePath = folder.pop()

    // 要抓取的副檔名
    const extension = ['mp4']

    // 讀取資料夾底下的所有檔案
    fs.readdirSync(choosePath).forEach(file => {
      // 檔案名稱
      const name = file.split('.').shift()
      // 檔案副檔名
      const ext = file.split('.').pop()
      // 欲建立資料夾路徑
      const folderPath = path.join(choosePath, name)
      // 原始檔案路徑
      const filePath = path.join(choosePath, file)
      // 搬移檔案路徑
      const newFilePath = path.join(folderPath, file)
      // 判斷是否為檔案
      if (fs.statSync(filePath).isFile()) {
        // 判斷是否為要抓的副檔名
        if (ext && extension.includes(ext)) {
          directory.push({
            name,
            path: folderPath,
            file: filePath,
            newFile: newFilePath,
          })
        }
      }
    })
  }

  return directory
}
