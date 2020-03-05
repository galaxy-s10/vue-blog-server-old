var express = require('express')
var router = express.Router()
var User = require('../models/User')

// 登录
router.post('/login', async function (req, res) {
    console.log('请求登录')
    var { username, password } = req.body
    var token = await User.findOne({
        attributes: ['id'],
        where: {
            username, password
        }
    })
    res.json({ token })

})

// 获取登录用户信息
router.get('/getinfo', async function (req, res) {
    var { token } = req.query
    var userinfo = await User.findOne({
        attributes: ['id', 'username', 'role', 'title', 'avatar'],
        where: {
            id: token
        }
    })
    res.json({ userinfo })
})



router.get('/list', async function (req, res) {
    console.log('??????????')
<<<<<<< HEAD
    var list = await User.findAll()
=======
    var list = await user.findAll()
>>>>>>> 5904f6e5d092cd6a14584711ea57e9371a22feeb
    res.json({ list })
    // console.log('用户列表')
    // user.find((err, ress) => {
    //     if (err) {
    //         console.log('用户列表sql错了')
    //         console.log(err)
    //         res.status(200).send({
    //             data: err
    //         })
    //     } else {
    //         console.log('获取用户列表成功')
    //         res.status(200).send({
    //             code: 20000,
    //             data: ress
    //         })
    //     }
    // })
})


// 注册时查询是否存在同名用户
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
    console.log('注册用户')
    var { username, password } = req.body
    var userinfo = await User.create({
        username, password
    })
    res.json(userinfo)
})

//删除用户
router.get('/del', async function (req, res) {
    console.log('删除用户')
    var { id } = req.query
    var del = await User.destroy({
        where: {
            id
        }
    })
    res.json(del)
})

module.exports = router