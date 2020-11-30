const { func } = require('@hapi/joi')
const { Op } = require("sequelize");
let Log = require('../models/Log')
let User = require('../models/User')

//转换时间格式
function formateDate(datetime) {
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

async function addLog(user_id, req) {
    let nowDate = new Date().getTime()
    let beforeDate = nowDate - 500
    let apiNum = await Log.findAndCountAll({
        where: {
            user_id,
            createdAt: {
                [Op.between]: [formateDate(beforeDate), formateDate(nowDate)]
            },
        }
    })
    console.log(apiNum.count)
    // 如果在500毫秒内请求了5次，判断为频繁操作，禁用该账户
    if (apiNum.count > 5) {
        await User.update(
            {
                status: 2
            },
            {
                where: { id: user_id }
            }
        )
        return ({ code: 403, message: '检测到频繁操作，已被禁用，请联系管理员处理!' })
    } else {
        await Log.create({
            user_id: user_id,
            api_ip: req.ip,
            api_hostname: req.hostname,
            api_path: req.path,
            api_method: req.method,
            api_query: JSON.stringify(req.query),
            api_body: JSON.stringify(req.body)
        })
        return ({ code: 200, message: '插入一条日志！' })
    }
}


module.exports = addLog