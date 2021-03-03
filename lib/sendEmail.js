const { emailPass } = require('../config/secret')
const nodemailer = require('nodemailer');
class sendEmail {
    constructor(payload) {
        this.from = payload.from
        this.to = payload.to
        this.subject = payload.subject
        this.html = payload.html
    }
    send() {

        return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport({
                // host: 'smtp.ethereal.email',
                service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
                port: 465, // SMTP 端口
                secureConnection: true, // 使用了 SSL
                auth: {
                    user: '2274751790@qq.com',
                    // 这里密码不是qq密码，是你设置的smtp授权码
                    // pass: 'yixtjfjstlgqeafi',
                    pass: emailPass,
                }
            });

            let mailOptions = {
                from: this.from, // sender address
                to: this.to, // list of receivers
                subject: this.subject, // Subject line
                // 发送text或者html格式
                // text: 'Hello world?', // plain text body
                html: this.html // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                console.log(error,info)
                if (error) {
                    // return console.log(error);
                    reject(error)
                    // res.status(400).json({ code: 400, error, message: '发送邮件失败！' })
                } else {
                    resolve(info)
                }
                // res.status(200).json({ code: 200, info, message: '发送邮件成功！' })
            });
        })

    }

}

module.exports = sendEmail