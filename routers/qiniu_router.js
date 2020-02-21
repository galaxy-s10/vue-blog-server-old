var express = require('express')
var router = express.Router()
var qiniu = require('../models/qiniu')

//获取七牛云token
router.get('/token', function (req, res) {
    console.log('获取ak,sk')
    const uploadToken = qiniu.getQiniuToken()
    res.status(200).send({
        code: 20000,
        uploadToken
    })
})
//删除七牛云文件
router.get('/del', function (req, res) {
    console.log('删除七牛云文件' + req.query.filename)
    qiniu.del(req.query.filename).then(ress =>{
        res.status(200).send({
            code: 20000,
            data: ress
        })
    }).catch(err =>{
        res.status(200).send({
            data: err
        })
    })
})

module.exports = router