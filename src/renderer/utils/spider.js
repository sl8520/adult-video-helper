const path = require('path')
import request from '@/utils/request'
import downloaded from '@/utils/download-image'
import writeFile from '@/utils/write-file'

function stripTags(text) {
  return text.replace(/(<([^>]+)>)/ig, '')
}

export default (url, folderPath, fileName) => {
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

      // 下載封面圖
      await downloaded(imgUrl, folderPath, `${fileName}.${ext}`)

      // 劇照
      const waterfallRegex = /<div id="sample-waterfall">(.*)<\/div>.*<div class="clearfix">/gs
      const waterfall = waterfallRegex.exec(body)[1]

      const waterfallImgRegex = /<a.*?class="sample-box".*?href="(.*?)">/g
      let result = waterfallImgRegex.exec(waterfall)
      let i = 1
      while (result) {
        const imgUrl = result[1]
        const ext = imgUrl.split('.').pop()
        const imagePath = path.join(folderPath, 'pic')
        // 下載劇照
        await downloaded(imgUrl, imagePath, `${i}.${ext}`)

        // 抓取下一張圖片
        result = waterfallImgRegex.exec(waterfall)
        i++
      }

      // 標題
      const titleRegex = /<h3>(.*?)<\/h3>/g
      const title = titleRegex.exec(body)[1]

      // 資訊
      const infoRegex = /<div class="col-md-3 info">(.*?)<\/div>/gs
      let info = stripTags(infoRegex.exec(body)[1])
      // 刪除空白
      while (info.indexOf(' ') >= 0) {
        info = info.replace(' ', '')
      }

      // 組合標題進資訊欄
      info = `標題:${title}\n${info}`

      // 儲存資訊為 txt
      writeFile(info, folderPath, fileName)

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
