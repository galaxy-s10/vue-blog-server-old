var express = require('express')
var router = express.Router()
var authJwt = require('../lib/authJwt')
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Link = require('../models/Link')
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')
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
    let transporter = nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
            user: '2274751790@qq.com',
            // 这里密码不是qq密码，是你设置的smtp授权码
            pass: 'yixtjfjstlgqeafi',
        }
    });

    let mailOptions = {
        from: '"自然博客" <2274751790@qq.com>', // sender address
        to: '251717831@qq.com', // list of receivers
        subject: '自然博客-验证码', // Subject line
        // 发送text或者html格式
        // text: 'Hello world?', // plain text body
        html: '<b>html</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.status(200).json({ code: 200, info, message: '发送邮件成功！' })
        // console.log('Message sent: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });


})



module.exports = router