const path = require('path')
const readlineSync = require('readline-sync');

module.exports = {
  globalCode: `import request from '@/utils/request' \n`,
  categoryId: null,
  methodName: function (apipath, categoryId) {
    let apipaths = apipath.split('/').filter(i => i && !(/(^{\w+}$)|(^:\w+$)/g.test(i)));
    apipaths = apipaths.map(p => {
      return p.replace(/[^a-zA-Z0-9\_]+/g, '')
    })
    if (!apipaths.length) {
      console.log(`由于该api路径${apipath}为根路径, 请输入请求方法名称:`);
      return readlineSync.question().replace(/[^a-zA-Z0-9\_]+/g, '')
    }
    return categoryId ? apipaths[length - 1] : apipaths.join('_')
  },
  server: '',
  token: '',
  dist: path.resolve(process.cwd(), 'yapi-gen-js-code.js'),
  showSubProperties: false,
  showInfo: true
}