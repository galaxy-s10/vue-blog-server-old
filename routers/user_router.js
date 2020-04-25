const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router()
const User = require('../models/User')
const MD5 = require('crypto-js/md5')
const { autojwt } = require('./auto_jwt')
// 登录
router.post('/login', async function (req, res) {
    console.log('请求登录')
    var { username, password } = req.body
    var password = MD5(password).toString()
    const login_user = await User.findOne({
        attributes: ['id', 'username', 'role', 'avatar', 'title'],
        where: {
            username, password
        }
    })
    if (login_user) {
        let created = Math.floor(Date.now() / 1000);
        let secret = "token"
        const token = jwt.sign({
            login_user,
            exp: created + 60 * 60, //一小时后过期
        }, secret)
        res.status(200).json({ token })
    } else {
        res.status(400).json({ token: null })
    }

})

// 获取登录用户信息
router.get('/getinfo', async function (req, res) {
    console.log('获取登录用户信息')
    console.log(req.headers.authorization)
    const bool = autojwt(req)
    if (bool.code) {
        console.log(bool.decode)
        res.status(200).json({ code: 1, userinfo: bool.decode.login_user })
    } else {
        res.status(400).json({ code: 0, message: '未授权或授权失效！' })
    }

})

// 获取所有登录用户列表
router.get('/list', async function (req, res) {
    const list = await User.findAll()
    const bool = autojwt(req)
    if (bool.code) {
        const role = bool.decode.login_user.role
        if (role == 'admin') {
            res.status(200).json({ code: 1, list })
        } else {
            res.status(400).json({ code: 1, message: '权限不足！' })
        }
    } else {
        res.status(400).json({ code: 0, message: '未授权或授权失效！' })
    }
})


// 查询是否存在同名用户
router.get('/find', async function (req, res) {
    const { username } = req.query
    console.log('查询是否存在同名用户')
    const list = await User.findOne({
        attributes: ['username'],
        where: {
            username
        }
    })
    res.json(list)
})

//注册用户
router.post('/add', async function (req, res) {
    console.log('开始注册用户')
    const { username, password } = req.body
    const list = await User.findOne({
        attributes: ['username'],
        where: {
            username
        }
    })
    if (!list) {
        const userinfo = await User.create({
            attributes: { exclude: ['password'] },
            username, password
        })
        res.json({ code: 1 })
    } else {
        res.json({ code: 0, message: '该用户名已被注册！' })
    }


})

//删除用户
router.get('/del', async function (req, res) {
    console.log('开始删除用户')
    const { id } = req.query
    console.log(id)
    if (!id) {
        res.json({ code: 0, message: '请输入参数！' })
        return
    }
    const bool = autojwt(req)
    if (bool.code) {
        const role = bool.decode.login_user.role
        if (role == 'admin') {
            const del = await User.destroy({
                where: {
                    id
                }
            })
            res.status(200).json({ code: 1, del })
        } else {
            res.status(400).json({ code: 1, message: '权限不足！' })
        }
    } else {
        res.status(400).json({ code: 0, message: '未授权或授权失效！' })
    }


})

module.exports = router