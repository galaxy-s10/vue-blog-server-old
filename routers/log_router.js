let express = require('express')
let router = express.Router()
const Joi = require('@hapi/joi')
let Log = require('../models/Log')
let User = require('../models/User')
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


// 获取日志列表
router.get('/list', async function (req, res) {
    var { nowPage, pageSize } = req.query
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    let { count, rows } = await Log.findAndCountAll({
        order: [['createdAt', 'desc']],
        include: [
            {
                model: User,
            }
        ],
        limit: limit,
        offset: offset,
        // 去重
        distinct: true,
    })
    res.json({ count, rows })
})

// 新增日志
// router.post('/add', async function (req, res, next) {
//     let { user_id, api_path, api_method, api_query, api_body } = req.body
//     const result = await Log.create({
//         user_id, api_path, api_method, api_query, api_body
//     })
//     res.status(200).json({ code: 200, result })
// })


// router.get('/', async function (req, res) {

// })

module.exports = router