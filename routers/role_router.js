var express = require('express')
var router = express.Router()
const { autojwt } = require('./auto_jwt');
const Joi = require('@hapi/joi')
var User = require('../models/User')
var Role = require('../models/Role')
var Auth = require('../models/Auth')
var User_role = require('../models/User_role')
var Role_auth = require('../models/Role_auth')

// 判断权限
// router.use('/', async (req, res, next) => {
//     console.log('判断权限');
//     const validateList = ['/list']
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = await autojwt(req)
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

// 获取所有角色
router.get('/list', async function (req, res) {
    var { rows, count } = await Role.findAndCountAll()
    res.json({ count, rows })
})

// // 获取某个角色的权限
// router.get('/getAuth', async function (req, res) {
//     let { id } = req.query
//     let result = await Role.findAndCountAll({
//         include: [
//             {
//                 mode: Auth
//             },

//         ],
//         where: { id }
//     })
//     res.status(200).json({ code: 200, result })
// })

// 更新某个用户的角色
router.put('/editUserRole', async function (req, res) {
    let { id, roles } = req.body
    console.log(id, roles);
    let update_roles = await Role.findAll({ where: { id: roles } })
    let find_user = await User.findByPk(id)
    let result = await find_user.setRoles(update_roles)
    res.status(200).json({ code: 200, result })
})

// 修改某个角色的权限
router.put('/editRoleAuth', async function (req, res) {
    let { id, auths } = req.body
    console.log(id, auths);
    let update_auths = await Auth.findAll({ where: { id: auths } })
    let find_role = await Role.findByPk(id)
    let result = await find_role.setAuths(update_auths)
    res.status(200).json({ code: 200, result })
})



module.exports = router