var express = require('express')
var request = require('request');
const jwt = require("jsonwebtoken");
var router = express.Router()
var authJwt = require('../lib/authJwt')
const sendEmail = require('../lib/sendEmail')
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Link = require('../models/Link')
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')
const {
    secret,
    client_id,
    client_secret, } = require('../config/secret')
const Log = require('../models/Log')
const User = require('../models/User')
const Third_user = require('../models/Third_user')


// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        // case "/add":
        //     permissionResult = await permission(userInfo.id, 'ADD_LINK');
        //     break;
        case "/delete":
            permissionResult = await permission(userInfo.id, 'DELETE_LINK');
            break;
        case "/update":
            permissionResult = await permission(userInfo.id, 'UPDATE_LINK');
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
})

// 判断参数
// const validateLink = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     name: Joi.string().min(3).max(10).required(),
//     avatar: Joi.string().min(10).max(150).required(),
//     description: Joi.string().min(3).max(30).required(),
//     url: Joi.string().min(10).max(50).required(),
// }).xor('id')

// 获取友链
// router.get('/list', async function (req, res) {
//     var { rows, count } = await Link.findAndCountAll()
//     res.json({ count, rows })
// })

// 获取友链列表
router.get('/pageList', async function (req, res) {
    var { nowPage, pageSize, keyword, status, createdAt, updatedAt } = req.query
    console.log('nowPage, pageSize')
    console.log(req.query)
    console.log(nowPage, pageSize)
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
            name: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            description: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            url: {
                [Op.like]: '%' + "" + '%'
            }
        }
    ]
    let permissionResult = await permission(userInfo.id, 'SELECT_MUSIC')

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
                name: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                description: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                url: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        ]
    }
    var { count, rows } = await Link.findAndCountAll({
        // order: [['createdAt', 'desc']],
        where: {
            ...whereData,
            [Op.or]: search
        },
        limit: limit,
        offset: offset,
        // 去重
        distinct: true,
    })
    res.status(200).json({ code: 200, count, rows, message: '获取友链列表成功！' })

    // var { rows, count } = await Link.findAndCountAll()
    // res.json({ count, rows })
})

