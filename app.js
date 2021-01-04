let express = require('express')
let bodyParser = require('body-parser')
let Log = require('./models/Log')
let User = require('./models/User')
let authJwt = require('./lib/authJwt')
let getStatus = require('./lib/getStatus')
let permission = require('./lib/permission')
let addLog = require('./lib/addLog')
let userInfo = require('./lib/userInfo')
let qiniu = require("./models/qiniu")
let app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
// parse application/json
app.use(bodyParser.json())

app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "Content-Type,authorization,request-origin");
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.send(200);  //让options尝试请求快速结束
  else
    next();
})


let relation = require("./models/relation")
let article_router = require('./routers/article_router')
let user_router = require('./routers/user_router')
let qiniu_router = require('./routers/qiniu_router')
let comment_router = require('./routers/comment_router')
let tag_router = require('./routers/tag_router')
let link_router = require('./routers/link_router')
let role_router = require('./routers/role_router')
let auth_router = require('./routers/auth_router')
let role_auth_router = require('./routers/role_auth_router')
let log_router = require('./routers/log_router')
let star_router = require('./routers/star_router')
let frontend_router = require('./routers/frontend_router')
let music_router = require('./routers/music_router')
let type_router = require('./routers/type_router')

//转换时间格式
function formateDate(datetime) {
  function addDateZero(num) {
    return num < 10 ? "0" + num : num;
  }
  let d = new Date(datetime);
  let formatdatetime =
    d.getFullYear() +
    "-" +
    addDateZero(d.getMonth() + 1) +
    "-" +
    addDateZero(d.getDate()) +
    " " +
    addDateZero(d.getHours()) +
    ":" +
    addDateZero(d.getMinutes()) +
    ":" +
    addDateZero(d.getSeconds());
  return formatdatetime;
}


// console.log(formateDate(beforeDate))
// console.log(formateDate(nowDate))

app.use('/', async (req, res, next) => {
  console.log('**********全局监听开始**********');
  if (req.path == '/qiniu/callback') {
    // 七牛云上传回调特殊处理
    const callbackAuth = req.headers.authorization
    if (req.headers.authorization == undefined || !qiniu.authCb(callbackAuth)) {
      next({ code: 401, message: '非法七牛云回调!' })
      return
    }
    next()
  } else {
    // 首先判断jwt
    let jwtResult = await authJwt(req)
    if (jwtResult.code == 401 && jwtResult.message != '未登录!') {
      next(jwtResult)
      return
    } else {
      console.log('jwtResult.code')
      console.log(jwtResult)
      if (jwtResult.code == 200) {
        let getStatusResult = await getStatus(jwtResult.userInfo.id)
        if (getStatusResult.code == 403) {
          console.log('**********全局监听完成1**********');
          return next(getStatusResult)
        }
        await addLog(jwtResult.userInfo.id, req)
      }
      userInfo.id = jwtResult.userInfo && jwtResult.userInfo.id
      console.log('**********全局监听完成2**********');
      return next()
    }
  }
  // console.log('**********全局监听完成**********');
})


app.use('/article', article_router)
app.use('/user', user_router)
app.use('/qiniu', qiniu_router)
app.use('/comment', comment_router)
app.use('/tag', tag_router)
app.use('/link', link_router)
app.use('/role', role_router)
app.use('/auth', auth_router)
app.use('/roleauth', role_auth_router)
app.use('/log', log_router)
app.use('/star', star_router)
app.use('/frontend', frontend_router)
app.use('/music', music_router)
app.use('/type', type_router)

// 统一处理报错
app.use('/', (err, req, res, next) => {
  console.log('!!!!!!!统一处理报错!!!!!!!');
  console.log(err);
  console.log('!!!!!!!统一处理报错!!!!!!!');
  switch (err.code) {
    case 200:
      res.status(401).json({ code: 401, message: '权限不足！' })
      break;
    case 400:
      res.status(400).json(err)
      break;
    case 401:
      res.status(401).json(err)
      break;
    case 403:
      res.status(403).json(err)
      break;
    default:
      res.status(500).json(err)
  }
})

app.listen('3003', function () {
  console.log('3003,running......')
})