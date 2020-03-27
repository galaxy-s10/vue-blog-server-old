var express = require('express')
var jwt = require('jsonwebtoken');
var router = express.Router()
var User = require('../models/User')
const MD5 = require('crypto-js/md5')
var { autojwt } = require('./auto_jwt')
// 登录
router.post('/login', async function (req, res) {
    console.log('请求登录')
    var { username, password } = req.body
    var password = MD5(password).toString()
    var login_user = await User.findOne({
        attributes: ['id', 'username', 'password', 'role'],
        where: {
            username, password
        }
    })
    if (login_user) {
        let created = Math.floor(Date.now() / 1000);
        let secret = "token"
        var token = jwt.sign({
            login_user,
            exp: created + 60 * 60, //一小时后过期
        }, secret)
        res.json({ token })
    } else {
        res.json({ token: null })
    }

})

// 获取登录用户信息
router.post('/getinfo', async function (req, res) {
    console.log('获取登录用户信息')
    if (req.headers.authorization) {
        var token = req.headers.authorization.split(" ")[1]
        let secret = "token"
        console.log('999999999999')
        const bool = autojwt(token, secret)
        if (bool.code) {
            console.log(bool.decode)
            var id = bool.decode.login_user.id
            var userinfo = await User.findOne({
                attributes: ['id', 'username', 'role', 'title', 'avatar'],
                where: {
                    id
                }
            })
            res.json({ code: 1, userinfo })
        } else {
            res.json({ code: 0, message: '登录失效,请重新登录！' })
        }
    } else {
        console.log(req.headers)
        res.json({ code: 0, message: '请登录！' })
    }
})

// 获取所有登录用户列表
router.get('/list', async function (req, res) {
    var list = await User.findAll()
    res.json({ list })
})


// 查询是否存在同名用户
router.get('/find', async function (req, res) {
    var { username } = req.query
    console.log('查询是否存在同名用户')
    var list = await User.findOne({
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
    var { username, password } = req.body
    var list = await User.findOne({
        attributes: ['username'],
        where: {
            username
        }
    })
    if (!list) {
        var userinfo = await User.create({
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
    var { id } = req.query
    console.log(id)
    if (!id) {
        res.json({ code: 0, message: '请输入参数！' })
        return
    }
    if (req.headers.authorization) {
        var token = req.headers.authorization.split(" ")[1]
        let secret = "token"
        console.log('999999999999')
        const bool = autojwt(token, secret)
        if (bool.code) {
            console.log(bool.decode)
            var role = bool.decode.login_user.role
            if (role == 'admin') {
                var del = await User.destroy({
                    where: {
                        id
                    }
                })
                res.json({ code: 1, del })
            } else {
                res.json({ code: 0, message: '您不是管理员！' })
            }

        } else {
            res.json({ code: 0, message: '登录失效,请重新登录！' })
        }
    } else {
        console.log(req.headers)
        res.json({ code: 0, message: '请登录！' })
    }
})

module.exports = router