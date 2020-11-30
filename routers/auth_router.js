var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Joi = require('@hapi/joi')
var User = require('../models/User')
var Role = require('../models/Role')
var Auth = require('../models/Auth')
var User_role = require('../models/User_role')
var Role_auth = require('../models/Role_auth')
const { query } = require('express')

// 判断权限
// router.use('/', async (req, res, next) => {
//     console.log('判断权限');
//     const validateList = ['/list']
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = await authJwt(req)
//         console.log('jwt_res')
//         console.log(jwt_res)
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
const validateLink = Joi.object({
    id: [
        null,
        Joi.number()
    ],
    name: Joi.string().min(3).max(10).required(),
    avatar: Joi.string().min(10).max(150).required(),
    description: Joi.string().min(3).max(30).required(),
    url: Joi.string().min(10).max(50).required(),
}).xor('id')

// 获取所有权限
router.get('/list', async function (req, res) {
    console.log('ssss')
    var { count, rows } = await Auth.findAndCountAll()
    res.status(200).json({ count, rows })
})

// 获取某个用户的所有权限
router.get('/getUserAuth', async function (req, res) {
    const { id } = req.query
    console.log('getUserAuthgetUserAuth')
    var { count, rows } = await User_role.findAndCountAll({
        include: [
            {
                model: Role,
                include: [
                    {
                        model: Auth,
                        through: { attributes: [] },
                    }
                ]
            }
        ],
        where: { user_id: id },
        // 去重
        distinct: true,
    })
    res.status(200).json({ count, rows })
})


// 查询某个权限的父级
router.get('/findParentAuth', async function (req, res) {
    // 查询当前权限的父级p_id
    let { p_id } = await Auth.findOne({
        attributes: ["p_id"],
        where: { id: req.query.id }
    })
    // 查询父级的p_id
    let result = await Auth.findOne({
        attributes: ["p_id"],
        where: { id: p_id }
    })
    let list
    if (result) {
        // 查询所有权限的p_id是父级p_id的数据
        list = await Auth.findAndCountAll({
            where: { p_id: result.p_id }
        })
    } else {
        // 查询所有权限的p_id是父级p_id的数据
        list = await Auth.findAndCountAll({
            where: { p_id: 0 }
        })
    }
    res.status(200).json({
        code: 200, list, message: "查询该权限父级成功"
    })
})

// 修改某个权限
router.put('/editAuth', async function (req, res) {
    let { id, p_id, auth_name, auth_description } = req.body
    console.log(id, p_id, auth_name, auth_description)
    let result = await Auth.update(
        {
            p_id, auth_name, auth_description,
        },
        {
            where: { id }
        }
    )
    // let result = 100
    res.status(200).json({
        code: 200, result, message: "修改权限成功!"
    })
})

// 新增权限
router.post('/addAuth', async function (req, res) {
    let { id, p_id, auth_name, auth_description } = req.body
    let result = Auth.create(
        {
            p_id, auth_name, auth_description,
        },
    )
    res.status(200).json({
        code: 200, result, message: "新增权限成功!"
    })
})

// 删除权限
router.delete('/delAuth', async function (req, res) {
    let { id } = req.body
    let result = Auth.destroy(
        {
            where: { id },
        },
    )
    res.status(200).json({
        code: 200, result, message: "删除权限成功!"
    })
})


module.exports = router