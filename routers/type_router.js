var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Joi = require('@hapi/joi')
var Type = require('../models/Type')

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "/add":
            permissionResult = await permission(userInfo.id, 'ADD_ARTICLE_TYPE');
            break;
        case "/delete":
            permissionResult = await permission(userInfo.id, 'DELETE_ARTICLE_TYPE');
            break;
        case "/update":
            permissionResult = await permission(userInfo.id, 'UPDATE_ARTICLE_TYPE');
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
})

// 获取文章分类列表
router.get('/pageList', async function (req, res, next) {
    var { nowPage, pageSize } = req.query
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    var { rows, count } = await Type.findAndCountAll({
        limit: limit,
        offset: offset,
        distinct: true,
    })
    res.status(200).json({ code: 200, pageSize, nowPage, lastPage: Math.ceil(count / pageSize), rows, count, message: '获取文章分类列表成功！' })
})

// 新增文章分类
router.post('/add', async function (req, res, next) {
    let params = { ...req.body }
    if (params.id) {
        delete params.id
    }
    var result = await Type.create(
        {
            ...params
        }
    )
    res.status(200).json({ code: 200, result, message: '添加文章分类成功！' })
})

// 修改文章分类
router.put('/update', async function (req, res, next) {
    const { id, name } = req.body
    var result = await Type.update(
        {
            name
        },
        {
            where: { id }
        })
    res.status(200).json({ code: 200, result, message: '修改文章分类成功！' })
})

// 删除文章分类
router.delete('/delete', async function (req, res, next) {
    var result = await Type.destroy(
        {
            where: { id: req.body.id }
        })

    res.status(200).json({ code: 200, result, message: '删除文章分类成功！' })
})


module.exports = router