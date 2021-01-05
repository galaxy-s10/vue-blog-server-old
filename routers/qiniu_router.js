var express = require('express')
var router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var qiniu = require('../models/qiniu')
var Qiniu_data = require('../models/Qiniu_data')
const authJwt = require('../lib/authJwt');
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "token":
            permissionResult = await permission(userInfo.id, "UPLOAD_QINIU");
            break;
        case "delete":
            permissionResult = await permission(userInfo.id, "DELETE_QINIU");
            break;
        case "update":
            permissionResult = await permission(userInfo.id, "UPDATE_QINIU");
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
})

// 七牛回调
router.post('/callback', async function (req, res, next) {
    // 七牛云上传回调特殊处理
    let callbackAuth = req.headers.authorization
    let nowTime = new Date()
    let y = nowTime.getFullYear()
    let m = nowTime.getMonth() + 1
    let d = nowTime.getDate()
    let startTime = `${y}-${m}-${d} 00:00:00`
    let endTime = `${y}-${m}-${d} 23:59:59`

    if (!qiniu.authCb(callbackAuth)) {
        next({ code: 401, message: '非法七牛云回调!' })
        return
    } else {
        console.log('req.body')
        console.log(req.body)
        // req.body.user_id = parseInt(req.body.user_id)
        let temp = { ...req.body, user_id: parseInt(req.body.user_id) }
        console.log(temp)
        let nowDayUploadNums = await Qiniu_data.findAndCountAll({
            where: {
                user_id: parseInt(req.body.user_id),
                createdAt: {
                    [Op.between]: [startTime, endTime]
                },
            }
        })
        // console.log(object)
        // console.log({...req.body})
        let result = await Qiniu_data.create({
            ...temp
        })
        res.status(200).json({ code: 200, ...req.body, message: `上传图片成功,每天能上传10次,今天还可${10 - nowDayUploadNums.count}次` })
    }

})

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
router.get('/token', async function (req, res, next) {
    let user_id = userInfo.id;
    let nowTime = new Date()
    let y = nowTime.getFullYear()
    let m = nowTime.getMonth() + 1
    let d = nowTime.getDate()
    let startTime = `${y}-${m}-${d} 00:00:00`
    let endTime = `${y}-${m}-${d} 23:59:59`
    let nowDayUploadNums = await Qiniu_data.findAndCountAll({
        where: {
            user_id,
            createdAt: {
                [Op.between]: [startTime, endTime]
            },
        }
    })
    console.log('nowDayUploadNums')
    console.log(nowDayUploadNums)
    if (nowDayUploadNums.count > 10) {
        res.status(200).json({ code: 200, ...req.body, message: '你今天没有上传次数了!' })
    } else {
        const uploadToken = qiniu.getQiniuToken()
        res.status(200).json({ code: 200, uploadToken, message: '获取七牛云token成功!' })
    }
})

// 删除七牛云文件
router.delete('/delete', function (req, res, next) {
    // const jwt_res = authJwt(req)
    // if (jwt_res.code == 401) {
    //     next(jwt_res)
    //     return
    // }
    qiniu.delete(req.body.filename).then(ress => {
        console.log(ress);
        res.status(200).json({ code: 200, ...ress, message: '删除七牛云图片成功!' })
    }).catch(err => {
        res.status(200).json({ code: 400, err, message: '删除七牛云图片失败!' })
    })
})

module.exports = router