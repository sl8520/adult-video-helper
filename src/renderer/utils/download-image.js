const fs = require('fs')
const path = require('path')
import request from '@/utils/request'

export default (imgUrl, imgPath, imgName) => {
  return new Promise((resolve, reject) => {
    request({
      url: imgUrl,
      responseType: 'stream',
    }).then(response => {
      // 判斷是否存在資料夾，若無則建立
      if (!fs.existsSync(imgPath)) {
        fs.mkdirSync(imgPath, { recursive: true })
      }

      const img = path.join(imgPath, imgName)
      response
        .pipe(fs.createWriteStream(img))
        .on('finish', () => resolve())
        .on('error', e => reject(e))
    }).catch(error => {
      reject(error)
    })
  })
}
