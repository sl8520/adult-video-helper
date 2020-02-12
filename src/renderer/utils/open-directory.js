const { dialog } = require('electron')
const fs = require('fs')
const path = require('path')

export default () => {
  const directory = []

  // 開啟選擇檔案視窗
  const folder = dialog.showOpenDialogSync({ properties: ['openDirectory'] })
  if (folder) {
    // 選擇資料夾路徑
    const folderPath = folder.pop()
    // 讀取資料夾底下的所有資料夾
    fs.readdirSync(folderPath).forEach(file => {
      const dirPath = path.join(folderPath, file)
      // 判斷是否為資料夾
      if (fs.statSync(dirPath).isDirectory()) {
        directory.push({
          name: file,
          path: dirPath,
        })
      }
    })
  }

  return directory
}
