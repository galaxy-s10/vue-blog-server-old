const express = require('express')
const router = express.Router()
const permission = require('../lib/permission')
const Joi = require('@hapi/joi')
const User = require('../models/User')
const Role = require('../models/Role')
const Auth = require('../models/Auth')
const User_role = require('../models/User_role')
const Role_auth = require('../models/Role_auth')
const userInfo = require('../lib/userInfo')

router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "/add":
            permissionResult = await permission(userInfo.id, 'ADD_ROLE');
            break;
        case "/delete":
            permissionResult = await permission(userInfo.id, 'DELETE_ROLE');
            break;
        case "/update":
            permissionResult = await permission(userInfo.id, 'UPDATE_ROLE');
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
})

// 判断参数
const validateLink = Joi.object({
    id: [
        null,
        Joi.number()
    ],
    name: Joi.string().min(3).max(10).required(),
    avatar: Joi.string().min(10).max(150).required(),
    description: Joi.string().min(3).max(30).required(),
    url: Joi.string().min(10).max(50).required(),
}).xor('id')

// 获取所有角色
router.get('/list', async function (req, res, next) {
    const { rows, count } = await Role.findAndCountAll()
    res.json({ count, rows })
})

// // 获取某个角色的权限
// router.get('/getAuth', async function (req, res) {
//     let { id } = req.query
//     let result = await Role.findAndCountAll({
//         include: [
//             {
//                 mode: Auth
//             },

//         ],
//         where: { id }
//     })
//     res.status(200).json({ code: 200, result })
// })

// 查询某个角色的父级
router.get('/findParentRole', async function (req, res) {
    // 查询当前角色的父级p_id
    let { p_id } = await Role.findOne({
        attributes: ["p_id"],
        where: { id: req.query.id }
    })
    // 查询父级的p_id
    let result = await Role.findOne({
        attributes: ["p_id"],
        where: { id: p_id }
    })
    let list
    if (result) {
        // 查询所有角色的p_id是父级p_id的数据
        list = await Role.findAndCountAll({
            where: { p_id: result.p_id }
        })
    } else {
        // 查询所有角色的p_id是父级p_id的数据
        list = await Role.findAndCountAll({
            where: { p_id: 0 }
        })
    }
    res.status(200).json({
        code: 200, list, message: "查询该角色父级成功"
    })
})

// 查询某个角色的平行父级
router.get('/findBrotherRole', async function (req, res) {
    // 查询当前角色的父级p_id
    let { p_id } = await Role.findOne({
        attributes: ["p_id"],
        where: { id: req.query.id }
    })
    let list = await Role.findAndCountAll({
        where: { p_id }
    })
    res.status(200).json({
        code: 200, list, message: "查询某个角色的平行父级成功"
    })
})

// 获取某个用户的角色
router.get('/getUserRole', async function (req, res) {
    let { id } = req.query
    const { rows, count } = await User.findAndCountAll({
        where: { id },
        attributes: {
            exclude: ["password", "token"]
        },
        include: [
            {
                model: Role,
                through: { attributes: [] },
            }
        ],
    })
    res.status(200).json({ count, rows, message: '获取用户角色成功!' })
})

// 更新某个用户的角色
router.put('/editUserRole', async function (req, res, next) {
    let { id, roles } = req.body
    console.log(id, roles);
    console.log('更新某个用户的角色')
    console.log(userInfo.id)
    let permissionResult = await permission(userInfo.id, 'UPDATE_ROLE')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let update_roles = await Role.findAll({ where: { id: roles } })
    let find_user = await User.findByPk(id)
    let result = await find_user.setRoles(update_roles)
    res.status(200).json({ code: 200, result, message: "更新用户角色成功！" })
})

// 修改某个角色的权限
router.put('/editRoleAuth', async function (req, res, next) {
    console.log('userInfouserInfouserInfo')
    console.log(userInfo)
    let permissionResult = await permission(userInfo.id, 'UPDATE_ROLE')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let { id, auths, p_id, role_name, role_description } = req.body
    console.log(id, auths);
    let update_auths = await Auth.findAll({ where: { id: auths } })
    let find_role = await Role.findByPk(id)
    let update_role = await find_role.update({ p_id, role_name, role_description })
    let result = await find_role.setAuths(update_auths)
    res.status(200).json({ code: 200, result, message: "修改角色权限成功!" })
})

// 添加角色
router.post('/addRole', async function (req, res, next) {
    console.log('userInfouserInfouserInfo')
    console.log(userInfo)
    let permissionResult = await permission(userInfo.id, 'ADD_ROLE')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let { p_id, role_name, role_description, auths } = req.body
    let result = await Role.create({
        p_id, role_name, role_description
    })
    let result1 = result.setAuths(auths)
    res.status(200).json({ code: 200, result1, message: "添加角色成功!" })
})

// 删除角色
router.delete('/deleteRole', async function (req, res, next) {
    console.log('userInfouserInfouserInfo')
    console.log(userInfo)
    let permissionResult = await permission(userInfo.id, 'DELETE_ROLE')
    console.log('permissionResultpermissionResult')
    console.log(permissionResult)
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    let find_role = await Role.findByPk(req.body.id)
    console.log(find_role);
    // if (find_role == null) {
    //     next({ code: 400, message: '不能删除不存在的role!' })
    //     return
    // }
    let delelte_res = await find_role.setUsers([])
    let delelte_res1 = await find_role.setAuths([])
    await find_role.destroy()
    res.status(200).json({ code: 200, delelte_res, message: "删除角色成功!" })
})



module.exports = router