var jwt = require('jsonwebtoken');
function autojwt(req) {
    if (req.headers.authorization == undefined) {
        return { code: 401, message: 'no token' }
    }
    console.log('存在Authorization,开始判断token')
    const token = req.headers.authorization.split(" ")[1]
    const secret = 'token'
    return jwt.verify(token, secret, (err, decode) => {
        if (err) {
            // 判断非法/过期token
            return { code: 401, message: err.message }
        } else {
            return { code: 200, ...decode }
        }
    })
}

module.exports = { autojwt }