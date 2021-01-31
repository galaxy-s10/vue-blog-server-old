var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
var Frontend = require('../models/Frontend')
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
    res.status(200).json({ code: 200, detail, message: '获取前台信息成功!' })
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