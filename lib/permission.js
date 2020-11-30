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
        // console.log(item.role.auths);
        item.role.auths.forEach((val) => {
            temp.push(val.auth_name);
        });
    });
    // console.log(temp);
    // console.log([...new Set(temp)]);
    return temp
}

async function permission(user_id, auth_name) {
    const result = await Auth.findOne({
        attributes: ['auth_description'],
        where: {
            auth_name
        }
    })
    console.log('65656565')
    console.log(result)
    let myAuth = await getMyAuth(user_id)
    console.log('888');
    console.log(myAuth);
    if (myAuth.includes(auth_name)) {
        return { code: 200, message: `你拥有${result.auth_description}权限！` }
    } else {
        return { code: 403, message: `你没有${result.auth_description}权限！` }
    }
}

module.exports = permission
