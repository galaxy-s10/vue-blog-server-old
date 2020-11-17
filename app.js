var express = require('express')
var bodyParser = require('body-parser')
var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
// parse application/json
app.use(bodyParser.json())

// app.all("*", function (req, res, next) {
//   //设置允许跨域的域名，*代表允许任意域名跨域
//   res.header("Access-Control-Allow-Origin", "*");
//   //允许的header类型
//   res.header("Access-Control-Allow-Headers", "content-type");
//   //跨域允许的请求方式 
//   res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
//   if (req.method.toLowerCase() == 'options')
//     res.send(200);  //让options尝试请求快速结束
//   else
//     next();
// })


var relation = require("./models/relation")
var article_router = require('./routers/article_router')
var user_router = require('./routers/user_router')
var qiniu_router = require('./routers/qiniu_router')
var comment_router = require('./routers/comment_router')
var tag_router = require('./routers/tag_router')
var link_router = require('./routers/link_router')
var role_router = require('./routers/role_router')
var auth_router = require('./routers/auth_router')
var role_auth_router = require('./routers/role_auth_router')

app.use('/', (req, res, next) => {
  console.log('==========开始匹配==========');
  next()
  console.log('==========匹配结束==========');
  return
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

// 统一处理报错
app.use('/', (err, req, res, next) => {
  console.log('!!!!!!!统一处理报错!!!!!!!');
  console.log(err);
  console.log('!!!!!!!统一处理报错!!!!!!!');
  switch (err.code) {
    case 200:
      res.status(401).json({ message: '权限不足！' })
      break;
    case 400:
      res.status(400).json({ message: err.message })
      break;
    case 401:
      res.status(401).json({ message: err.message })
      break;
    default:
      res.status(500).json(err)
  }
})

app.listen('3003', function () {
  console.log('3003,running......')
})