const express = require('express')
const { secret } = require('../config/secret')
const Joi = require('@hapi/joi')
const jwt = require('jsonwebtoken');
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
const User = require('../models/User')
const Role = require('../models/Role')
const Star = require('../models/Star')
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')
const MD5 = require('crypto-js/md5');
const authJwt = require('../lib/authJwt');
const User_role = require('../models/User_role');


// 判断权限
// router.use(async (req, res, next) => {
//     // const validateList = ['/getuserinfo', '/list', '/del', '/edit']
//     const validateList = ['/list', '/del', '/edit']
//     // console.log(validateList.indexOf(req.path.toLowerCase()));
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = await authJwt(req)
//         console.log('判断权限');
//         // console.log(jwt_res);
//         jwt_res.code == 401 ? next(jwt_res) : next()
//         // 不加return会继续执行if语句外面的代码
//         return
//     } else {
//         // console.log('xxxxxxxxxxxx');
//         next()
//     }
//     // console.log('没想到吧，我还会执行');
// })

// 判断参数
// const validateUser = Joi.object({
//     id: [
//         null,
//         Joi.number().required()
//     ],
//     username: Joi.string().min(3).max(10).required(),
//     password: Joi.string().pattern(new RegExp(/^\w{6,12}$/)).required(),
//     // role: [
//     //     'user',
//     //     'admin'
//     // ],
//     avatar: [
//         null,
//         Joi.string().max(150)
//     ],
//     title: Joi.string().min(3).max(20),
// }).xor('id').xor('avatar')


// 注册用户
router.post('/add', async function (req, res, next) {
    try {
        await validateUser.validateAsync(req.body, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    const { username, password, role, avatar, title } = req.body
    const list = await User.findOne({
        attributes: ['username'],
        where: {
            username
        }
    })
    // 查询是否同名用户
    if (!list) {
        const jwt_res = authJwt(req)
        if (role == 'admin') {
            if (jwt_res.code == 401) {
                next(jwt_res)
                return
            } else if (jwt_res.code == 200 && jwt_res.user.role == 'user') {
                next(jwt_res)
                return
            } else if (jwt_res.code == 200 && jwt_res.user.role == 'admin') {
                const userinfo = await User.create({
                    attributes: { exclude: ['password'] },
                    username, passwor, avatar, title
                })
                res.json({ code: 1 })
                return
            }
        } else {
            const userInfo = await User.create({
                attributes: { exclude: ['password'] },
                username, password, avatar, title
            })
            const userRole = await User_role.create({
                user_id: userInfo.id, role_id: 6
            })
            res.json({ code: 200, userInfo, message: "注册成功！" })
            return
        }

    } else {
        next({ code: 400, message: username + '用户名已被注册！' })
    }


})


// 登录
router.post('/login', async function (req, res, next) {
    var { username, password } = req.body
    // console.log(username, password)
    if (username && password) {
        var password = MD5(password).toString()
        const userInfo = await User.findOne({
            attributes: { exclude: ['password', 'token'] },
            where: {
                username, password
            }
        })
        if (userInfo) {
            if (!userInfo.status) {
                return next({ code: 403, token: null, message: '该账号已被禁用!' })
                // res.status(403).json({ code: 403, token: null, message: '该账号已被禁用!' })
            }
            let created = Math.floor(Date.now() / 1000);
            const token = jwt.sign({
                userInfo,
                exp: created + 60 * 60 * 24, //24小时后过期
                // exp: created + 60 * 60, //一小时后过期
            }, secret)
            let { id } = userInfo
            await User.update(
                {
                    token
                },
                {
                    where: { id }
                }
            )
            res.status(200).json({ token, message: '登录成功！' })
        } else {
            console.log('密码错了')
            res.status(401).json({ code: 401, token: null, message: '账号或密码错误！' })
        }
    } else {
        next({ code: 400, message: '参数错误' })
    }
})

// 获取用户信息
router.get('/getUserInfo', async function (req, res) {
    console.log('getUserInfogetUserInfogetUserInfo')
    const jwtResult = await authJwt(req)
    res.status(200).json({ ...jwtResult })
})

// 获取用户列表
router.get('/pageList', async function (req, res, next) {
    var { nowPage, pageSize, keyword, status, createdAt, updatedAt } = req.query
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    let whereData = {}
    if (createdAt) {
        whereData['createdAt'] = { [Op.between]: [createdAt, `${createdAt} 23:59:59`] }
    }
    if (updatedAt) {
        whereData['updatedAt'] = { [Op.between]: [updatedAt, `${updatedAt} 23:59:59`] }
    }
    let search = [
        {
            username: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            title: {
                [Op.like]: '%' + "" + '%'
            }
        },
    ]
    let permissionResult = await permission(userInfo.id, 'USER_LIST')

    if (status != undefined) {
        if (!permissionResult) {
            whereData['status'] = 1
        } else {
            whereData['status'] = status
        }

    } else {
        if (!permissionResult) {
            whereData['status'] = 1
        }
    }
    if (keyword != undefined) {
        search = [
            {
                username: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                title: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
        ]
    }
    const { rows, count } = await User.findAndCountAll({
        attributes: { exclude: ['password', 'token'] },
        limit: limit,
        offset: offset,
        where: {
            ...whereData,
            [Op.or]: search,
        },
        include: [
            {
                model: Role,
                include: [
                    {
                        model: Role,
                        as: 'p_role',
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
    res.status(200).json({ code: 200, count, rows, message: "获取用户列表成功！" })
})

// 查询用户信息
router.get('/findOne', async function (req, res, next) {
    // try {
    //     await Joi.number().required().validateAsync(req.query.id)
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    const detail = await User.findOne({
        attributes: { exclude: ['token', 'password'] },
        where: {
            id: req.query.id
        }
    })
    res.status(200).json({ code: 200, detail, message: "查询用户信息成功！" })
})

// 修改用户
router.put('/update', async function (req, res, next) {
    let { id, username, password, title, avatar, status, roles } = req.body
    console.log(username, password, title, avatar, status, roles)
    // let update_roles = await Role.findAll({ where: { id: req.body.roles } })
    let find_user = await User.findByPk(id)
    let update_user = await find_user.update({ username, password, title, avatar, status })
    let result = await find_user.setRoles(roles)
    // const result = await User.update(
    //     {
    //         ...row
    //     },
    //     {
    //         where: { id: req.body.id }
    //     }
    // )
    res.status(200).json({ code: 200, result, message: "修改用户成功！" })
})

// 修改用户状态
router.put('/updateStatus', async function (req, res, next) {
    let { id, status } = req.body
    const result = await User.update(
        {
            status
        },
        {
            where: { id }
        }
    )
    res.status(200).json({ code: 200, result, message: "修改用户状态成功！" })
})

// 删除用户
router.delete('/delete', async function (req, res, next) {
    const result = await User.destroy({
        where: {
            id: req.body.id
        }
    })
    res.status(200).json({ code: 200, result, message: "删除用户成功！" })
})

module.exports = router