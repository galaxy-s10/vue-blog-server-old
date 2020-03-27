var jwt = require('jsonwebtoken');
function autojwt(token, secret) {
    console.log('开始判断jwt')
    console.log(token, secret)
    return jwt.verify(token, secret, (err, decode) => {
        if (err) {
            return {code:0}
        } else {
            return {code:1,decode}
        }
    })
}

module.exports = { autojwt }