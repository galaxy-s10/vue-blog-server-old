let express = require('express')
let router = express.Router()
const { Op } = require("sequelize");

const Joi = require('@hapi/joi')
let Log = require('../models/Log')
let Visitor_log = require('../models/Visitor_log')
let User = require('../models/User')
var authJwt = require('../lib/authJwt')
var request = require('request');
const userInfo = require('../lib/userInfo')

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
router.get('/getPosition', async function (req, res) {
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    // res.header('Authorization"', "APPCODE a2f93ebc370540ca845f4005a2fd7717");
    function format(date) {
        let y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate()
        return `${y}-${m}-${d}`
    }

    console.log('apiNum');
    // console.log(apiNum);
    console.log(req.headers['x-real-ip']);
    console.log(req.headers)
    request({
        url: `http://hcapi01.market.alicloudapi.com/ip?ip=${req.headers['x-real-ip']}`,
        method: 'GET',
        headers: { 'Content-Type': 'text/json', 'Authorization': "APPCODE a2f93ebc370540ca845f4005a2fd7717" }
    }, async function (error, response, body) {
        console.log(JSON.parse(body));
        console.log(JSON.parse(body).data);
        console.log(JSON.stringify(JSON.parse(body).data));
        // let {country,region,city} = JSON.parse(body).data
        var nowDay = new Date()
        var nowDate = format(nowDay) + ' 00:00:00'
        var endDate = format(nowDay) + ' 23:59:59'
        let apiNum = await Visitor_log.findAndCountAll({
            where: {
                ip: req.headers['x-real-ip'],
                createdAt: {
                    [Op.between]: [nowDate, endDate]
                },
            }
        })
        if (apiNum.count == 0) {
            await Visitor_log.create({
                user_id: userInfo.id ? userInfo.id : -1,
                ip: req.headers['x-real-ip'],
                data: JSON.stringify(JSON.parse(body).data)
            })
        }
        res.json({ code: 200, data: JSON.parse(body).data, msg: '查询ip信息成功' })
        // res.json({ code: 200, data: JSON.parse(body.data), apiNum: apiNum.count, msg: '查询ip信息成功' })
    });
    // if (apiNum.count == 0) {
    //     await Visitor_log.create({
    //         user_id: -1,
    //         api_ip: req.headers['x-real-ip'],
    //         data
    //     })
    // }
})


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
                attributes: { exclude: ['password', 'token'] },
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