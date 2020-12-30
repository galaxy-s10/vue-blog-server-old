var express = require('express')
var router = express.Router()
var qiniu = require('../models/qiniu')
const authJwt = require('../lib/authJwt');

// 移动或重命名文件
router.put('/updateQiniu', async function (req, res, next) {
    let { srcKey, destKey } = req.body
    console.log(srcKey, destKey);
    try {
        const ress = await qiniu.updateQiniu('hssblog', srcKey, 'hssblog', destKey)
        res.status(200).json({ code: 200, ...ress, message: '更新七牛云数据成功！' })
    } catch (err) {
        res.status(400).json({ code: 400, err, message: '更新七牛云数据失败！' })
    }

})

// 获取七牛云指定前缀的文件列表
router.get('/getList', async function (req, res, next) {
    const ress = await qiniu.getList(req.query.prefix, req.query.limit, req.query.marker)
    res.status(200).json({ code: 200, ...ress, message: '获取七牛云数据成功！' })
})

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