const fs = require('fs')
const path = require('path')

export default (text, folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    const file = path.join(folderPath, fileName)
    // 判斷檔案是否存在
    if (!fs.existsSync(file)) {
      // 判斷是否存在資料夾，若無則建立
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      // 創建資料流
      const stream = fs.createWriteStream(file, { flags: 'a' })
      stream.write(text + '\n')
      stream.on('finish', () => resolve())
        .on('error', e => reject(e))
    }
  })
}
