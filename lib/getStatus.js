const User = require('../models/User')

async function getStatus(id) {
    const userResult = await User.findOne({
        attributes: ['status'],
        where: {
            id
        }
    })
    if (userResult.status == 2) {
        return { code: 403, message: '该账号已被禁用!' }
    }
    // if (userResult.status == 3) {
    //     return { code: 403, message: '检测到频繁操作，已被禁用，请联系管理员处理!' }
    // }
    return { code: 200, message: '账号状态正常' }
}

module.exports = getStatus
