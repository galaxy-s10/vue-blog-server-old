var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Joi = require('@hapi/joi')
// const Sequelize = require('sequelize')
// const Op = Sequelize.Op;
const { Op, fn, col, where } = require("sequelize");
var Link = require('../models/Link')
var Log = require('../models/Log')
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')
const sendEmail = require('../lib/sendEmail')
const { emailPass } = require('../config/secret')
const nodemailer = require('nodemailer');


// 判断权限
// router.use(async (req, res, next) => {
//     let permissionResult
//     switch (req.path.toLowerCase()) {
//         case "/add":
//             permissionResult = await permission(userInfo.id, 'ADD_LINK');
//             break;
//         case "/delete":
//             permissionResult = await permission(userInfo.id, 'DELETE_LINK');
//             break;
//         case "/update":
//             permissionResult = await permission(userInfo.id, 'UPDATE_LINK');
//             break;
//     }
//     if (permissionResult && permissionResult.code == 403) {
//         next(permissionResult)
//     } else {
//         next()
//     }
// })

// 发送邮件
router.get('/send', async function (req, res) {
    let { startDate, endDate, descOrAsc } = req.query
    startDate = startDate.replace(/-/g, '/')
    endDate = endDate.replace(/-/g, '/')
    let rangeData = await Log.findAll({
        attributes: [
            [fn('date_format', col('createdAt'), '%Y-%m-%d'), 'date'],
            [fn('count', col('*')), 'dailyVisiteTotal'],
            [fn('count', fn('distinct', col('api_ip'))), 'dailyVisitorTotal'],
        ],
        where: {
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
    let mailOptions1 = {
        from: '"自然博客" <2274751790@qq.com>', // sender address
        to: '251717831@qq.com', // list of receivers
        subject: '自然博客-验证码', // Subject line
        // 发送text或者html格式
        // text: 'Hello world?', // plain text body
        html: '<b>html</b>' // html body
    };
    let emailMode = new sendEmail(mailOptions1)
    emailMode.send().then(info => {
        console.log('222', info)
        res.status(200).json({ code: 200, ip: req.headers['x-real-ip'], info, message: '发送邮件成功！' })
    }).catch(error => {
        console.log('1111', error)
        res.status(400).json({ code: 400, rangeData, error, message: '发送邮件失败！' })
    })
    console.log('xxxxxxxxxxxxx')
    return
})



module.exports = router