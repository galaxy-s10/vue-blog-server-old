var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Link = require('../models/Link')
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')


// 判断权限
// router.use('/', (req, res, next) => {
//     console.log('判断权限');
//     const validateList = ['/add', '/del', '/edit']
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = authJwt(req)
//         if (jwt_res.code == 401) {
//             console.log(jwt_res.message);
//             next(jwt_res)
//         } else {
//             console.log('合法token');
//             next()
//         }
//         // 不加return会继续执行if语句外面的代码
//         return
//     } else {
//         next()
//         return
//     }
//     // console.log('没想到吧，我还会执行');
// })

// 判断参数
// const validateLink = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     name: Joi.string().min(3).max(10).required(),
//     avatar: Joi.string().min(10).max(150).required(),
//     description: Joi.string().min(3).max(30).required(),
//     url: Joi.string().min(10).max(50).required(),
// }).xor('id')

// 获取友链
// router.get('/list', async function (req, res) {
//     var { rows, count } = await Link.findAndCountAll()
//     res.json({ count, rows })
// })

// 获取友链列表
router.get('/pageList', async function (req, res) {
    var { nowPage, pageSize,keyword, status, createdAt, updatedAt } = req.query
    console.log('nowPage, pageSize')
    console.log(req.query)
    console.log(nowPage, pageSize)
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    let whereData = {}
    if (createdAt) {
        whereData['createdAt'] = { [Op.between]: [createdAt, `${createdAt} 23:59:59`] }
    }
    if (updatedAt) {
        whereData['updatedAt'] = { [Op.between]: [updatedAt, `${updatedAt} 23:59:59`] }
    }
    let search = [
        {
            name: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            description: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            url: {
                [Op.like]: '%' + "" + '%'
            }
        }
    ]
    let permissionResult = await permission(userInfo.id, 'SELECT_MUSIC')

    if (status != undefined) {
        if (!permissionResult) {
            whereData['status'] = 1
        } else {
            whereData['status'] = status
        }

    } else {
        if (!permissionResult) {
            whereData['status'] = 1
        }
    }
    if (keyword != undefined) {
        search = [
            {
                name: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                description: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                url: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        ]
    }
    var { count, rows } = await Link.findAndCountAll({
        order: [['createdAt', 'desc']],
        where: {
            ...whereData,
            [Op.or]: search
        },
        limit: limit,
        offset: offset,
        // 去重
        distinct: true,
    })
    res.status(200).json({ code: 200, count, rows, message: '获取友链列表成功！' })

    // var { rows, count } = await Link.findAndCountAll()
    // res.json({ count, rows })
})

// 新增友链
router.post('/add', async function (req, res, next) {
    // try {
    //     await validateLink.validateAsync(req.body, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const { name, avatar, description, url, status } = req.body
    // if (jwt_res.user.role == 'admin') {
    var result = await Link.create(
        {
            ...req.body
        }
    )
    res.status(200).json({ code: 200, result, message: '添加友链成功！' })

    // } else {
    //     next(jwt_res)
    // }
})

// 修改友链
router.put('/update', async function (req, res, next) {
    // try {
    //     await validateLink.validateAsync(req.body, { convert: false, allowUnknown: true })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    const { id, name, avatar, description, url, status } = req.body
    // if (jwt_res.user.role == 'admin') {
    var result = await Link.update(
        {
            name, avatar, description, url, status
        },
        {
            where: { id }
        })
    res.status(200).json({ code: 200, result, message: '修改友链成功！' })
    // } else {
    //     next(jwt_res)
    //     return
    // }

})

// 删除友链
router.delete('/delete', async function (req, res, next) {
    // try {
    //     await Joi.number().required().validateAsync(req.body.id, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const jwt_res = authJwt(req)
    // if (jwt_res.user.role == 'admin') {
    var result = await Link.destroy(
        {
            where: { id: req.body.id }
        })

    res.status(200).json({ code: 200, result, message: '删除友链成功！' })
    // } else {
    //     next(jwt_res)
    //     return
    // }
})


module.exports = router