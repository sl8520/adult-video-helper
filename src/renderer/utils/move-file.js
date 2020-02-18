const fs = require('fs')
const path = require('path')

export default (oldPath, newPath) => {
  const parentPathSplit = newPath.split(path.sep).slice()
  const parentPath = parentPathSplit.slice(0, parentPathSplit.length - 1).join(path.sep)

  // 判斷是否存在資料夾，若無則建立
  if (!fs.existsSync(parentPath)) {
    fs.mkdirSync(parentPath, { recursive: true })
  }

  return fs.renameSync(oldPath, newPath)
}