// 新增友链
router.get('/qqlogin', async function (req, res, next) {
    const { code, state } = req.query
    const params = {}
    params.grant_type = 'authorization_code'
    params.client_id = client_id
    params.client_secret = client_secret
    params.code = code
    params.redirect_uri = 'https://www.zhengbeining.com/link'
    params.fmt = 'json'
    let access_token = await new Promise((resolve, reject) => {
        request({
            url: `https://graph.qq.com/oauth2.0/token`,
            method: 'GET',
            qs: {
                ...params
            }
        }, async function (error, response, body) {
            resolve(JSON.parse(body))
        });
    })
    if (!access_token.error) {
        const params1 = {}
        params1.access_token = access_token.access_token
        params1.unionid = 1
        params1.fmt = 'json'
        let openidAndunionid = await new Promise((resolve, reject) => {
            request({
                url: `https://graph.qq.com/oauth2.0/me`,
                method: 'GET',
                qs: {
                    ...params1
                }
            }, async function (error, response, body) {
                resolve(JSON.parse(body))
            });
        })
        const params2 = {}
        params2.access_token = access_token.access_token
        params2.oauth_consumer_key = openidAndunionid.client_id
        params2.openid = openidAndunionid.openid
        let get_user_info = await new Promise((resolve, reject) => {
            request({
                url: `https://graph.qq.com/user/get_user_info`,
                method: 'GET',
                qs: {
                    ...params2
                }
            }, async function (error, response, body) {
                resolve(JSON.parse(body))
            });
        })
        /**
         * 第三方登录，获取到用户信息后
         * 1，查询third_user表，查询该用户登录的平台，存不存在一样的openid
         * 2，如果存在再同一个平台里存在相同openid，即代表他曾经登录过，
         * 3，登录过就直接更新user表里面的信息即可
         * 4，如果在用户登录的平台找不到openid，则代表是首次登录，
         * 5，需要在user表里新增该用户的信息，同时也在third_user新增对应信息
         */
        let userInfo = await Third_user.findOne({
            order: [['createdAt', 'desc']],
            where: {
                platform: 'qq',
                platform_openid: openidAndunionid.openid,
            },
        })
        if (!userInfo) {
            // 在用户登录的平台找不到openid，在user表里新增该用户的信息 
            let createUser = await User.create({
                attributes: {
                    exclude: ["password", "token"]
                },
                username: get_user_info.nickname,
                password: '123456',
                avatar: get_user_info.figureurl_qq,
            })
            console.log('pppppp')
            let ppp = createUser.setRoles([8])
            // 同时也在third_user新增对应信息
            let createThirdUser = await Third_user.create({
                userid: createUser.id,
                platform: 'qq',
                platform_openid: openidAndunionid.openid,
            })
            let created = Math.floor(Date.now() / 1000);
            const token = jwt.sign({
                userInfo: createUser,
                exp: created + (60 * 60 * 24),// 设置qq登录固定24小时过期
            }, secret)
            let createUserToken = await User.update({
                token
            }, {
                where: {
                    id: createUser.id
                }
            })
            res.cookie('qq_openid', openidAndunionid.openid, token);
            res.cookie('token', token);
            res.status(200).json({ code: 200, createUser,ppp, get_user_info, userInfo, message: '创建qq用户信息成功!' })
        } else {
            // 登录过就直接更新user表里面的信息即可
            const userInfo1 = await User.findOne({
                attributes: {
                    exclude: ["password", "token"]
                },
                where: {
                    id: userInfo.userid
                }
            })
            let created = Math.floor(Date.now() / 1000);
            const token = jwt.sign({
                userInfo: userInfo1,
                exp: created + (60 * 60 * 24),// 设置qq登录固定24小时过期
            }, secret)
            let updateUser = await User.update({
                username: get_user_info.nickname,
                avatar: get_user_info.figureurl_qq,
                token
            }, {
                where: {
                    id: userInfo.userid
                }
            })
            res.cookie('qq_openid', openidAndunionid.openid, token);
            res.cookie('token', token);
            res.status(200).json({ code: 200, get_user_info, userInfo, message: '更新qq用户信息成功!' })

        }

    } else {
        res.clearCookie('qq_openid')
        res.status(401).json({ code: 401, access_token })

    }


})

// 新增友链
router.post('/add', async function (req, res, next) {
    // try {
    //     await validateLink.validateAsync(req.body, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const { name, avatar, description, url, status } = req.body
    // if (jwt_res.user.role == 'admin') {
    // console.log(req.headers['x-real-ip'])
    var result = await Link.create(
        {
            ...req.body
        }
    )
    res.status(200).json({ code: 200, result, message: '添加友链成功！' })

    // } else {
    //     next(jwt_res)
    // }
})

// 修改友链
router.put('/update', async function (req, res, next) {
    // try {
    //     await validateLink.validateAsync(req.body, { convert: false, allowUnknown: true })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    const { id, name, avatar, description, url, status } = req.body
    // if (jwt_res.user.role == 'admin') {
    var result = await Link.update(
        {
            name, avatar, description, url, status
        },
        {
            where: { id }
        })
    res.status(200).json({ code: 200, result, message: '修改友链成功！' })
    // } else {
    //     next(jwt_res)
    //     return
    // }

})

// 删除友链
router.delete('/delete', async function (req, res, next) {
    // try {
    //     await Joi.number().required().validateAsync(req.body.id, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const jwt_res = authJwt(req)
    // if (jwt_res.user.role == 'admin') {
    var result = await Link.destroy(
        {
            where: { id: req.body.id }
        })

    res.status(200).json({ code: 200, result, message: '删除友链成功！' })
    // } else {
    //     next(jwt_res)
    //     return
    // }
})


module.exports = router