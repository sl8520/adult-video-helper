const path = require('path')
const os = require('os')

import request from '@/utils/request'
import downloaded from '@/utils/download-image'
import writeFile from '@/utils/write-file'
import store from '@/store'

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

      /** 整理影片訊息 */
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
      // 類別排列
      const genreRegex = /類別:(\r\n|\n|\r)(.*?)\s演員/gs
      const genreSplit = genreRegex.exec(info)
      const originGenre = genreSplit[2]
      const genreInfo = genreSplit[2].split(os.EOL).join('、')
      info = info.replace(originGenre, genreInfo)

      // 移除所有斷行
      info = info.replace(/(\r\n|\n|\r)/g, '')

      // 補回正常斷行
      const lineBreak = ['識別碼', '發行日期', '長度', '導演', '製作商', '發行商', '系列', '類別', '演員']
      info = lineBreak.reduce((prev, line) => {
        return prev.replace(`${line}:`, `${os.EOL}${line}:`)
      }, info)

      // 抓取各對應變數
      const substitute = {}
      lineBreak.forEach(line => {
        const pattern = new RegExp(`${line}:(.*)\\s*`, 'g')
        const regExec = pattern.exec(info)
        const variable = regExec ? regExec[1] : ''
        // 抓取對應變數
        switch (line) {
          case '識別碼':
            substitute.id = variable
            break
          case '發行日期':
            substitute.date = variable
            break
          case '長度':
            substitute.length = variable
            break
          case '導演':
            substitute.director = variable
            break
          case '製作商':
            substitute.maker = variable
            break
          case '發行商':
            substitute.studio = variable
            break
          case '系列':
            substitute.series = variable
            break
          case '類別':
            substitute.genre = variable
            break
          case '演員':
            substitute.actor = variable
            break
        }
      })

      // 組合標題進資訊欄
      info = `標題:${title}${info}`

      /** 替代字串 (組成新檔名) */
      const newFileName = {
        // 封面
        cover: '',
        // 劇照
        stills: '',
        // 影音
        video: '',
      }

      const settings = store.state.settings
      Object.keys(settings).forEach(key => {
        const fileRule = settings[key]
        newFileName[key] = Object.keys(substitute).reduce((prev, item) => {
          return prev.replace(`%${item}%`, substitute[item])
        }, fileRule)
      })

      /** 下載圖片 */
      // 封面圖
      const imgRegex = /var\s+img\s*=\s*[\'\"](.*)[\'\"]/g
      const imgUrl = imgRegex.exec(body)[1]
      const ext = imgUrl.split('.').pop()

      // 下載封面圖
      await downloaded(imgUrl, folderPath, `${newFileName.cover}.${ext}`)

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
        await downloaded(imgUrl, imagePath, `${newFileName.stills} - ${i}.${ext}`)

        // 抓取下一張圖片
        result = waterfallImgRegex.exec(waterfall)
        i++
      }

      // 儲存資訊為 txt
      writeFile(info, folderPath, fileName)

      resolve(newFileName)
    } catch (error) {
      reject(error)
    }
  })
}
