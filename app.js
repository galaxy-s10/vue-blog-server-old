var express = require('express')
var bodyParser = require('body-parser')
var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

var relation = require("./models/relation")
var article_router = require('./routers/article_router')
var user_router = require('./routers/user_router')
var qiniu_router = require('./routers/qiniu_router')
var comment_router = require('./routers/comment_router')

app.use('/article', article_router)
app.use('/user', user_router)
app.use('/qiniu', qiniu_router)
app.use('/comment', comment_router)

// 统一处理报错
app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json({
      message: err
    })
  }
})

app.listen('3003', function () {
  console.log('running......')
})