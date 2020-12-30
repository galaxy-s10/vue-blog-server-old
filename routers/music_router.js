var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const Joi = require('@hapi/joi')
var Music = require('../models/Music')

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
    var { is_admin, nowPage, pageSize, name, status } = req.query
    console.log(is_admin, nowPage, pageSize, name, status)
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    if (is_admin) {
        var { count, rows } = await Music.findAndCountAll({
            limit: limit,
            offset: offset,
            distinct: true,
            order: [['createdAt', 'desc']],
            where: {
                [Op.or]: [
                    {
                        name: name ? {
                            [Op.like]: '%' + name + '%'
                        } : { [Op.like]: '%' + '' + '%' }
                    },
                ],
                status: status != undefined ? status : [0, 1],
            }
        })
        res.status(200).json({ code: 200, count, rows, message: '获取音乐列表成功！' })

    } else {
        var { count, rows } = await Music.findAndCountAll({
            limit: limit,
            offset: offset,
            distinct: true,
            order: [['createdAt', 'desc']],
            where: {
                [Op.or]: [
                    {
                        name: name ? {
                            [Op.like]: '%' + name + '%'
                        } : { [Op.like]: '%' + '' + '%' }
                    },
                ],
                status: 1,
            }
        })
        res.status(200).json({ code: 200, count, rows, message: '获取音乐列表成功！' })

    }
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