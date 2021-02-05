let express = require('express')
let router = express.Router()
const { Op, fn, col, where } = require("sequelize");
const sequelize = require('../config/db')
const Joi = require('@hapi/joi')
let Log = require('../models/Log')
let Visitor_log = require('../models/Visitor_log')
let Day_data = require('../models/Day_data')
let User = require('../models/User')
var authJwt = require('../lib/authJwt')
var request = require('request');
let { getRangeTime } = require('../lib/utils.js')
const userInfo = require('../lib/userInfo')


console.log(getRangeTime);

// 判断参数
// const validateTag = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     name: Joi.string().min(3).max(20).required(),
//     color: Joi.string().max(50).required(),
// }).xor('id')

//转换时间格式
function formateDate(datetime) {
    // console.log(new Date('2022-02-04 10:00:00'));
    function addDateZero(num) {
        return num < 10 ? "0" + num : num;
    }
    let d = new Date(datetime);
    let formatdatetime =
        d.getFullYear() +
        "-" +
        addDateZero(d.getMonth() + 1) +
        "-" +
        addDateZero(d.getDate()) +
        " " +
        addDateZero(d.getHours()) +
        ":" +
        addDateZero(d.getMinutes()) +
        ":" +
        addDateZero(d.getSeconds());
    return formatdatetime;
}
console.log(formateDate('2022-02-03 10:00:00'))
function format(date) {
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    return `${y}-${m}-${d}`
}

