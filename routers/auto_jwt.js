const jwt = require('jsonwebtoken');
const User = require('../models/User')
const Role = require('../models/Role');
const Auth = require('../models/Auth');
const User_role = require('../models/User_role');


// 获取所有权限
async function getAllAuth() {
    var { rows, count } = await Auth.findAndCountAll()
    let temp = [];
    rows.forEach((item) => {
        if (item.p_id == 0) {
            temp.push(item.id);
        }
    });
    return temp
}

// 获取某个用户的所有权限
async function getMyAuth(id) {
    var { count, rows } = await User_role.findAndCountAll({
        include: [
            {
                model: Role,
                include: [
                    {
                        model: Auth,
                        through: { attributes: [] },
                    }
                ]
            }
        ],
        where: { user_id: id }
    })
    let temp = [];
    console.log("获取某个用户的所有权限");
    rows.forEach((item) => {
        console.log(item.role.auths);
        item.role.auths.forEach((val) => {
            temp.push(val.id);
        });
    });
    console.log(temp);
    console.log([...new Set(temp)]);
    return temp
}

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
            const tokenResult = await User.findOne({
                attributes: ['token'],
                where: {
                    id: decode.user.id
                }
            })
            console.log('tokenResult')
            console.log(tokenResult)
            if (tokenResult.token != token) {
                return { code: 401, message: '登录信息过期！' }
            }
            let allAuth = await getAllAuth()
            let myAuth = await getMyAuth(decode.user.id)
            console.log('7777');
            console.log(allAuth);
            return { code: 200, ...decode }
        }
    })
}

module.exports = { autojwt }