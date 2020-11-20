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
// router.use('/', (req, res, next) => {
//     console.log('判断权限');
//     const validateList = ['/add', '/del', '/edit']
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = autojwt(req)
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

// 获取角色拥有的权限
router.get('/roleAuthList', async function (req, res) {
    var { rows, count } = await Role.findAndCountAll({
        include: [
            {
                model: Auth,
                through: { attributes: [] },
            },
        ],
        // 去重
        distinct: true,
    })
    res.json({ count, rows })
})

// 获取用户角色列表
router.get('/userRoleList', async function (req, res) {
    var { rows, count } = await User.findAndCountAll({
        include: [
            {
                // attributes: { exclude: ['password', 'token'] },
                model: Role,
                // include: [
                //     {
                //         model: Role,
                //         through: { attributes: [] },
                //     }
                // ]
            },

        ],
        // 去重
        distinct: true,
    })
    res.json({ count, rows })
})
// 获取用户角色列表
// router.get('/userRoleList', async function (req, res) {
//     var { rows, count } = await User_role.findAndCountAll({
//         include: [
//             {
//                 attributes: { exclude: ['password', 'token'] },
//                 model: User,
//                 include: [
//                     {
//                         model: Role,
//                         through: { attributes: [] },
//                     }
//                 ]
//             },

//         ],
//         // 去重
//         distinct: true,
//     })
//     res.json({ count, rows })
// })

// 获取某个用户的角色
router.get('/getUserRole', async function (req, res) {
    let { id } = req.query
    var { rows, count } = await User_role.findAndCountAll({
        where: { user_id:id },
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
    res.json({ count, rows })
})


// 获取某个用户的角色以及权限
router.get('/getUserAuth', async function (req, res) {
    let { id } = req.query
    console.log(id)
    var { rows, count } = await User_role.findAndCountAll({
        where: { user_id:id },
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


module.exports = router