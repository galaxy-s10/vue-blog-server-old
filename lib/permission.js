const Auth = require('../models/Auth');
const Role = require('../models/Role');
const User_role = require('../models/User_role');

// 获取所有权限
async function getAllAuth() {
    var { rows, count } = await Auth.findAndCountAll()
    let temp = [];
    rows.forEach((item) => {
        temp.push(item.auth_name);
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
        item.role.auths.forEach((val) => {
            temp.push(val.auth_name);
        });
    });
    return temp
}

async function permission(user_id, auth_name) {
    if (!user_id) {
        return false
    }
    const result = await Auth.findOne({
        attributes: ['auth_description'],
        where: {
            auth_name
        }
    })
    let myAuth = await getMyAuth(user_id)
    if (myAuth.length > 0) {
        if (myAuth.includes(auth_name)) {
            return { code: 200, message: `你拥有${result.auth_description}权限!` }
        } else {
            return { code: 403, message: `你没有${result.auth_description}权限!` }
        }
    } else {
        return { code: 403, message: `你没有任何权限!` }
    }

}

module.exports = permission

