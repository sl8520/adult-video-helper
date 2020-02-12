const fs = require('fs')
const path = require('path')

export default (text, folderPath, fileName) => {
  return new Promise((resolve, reject) => {
    const file = path.join(folderPath, `${fileName}.txt`)
    // 判斷檔案是否存在
    if (!fs.existsSync(file)) {
      // 創建資料流
      const stream = fs.createWriteStream(file, { flags: 'a' })
      stream.write(text + '\n')
      stream.on('finish', () => resolve())
        .on('error', e => reject(e))
    }
  })
}
