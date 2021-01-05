var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
var Frontend = require('../models/Frontend')
var authJwt = require('../lib/authJwt')

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "add":
            permissionResult = await permission(userInfo.id, 'ADD_FRONTEND');
            break;
        case "delete":
            permissionResult = await permission(userInfo.id, 'DELETE_FRONTEND');
            break;
        case "update":
            permissionResult = await permission(userInfo.id, 'UPDATE_FRONTEND');
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
router.get('/detail', async function (req, res) {
    var detail = await Frontend.findOne()
    res.status(200).json({ code: 200, detail, message: '获取前台信息成功！' })

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
    res.status(200).json({ code: 200, result, message: '修改前台信息成功！' })
})

// 新增标签
router.post('/add', async function (req, res, next) {
    // try {
    //     await validateTag.validateAsync(req.body, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const jwt_res = authJwt(req)
    // if (jwt_res.user.role == 'admin') {
    // const { name, color } = req.body
    const result = await Tag.create({
        ...req.body
    })
    res.status(200).json({ code: 200, result, message: '新增标签成功！' })

    // } else {
    //     next(jwt_res)
    //     return
    // }
})

// 删除标签
router.delete('/del', async function (req, res, next) {
    // try {
    //     await Joi.number().required().validateAsync(req.body.id, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const jwt_res = authJwt(req)
    let find_tag = await Tag.findByPk(req.body.id)
    console.log(find_tag);
    if (find_tag == null) {
        next({ code: 400, message: '不能删除不存在的tag!' })
        return
    }
    let delelte_res = await find_tag.setArticles([])
    await find_tag.destroy()
    res.status(200).json({ code: 200, delelte_res, message: '删除标签成功！' })
})


module.exports = router