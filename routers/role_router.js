const express = require('express')
const router = express.Router()
const permission = require('../lib/permission')
const Joi = require('@hapi/joi')
const User = require('../models/User')
const Role = require('../models/Role')
const Auth = require('../models/Auth')
const User_role = require('../models/User_role')
const Role_auth = require('../models/Role_auth')
const userInfo = require('../lib/userInfo')

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
    const { rows, count } = await Role.findAndCountAll()
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
router.put('/aaa', async function (req, res) {
    let id = 1
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
        where: { user_id: id }
    })
    res.json(rows)
    let temp = [];
    console.log("获取某个用户的所有权限");
    rows.forEach((item) => {
        // console.log(item.role.auths);
        item.role.auths.forEach((val) => {
            temp.push(val.auth_name);
        });
    });
    // console.log(temp);
    // console.log([...new Set(temp)]);
    res.status(200).json({ code: 200, temp })
})
// 更新某个用户的角色
router.put('/editUserRole', async function (req, res) {
    let { id, roles } = req.body
    console.log(id, roles);
    console.log('更新某个用户的角色')
    console.log(userInfo.id)
    let permissionResult = await permission(userInfo.id, 'UPDATE_ROLE')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let update_roles = await Role.findAll({ where: { id: roles } })
    let find_user = await User.findByPk(id)
    let result = await find_user.setRoles(update_roles)
    res.status(200).json({ code: 200, result })
})

// 修改某个角色的权限
router.put('/editRoleAuth', async function (req, res, next) {
    console.log('userInfouserInfouserInfo')
    console.log(userInfo)
    let permissionResult = await permission(userInfo.id, 'UPDATE_ROLE')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let { id, auths } = req.body
    console.log(id, auths);
    let update_auths = await Auth.findAll({ where: { id: auths } })
    let find_role = await Role.findByPk(id)
    let result = await find_role.setAuths(update_auths)
    res.status(200).json({ code: 200, result })
})



module.exports = router