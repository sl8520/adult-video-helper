import request from '@/utils/request'
import downloaded from '@/utils/download-image'
import writeFile from '@/utils/write-file'

function stripTags(text) {
  return text.replace(/(<([^>]+)>)/ig, '')
}

export default (url, path, fileName) => {
  return new Promise(async(resolve, reject) => {
    try {
      const body = await request({
        url,
        method: 'get',
      })

      // 封面圖
      const imgRegex = /var\s+img\s*=\s*[\'\"](.*)[\'\"]/g
      const imgUrl = imgRegex.exec(body)[1]
      const ext = imgUrl.split('.').pop()

      // 下載圖片
      await downloaded(imgUrl, path, `${fileName}.${ext}`)

      // 資訊
      const infoRegex = /<div class="col-md-3 info">(.*?)<\/div>/gs
      let info = stripTags(infoRegex.exec(body)[1])
      // 刪除空白
      while (info.indexOf(' ') >= 0) {
        info = info.replace(' ', '')
      }

      // 儲存資訊為 txt
      writeFile(info, path, fileName)

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
