var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
var Front = require('../models/Front')
var authJwt = require('../lib/authJwt')

// 判断权限
// router.use((req, res, next) => {
//     console.log('判断权限');
//     const validateList = ['/add', '/del']
//     console.log(validateList.indexOf(req.path.toLowerCase()));
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = authJwt(req)
//         console.log(jwt_res);
//         jwt_res.code == 401 ? next(jwt_res) : next()
//         // 不加return会继续执行if语句外面的代码
//         return
//     } else {
//         next()
//     }
//     // console.log('没想到吧，我还会执行');
// })

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
    var detail = await Front.findOne()
    res.status(200).json({ code: 200, detail, message: '获取前台信息成功！' })

})


// 修改前台信息
router.put('/update', async function (req, res, next) {
    let row = { ...req.body }
    delete row.id
    const result = await Front.update({
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