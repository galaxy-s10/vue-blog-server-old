const express = require('express')
const router = express.Router()
const authJwt = require('../lib/authJwt')
const Joi = require('@hapi/joi')
const User = require('../models/User')
const Role = require('../models/Role')
const Auth = require('../models/Auth')
const User_role = require('../models/User_role')
const Role_auth = require('../models/Role_auth')
const Star = require('../models/Star')
const permission = require('../lib/permission')
const userInfo = require('../lib/userInfo')

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

// 获取所有角色以及角色拥有的权限
router.get('/roleAuthList', async function (req, res) {
    const { rows, count } = await Role.findAndCountAll({
        include: [
            {
                model: Auth,
                through: { attributes: [] },
            },
        ],
        // 去重
        distinct: true,
    })
    res.status(200).json({ count, rows })
})

// 获取某个角色拥有的权限
router.get('/oneRoleAuth', async function (req, res) {
    let { id } = req.query
    const { rows, count } = await Role_auth.findAndCountAll({
        include: [
            {
                model: Auth,
            },
        ],
        where: { role_id: id },
        // 去重
        distinct: true,
    })
    console.log('获取某个角色拥有的权限')
    console.log('333333333333')
    console.log(count, rows)
    res.status(200).json({ count, rows })
})

// 获取用户角色列表
router.get('/userRoleList', async function (req, res) {
    const { rows, count } = await User.findAndCountAll({
        include: [
            {
                // attributes: { exclude: ['password', 'token'] },
                model: Role,
                // as:'p_role',
                include: [
                    {
                        model: Role,
                        as: 'p_role',
                        // through: { attributes: [] },
                        // include: [
                        //     {
                        //         model: Role,
                        //         as: 'p_role'
                        //         // through: { attributes: [] },
                        //     }
                        // ],
                    }
                ],
            },
            {
                model: Star,
            }


        ],
        // 去重
        distinct: true,
    })
    res.status(200).json({ count, rows })
})

// 获取某个用户的角色
router.get('/getUserRole', async function (req, res) {
    let { id } = req.query
    const { rows, count } = await User_role.findAndCountAll({
        where: { user_id: id },
        include: [
            {
                model: User,
            },
            {
                model: Role
            }
        ],
        // attributes: [],
        // 去重
        distinct: true,
    })
    res.status(200).json({ count, rows })
})


// 获取某个用户的角色以及权限
router.get('/getUserAuth', async function (req, res) {
    let { id } = req.query
    console.log('获取某个用户的角色以及权限')
    console.log(id)
    const { rows, count } = await User_role.findAndCountAll({
        where: { user_id: id },
        include: [
            {
                attributes: { exclude: ['password', 'token'] },
                model: User,
                include: [
                    {
                        through: { attributes: [] },
                        model: Role,
                        include: [
                            {
                                through: { attributes: [] },
                                model: Auth,
                            }
                        ]

                    }
                ]
            },
        ],
        // attributes: [],
        // 去重
        distinct: true,
    })
    res.json({ count, rows })
})


// 给某个角色新增权限
router.post('/addAuth', async function (req, res,next) {
    const { id, authList } = req.body
    let permissionResult = await permission(userInfo.id, 'ADD_AUTH')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let find_role = await Role.findByPk(id)
    let bbb = await Auth.findAll({ where: { id: authList } })
    let ccc = find_role.setAuths(bbb)
    res.status(200).json({
        ccc
    })
})

module.exports = router