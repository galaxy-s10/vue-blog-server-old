var express = require('express')
var router = express.Router()
var qiniu = require('../models/qiniu')
const authJwt = require('../lib/authJwt');

// 获取七牛云token
router.get('/token', function (req, res, next) {
    const jwt_res = authJwt(req)
    if (jwt_res.code == 401) {
        next(jwt_res)
        return
    }
    const uploadToken = qiniu.getQiniuToken()
    res.status(200).json(uploadToken)
})
// 删除七牛云文件
router.get('/del', function (req, res, next) {
    const jwt_res = authJwt(req)
    if (jwt_res.code == 401) {
        next(jwt_res)
        return
    }
    qiniu.del(req.query.filename).then(ress => {
        console.log(ress);
        const message = ress == 1 ? '删除七牛云图片成功' : '删除七牛云图片失败'
        res.status(200).json(message)
    }).catch(err => {
        res.status(200).json(err)
    })
})

module.exports = router