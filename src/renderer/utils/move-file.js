const fs = require('fs')

export default (oldPath, newPath) => {
  return fs.renameSync(oldPath, newPath)
}
