const path = require('path')
const os = require('os')

import request from '@/utils/request'
import downloaded from '@/utils/download-image'
import writeFile from '@/utils/write-file'
import store from '@/store'

function stripTags(text) {
  return text.replace(/(<([^>]+)>)/ig, '')
}

export default (videoId, folderPath, save = false) => {
  return new Promise(async(resolve, reject) => {
    try {
      const body = await request({
        url: `https://www.javbus.com/${videoId}`,
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
        // 資訊
        info: '',
      }

      const settings = store.state.settings
      Object.keys(settings).forEach(key => {
        const fileRule = settings[key]
        newFileName[key] = Object.keys(substitute).reduce((prev, item) => {
          // Replace all
          return prev.split(`%${item}%`).join(substitute[item])
        }, fileRule)
      })

      if (save) {
        /** 下載圖片 */
        // 封面圖
        const coverRegex = /var\s+img\s*=\s*[\'\"](.*)[\'\"]/g
        const coverUrl = coverRegex.exec(body)[1]
        const ext = coverUrl.split('.').pop()

        // 下載封面圖
        const coverSplit = newFileName.cover.split('/')
        const coverFileName = `${coverSplit.pop()}.${ext}`
        const coverPath = path.join(folderPath, ...coverSplit)
        await downloaded(coverUrl, coverPath, coverFileName)

        // 劇照
        const waterfallRegex = /<div id="sample-waterfall">(.*)<\/div>.*<div class="clearfix">/gs
        const waterfall = waterfallRegex.exec(body)[1]

        const stillsRegex = /<a.*?class="sample-box".*?href="(.*?)">/g
        let result = stillsRegex.exec(waterfall)
        let i = 1
        while (result) {
          const stillsUrl = result[1]
          const ext = stillsUrl.split('.').pop()
          const stillsSplit = newFileName.stills.split('/')
          const stillsFileName = `${stillsSplit.pop()} - ${i}.${ext}`
          const stillsPath = path.join(folderPath, ...stillsSplit)
          // 下載劇照
          await downloaded(stillsUrl, stillsPath, stillsFileName)

          // 抓取下一張圖片
          result = stillsRegex.exec(waterfall)
          i++
        }

        // 儲存資訊為 txt
        const infoSplit = newFileName.info.split('/')
        const infoFileName = `${infoSplit.pop()}.txt`
        const infoPath = path.join(folderPath, ...infoSplit)
        writeFile(info, infoPath, infoFileName)
      }

      resolve({ substitute, newFileName })
    } catch (error) {
      reject(error)
    }
  })
}
