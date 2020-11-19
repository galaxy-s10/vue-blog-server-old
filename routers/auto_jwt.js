const jwt = require('jsonwebtoken');
const User = require('../models/User')
function autojwt(req) {
    if (req.headers.authorization == undefined) {
        return { code: 401, message: 'no token' }
    }
    console.log('存在Authorization,开始判断token')
    const token = req.headers.authorization.split(" ")[1]
    const secret = 'token'
    return jwt.verify(token, secret, async (err, decode) => {
        console.log('decode')
        console.log(decode)
        if (err) {
            console.log('非法token')
            console.log(err)
            // 判断非法/过期token
            return { code: 401, message: err.message }
        } else {
            const res = await User.findOne({
                attributes: ['token'],
                where: {
                    id: decode.user.id
                }
            })
            console.log('res')
            console.log(decode.user.id)
            console.log(res.token)
            console.log(token)
            if (res.token != token) {
                return { code: 401, message: '登录信息过期！' }
            }
            return { code: 200, ...decode }
        }
    })
}

module.exports = { autojwt }