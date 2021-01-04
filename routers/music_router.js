var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi')
var Music = require('../models/Music')
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')


// 判断参数
// const validateMusic = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     name: Joi.string().min(3).max(10).required(),
//     avatar: Joi.string().min(10).max(150).required(),
//     description: Joi.string().min(3).max(30).required(),
//     url: Joi.string().min(10).max(50).required(),
// }).xor('id')

// 获取音乐列表
router.get('/pageList', async function (req, res) {
    var { nowPage, pageSize, keyword, status, createdAt, updatedAt } = req.query
    console.log(nowPage, pageSize, keyword, status)
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
            author: {
                [Op.like]: '%' + "" + '%'
            }
        }
    ]
    if (keyword != undefined) {
        search = [
            {
                name: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                author: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        ]
    }
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
    // return res.json(1)
    var { count, rows } = await Music.findAndCountAll({
        limit: limit,
        offset: offset,
        distinct: true,
        order: [['createdAt', 'desc']],
        where: {
            ...whereData,
            [Op.or]: search
        },
    })
    res.status(200).json({ code: 200, count, rows, message: '获取音乐列表成功！' })

})

// 查找音乐
router.get('/findOne', async function (req, res, next) {
    var detail = await Music.findOne(
        {
            where: {
                id: req.query.id
            },
        }
    )
    res.status(200).json({ code: 200, detail, message: '查找音乐成功！' })
})

// 新增音乐
router.post('/add', async function (req, res, next) {
    var result = await Music.create(
        {
            ...req.body
        }
    )
    res.status(200).json({ code: 200, result, message: '新增音乐成功！' })
})

// 修改音乐
router.put('/update', async function (req, res, next) {
    const { id, name, author, img, url, status } = req.body
    var result = await Music.update(
        {
            name, author, img, url, status
        },
        {
            where: { id }
        })
    res.status(200).json({ code: 200, result, message: '修改音乐成功！' })
})

// 删除音乐
router.delete('/delete', async function (req, res, next) {
    var result = await Music.destroy(
        {
            where: { id: req.body.id }
        })

    res.status(200).json({ code: 200, result, message: '删除音乐成功！' })
})


module.exports = router