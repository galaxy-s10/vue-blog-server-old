const jwt = require('jsonwebtoken');
const { secret } = require('../config/secret')
const User = require('../models/User')

function authJwt(req) {
    if (req.headers.authorization == undefined) {
        return { code: 401, message: '未登录!' }
    }
    console.log('存在Authorization,开始判断token')
    console.log(req.headers.attributes)
    const token = req.headers.authorization.split(" ")[1]
    // const secret = 'token'
    console.log(token)
    
    return jwt.verify(token, secret, async (err, decode) => {
        if (err) {
            console.log(err)
            console.log(decode)
            console.log('非法token')
            // 判断非法/过期token
            return { code: 401, message: err.message }
        } else {
            // 防止修改密码后，原本的token还能用
            const userResult = await User.findOne({
                attributes: ['token'],
                where: {
                    id: decode.userInfo.id
                }
            })
            console.log('userResultuserResult')
            console.log(userResult)
            console.log(userResult.token)
            console.log(userResult.user)
            console.log('userResult.user')
            if (userResult.token != token) {
                console.log('登录信息过期！')
                return { code: 401, message: '登录信息过期！' }
            }
            return { code: 200, ...decode }
        }
    })
}

module.exports = authJwt 