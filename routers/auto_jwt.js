var jwt = require('jsonwebtoken');
// function autojwt(token, secret) {
//     console.log('开始判断jwt')
//     console.log(token, secret)
//     return jwt.verify(token, secret, (err, decode) => {
//         if (err) {
//             return {code:0}
//         } else {
//             return {code:1,decode}
//         }
//     })
// }
function autojwt(req) {
    console.log('首先判断有没有Authorization')
    if (req.headers.authorization == undefined) {
        console.log('没有Authorization')
        return { code: 0 }
    }
    const token = req.headers.authorization.split(" ")[1]
    const secret = 'token'
    return jwt.verify(token, secret, (err, decode) => {
        if (err) {
            return { code: 0, decode }
        } else {
            return { code: 1, decode }
        }
    })
}

module.exports = { autojwt }