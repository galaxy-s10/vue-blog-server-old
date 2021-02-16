var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
const { Op, fn, col, where } = require("sequelize");
var Frontend = require('../models/Frontend')
var User = require('../models/User')
var Article = require('../models/Article')
var Comment = require('../models/Comment')
var Visitor_log = require('../models/Visitor_log')
var authJwt = require('../lib/authJwt')
const userInfo = require("../lib/userInfo")
const permission = require("../lib/permission")

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    console.log(req.path.toLowerCase())
    switch (req.path.toLowerCase()) {
        case "/update":
            permissionResult = await permission(userInfo.id, 'FRONTEND_MANAGE');
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
})

// 判断参数
// const validateTag = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     name: Joi.string().min(3).max(20).required(),
//     color: Joi.string().max(50).required(),
// }).xor('id')

// 获取前台信息
router.get('/detail', async function (req, res, next) {
    var detail = await Frontend.findOne()
    var articleCount = await Article.count()
    var readCount = await Article.sum('click')
    var commentCount = await Comment.count()
    var visitorLogCount = await Visitor_log.count()
    var userCount = await User.count()
    res.status(200).json({
        code: 200,
        detail,
        summary: { articleCount, readCount, commentCount, visitorLogCount, userCount },
        message: '获取前台信息成功!'
    })
})


// 修改前台信息
router.put('/update', async function (req, res, next) {
    let row = { ...req.body }
    delete row.id
    const result = await Frontend.update({
        ...row
    }, {
        where: { id: req.body.id }
    })
    res.status(200).json({ code: 200, result, message: '修改前台信息成功!' })
})


module.exports = router