var express = require('express')
var router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var qiniu = require('../models/qiniu')
var User = require('../models/User')
var Qiniu_data = require('../models/Qiniu_data')
const authJwt = require('../lib/authJwt');
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "/token":
            permissionResult = await permission(userInfo.id, "UPLOAD_QINIU");
            break;
        case "/delete":
            permissionResult = await permission(userInfo.id, "DELETE_QINIU");
            break;
        case "/update":
            permissionResult = await permission(userInfo.id, "UPDATE_QINIU");
            break;
    }
    if (permissionResult && permissionResult.code != 200) {
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
        let result = await Qiniu_data.create({
            ...temp
        })
        res.status(200).json({ code: 200, ...req.body, message: `上传${temp.key}成功,今天已使用${10 - 1 - nowDayUploadNums.count}/10次机会` })
    }

})

// 移动或重命名文件
router.put('/updateQiniu', async function (req, res, next) {
    let { srcKey, destKey } = req.body
    console.log(srcKey, destKey);
    try {
        const ress = await qiniu.updateQiniu('hssblog', srcKey, 'hssblog', destKey)
        const putTime = parseInt(new Date(ress.respInfo.headers.date).getTime() + "0000")
        const update_result = await Qiniu_data.update(
            {
                key: destKey,
                putTime,
            },
            {
                where: {
                    key: srcKey
                }
            })
        res.status(200).json({ code: 200, ...ress, update_result, message: '更新七牛云数据成功！' })
    } catch (err) {
        res.status(400).json({ code: 400, err, message: '更新七牛云数据失败！' })
    }

})

// 获取数据库qiniu_data列表
router.get('/pageList', async function (req, res, next) {
    var { nowPage, pageSize, keyword, updatedAt } = req.query
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    let whereData = {}
    if (updatedAt) {
        whereData['updatedAt'] = { [Op.between]: [updatedAt, `${updatedAt} 23:59:59`] }
    }
    let search = [
        {
            key: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            mimeType: {
                [Op.like]: '%' + "" + '%'
            }
        }
    ]
    if (keyword != undefined) {
        search = [
            {
                key: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                mimeType: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        ]
    }
    const ress = await Qiniu_data.findAndCountAll({
        limit: limit,
        offset: offset,
        distinct: true,
        where: {
            ...whereData,
            [Op.or]: search
        },
        include: [
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
            }
        ],
        // where: { user_id: id },
        // 去重
        distinct: true,
    })
    res.status(200).json({ code: 200, ...ress, message: '获取七牛云数据成功！' })
})

// 获取七牛云指定前缀的文件列表
router.get('/getAllQiniuData', async function (req, res, next) {
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
    if (nowDayUploadNums.count > 10 && user_id != 1) {
        res.status(200).json({ code: 200, message: '你今天没有上传文件次数了!' })
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
    qiniu.delete(req.body.filename).then(async ress => {
        await Qiniu_data.destroy(
            {
                where: { key: req.body.filename }
            })
        res.status(200).json({ code: 200, ...ress, message: `删除${req.body.filename}成功!` })
    }).catch(err => {
        res.status(200).json({ code: 400, err, message: `删除${req.body.filename}失败!` })
    })
})

// 插入七牛云
router.post('/insert', async function (req, res, next) {
    // const jwt_res = authJwt(req)
    // if (jwt_res.code == 401) {
    //     next(jwt_res)
    //     return
    // }
    console.log('req.body')
    console.log(req.body.putTime)
    let insert_result = await Qiniu_data.create({
        ...req.body, bucket: 'hssblog', user_id: 1, updatedAt: req.body.putTime
    }, {
        silent: true
    })
    res.status(200).json({ code: 200, insert_result, message: `上传${req.body.key}成功!` })
})

module.exports = router