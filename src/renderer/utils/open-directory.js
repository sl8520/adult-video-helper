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
      // 檔案名稱(番號)
      const name = file.split('.').shift()
      // 檔案副檔名
      const ext = file.split('.').pop()
      // A、B片原始檔名(番號)
      const pluralName = /(\w+-\d+)(.*)/.exec(name)
      const originName = pluralName ? pluralName[1] : name
      const suffix = pluralName ? pluralName[2] : ''
      // 欲建立資料夾路徑
      const folderPath = path.join(choosePath, originName)
      // 原始檔案路徑
      const filePath = path.join(choosePath, file)
      // 判斷是否為檔案
      if (fs.statSync(filePath).isFile()) {
        // 判斷是否為要抓的副檔名
        if (ext && extension.includes(ext)) {
          directory.push({
            name,
            ext,
            originName,
            suffix,
            path: folderPath,
            file: filePath,
          })
        }
      }
    })
  }

  return directory
}
