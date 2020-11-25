var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
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

// 新增权限
router.post('/addAuth', async function (req, res) {
    const { id, authList } = req.body
    console.log(id, authList)
    console.log('addAuthaddAuth')
    let find_role = await Role.findByPk(id)
    let bbb = await Auth.findAll({ where: { id: authList } })
    let ccc = find_role.setAuths(bbb)
    res.status(200).json({
        ccc
    })
})


module.exports = router