// 获取日志列表
router.get('/getPosition', async function (req, res) {
    // res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    // res.header('Authorization"', "APPCODE a2f93ebc370540ca845f4005a2fd7717");
    console.log('apiNum');
    // console.log(apiNum);
    console.log(req.headers['x-real-ip']);
    console.log(req.headers)
    let { count } = await Visitor_log.findAndCountAll({
        where: {
            ip: req.headers['x-real-ip'],
            state: 0
        }
    })
    if (count) {
        res.json({ code: 403, message: '检测到频繁操作，此ip已被禁用，请联系管理员处理!' })
        return
    }
    request({
        url: `http://hcapi01.market.alicloudapi.com/ip?ip=${req.headers['x-real-ip']}`,
        method: 'GET',
        headers: { 'Content-Type': 'text/json', 'Authorization': "APPCODE a2f93ebc370540ca845f4005a2fd7717" }
    }, async function (error, response, body) {
        console.log(JSON.parse(body));
        console.log(JSON.parse(body).data);
        console.log(JSON.stringify(JSON.parse(body).data));
        // let {country,region,city} = JSON.parse(body).data
        // var nowDay = new Date()
        // var nowDate = format(nowDay) + ' 00:00:00'
        // var endDate = format(nowDay) + ' 23:59:59'
        // let apiNum = await Visitor_log.findAndCountAll({
        //     where: {
        //         ip: req.headers['x-real-ip'],
        //         createdAt: {
        //             [Op.between]: [nowDate, endDate]
        //         },
        //     }
        // })
        let nowDate = new Date().getTime()
        let beforeDate = nowDate - 1000
        let apiNum = await Visitor_log.findAndCountAll({
            where: {
                ip: req.headers['x-real-ip'],
                createdAt: {
                    [Op.between]: [formateDate(beforeDate), formateDate(nowDate)]
                },
            }
        })
        // 如果在1000毫秒内请求了5次，判断为频繁操作，禁用该ip
        if (apiNum.count > 5) {
            await Visitor_log.update(
                {
                    state: 0
                },
                {
                    where: { ip: req.headers['x-real-ip'], }
                }
            )
            res.json({ code: 403, message: '检测到频繁操作，此ip已被禁用，请联系管理员处理!' })
            return
        }
        // if (apiNum.count == 0) {
        await Visitor_log.create({
            user_id: userInfo.id ? userInfo.id : -1,
            state: 1,
            ip: req.headers['x-real-ip'],
            data: JSON.stringify(JSON.parse(body).data)
        })
        // }
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


router.post('/insertDay', async function (req, res) {
    let sss = getRangeTime('2021-02-01', '2022-02-01')

    // for (let i = 0; i < sss.length; i++) {
    //     await Day_data.create({
    //         today:sss[i]
    //     })
    // }
    // sss.forEach(async today => {
    //     // console.log(today);

    // })
    // res.json(sss)
})

// 获取指定时间范围流量信息
router.get('/test1', async function (req, res) {
    // let test = await 
    sequelize.query(`
    SELECT
	today,
	IFNULL(allVisiteTotal, 0) allVisiteTotal,
	IFNULL(allVisitorTotal, 0) allVisitorTotal #b.dailyVisitorTotal
	#b.total
FROM
	day_data a
LEFT JOIN (
	SELECT
		date_format(
			visitor_log.createdAt,
			'%Y-%m-%d'
		) AS date,
		count(DISTINCT(ip)) AS allVisitorTotal,
		count(*) AS allVisiteTotal
	FROM
		visitor_log
	WHERE
		state = 1
	AND visitor_log.state = 1
	GROUP BY
		date_format(createdAt, '%Y-%m-%d')
) b ON a.today = b.date
WHERE
	a.today BETWEEN date_format(
		'2021-02-01 00:00:00',
		'%Y-%m-%d'
	)
AND date_format(
	'2021-02-07 00:00:00',
	'%Y-%m-%d'
)
ORDER BY
	today ASC`, { plain: false, raw: false }).spread(function (results, metadata) {
        // Results 会是一个空数组和一个包含受影响行数的metadata 元数据对象
        res.json({ code: 200, data: { results }, message: "查询流量信息成功!" })
    })
    // res.json({ code: 200, data: { test }, message: "查询流量信息成功!" })

})

// 获取指定时间范围流量信息
router.get('/test', async function (req, res) {
    let { startDate, endDate, descOrAsc } = req.query
    let sss = await Visitor_log.findAll({
        attributes: [
            [fn('date_format', col('createdAt'), '%Y-%m-%d'), 'date'],
            [fn('count', col('*')), 'dailyVisiteTotal'],
            [fn('count', fn('distinct', col('ip'))), 'dailyVisitorTotal'],
        ],
        include: [
            // { model: Day }
        ],
        group: [fn('date_format', col('createdAt'), '%Y-%m-%d')]
    })
    res.json({ code: 200, data: { sss }, message: "查询流量信息成功!" })
})

// 获取指定时间范围流量信息
router.get('/selectDetail', async function (req, res) {
    let { startDate, endDate, descOrAsc } = req.query
    startDate = startDate.replace(/-/g, '/')
    endDate = endDate.replace(/-/g, '/')
    let allData = await Visitor_log.findAll({
        attributes: [
            // [fn('date_format', col('createdAt'), '%Y-%m-%d'), 'date'],
            [fn('count', col('*')), 'allVisiteTotal'],
            [fn('count', fn('distinct', col('ip'))), 'allVisitorTotal'],
        ],
        where: {
            state: 1,
        },
    })
    let rangeData = await Visitor_log.findAll({
        attributes: [
            [fn('date_format', col('createdAt'), '%Y-%m-%d'), 'date'],
            [fn('count', col('*')), 'dailyVisiteTotal'],
            [fn('count', fn('distinct', col('ip'))), 'dailyVisitorTotal'],
        ],
        where: {
            state: 1,
            createdAt: {
                // [Op.between]: ['2021-02-03 10:00:00', '2021-02-04 12:00:00']
                [Op.between]: [startDate, endDate]
            },
        },
        // distinct: true,
        // col: 'ip',
        // order: [[col('createdAt'), 'desc']],
        order: [[col('date'), descOrAsc]],
        group: [fn('date_format', col('createdAt'), '%Y-%m-%d')]
        // group: fn('date_format', col('createdAt'), '%Y-%m-%d')
    })
    res.json({ code: 200, data: { allData, rangeData }, message: "查询流量信息成功!" })
})


// 获取历史访客数据（总访客数，总访客量，当天访客数，当天访客量）
router.get('/detail', async function (req, res) {
    // var { nowPage, pageSize } = req.query
    // var offset = parseInt((nowPage - 1) * pageSize)
    // var limit = parseInt(pageSize)
    var nowDay = new Date()
    var nowDate = format(nowDay) + ' 00:00:00'
    var endDate = format(nowDay) + ' 23:59:59'

    let aaa = await Visitor_log.findAll({
        group: 'ip',
        attributes: ['ip'],
        where: {
            state: 1
        }
    })
    let bbb = await Visitor_log.findAll({
        attributes: ['ip'],
        where: {
            state: 1
        }
    })
    let ccc = await Visitor_log.findAll({
        group: 'ip',
        attributes: ['ip'],
        where: {
            createdAt: {
                [Op.between]: [nowDate, endDate]
            },
        }
    })
    let ddd = await Visitor_log.findAll({
        attributes: ['ip'],
        where: {
            createdAt: {
                [Op.between]: [nowDate, endDate]
            },
        }
    })
    res.json({
        code: 200,
        data: { allVisitorPeople: aaa.length, allVisitorNumber: bbb.length, nowDayAllVisitorPeople: ccc.length, nowDayallVisitorNumber: ddd.length },
        message: '获取访客数据成功!'
    })
    // res.json({ count, rows })
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