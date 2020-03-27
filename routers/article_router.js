var express = require('express')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var router = express.Router()
var Article = require('../models/Article')
var Comment = require('../models/Comment')
var { autojwt } = require('./auto_jwt')

//文章列表
router.get('/', async function (req, res, next) {
    var { ordername, orderby } = req.query
    if (ordername && orderby) {
        var ordername = ordername.replace(/\'/g, "")
        var orderby = orderby.replace(/\'/g, "")
        var list = await Article.findAndCountAll(
            {
                order: [
                    [
                        ordername,
                        orderby
                    ]
                ]
            }
        )
    } else {
        var list = await Article.findAndCountAll()
    }

    res.json({
        list
    })
})

//文章类型列表
router.get('/typelist', async function (req, res, next) {
    var typelist = await Article.findAll({
        attributes: ['type'],
        group: 'type'
    })
    res.json({
        typelist
    })
})

//文章分页
router.get('/page', async function (req, res, next) {
    var { ordername, orderby, type, nowpage, pagesize } = req.query
    console.log(ordername, orderby, type, nowpage, pagesize)
    var offset = parseInt((nowpage - 1) * pagesize)
    var limit = parseInt(pagesize)
    console.log(ordername)
    console.log('开始')
    if (type) {
        console.log('11111111111')
        var pagelist = await Article.findAndCountAll({
            where: { type },
            limit: limit,
            offset: offset,
            include: [{
                model: Comment,
            }],
            distinct: true,
        })
    }
    if (ordername && orderby) {
        console.log('222222222222222222')
        var ordername = ordername.replace(/\'/g, "")
        var orderby = orderby.replace(/\'/g, "")
        var pagelist = await Article.findAndCountAll({
            order: [[ordername, orderby]],
            limit: limit,
            offset: offset,
            include: [{
                model: Comment,
            }],
            distinct: true,
        })
    }
    if (type && ordername && orderby) {
        console.log('3333333333333')
        var pagelist = await Article.findAndCountAll({
            where: { type: type },
            order: [[ordername, orderby]],
            limit: limit, offset: offset,
            include: [{
                model: Comment,
            }],
            distinct: true,
        })
    }
    if (type == undefined && ordername == undefined && orderby == undefined) {
        console.log('4444444444444')
        var pagelist = await Article.findAndCountAll({
            limit: limit,
            offset: offset,
            include: [{
                model: Comment,
            }],
            distinct: true,
        })
    }
    res.json({
        // order,type,pagesize,nowpage,
        pagelist
    })
})

//发表文章
router.post('/add', async function (req, res) {
    var { title, type, img, content, date, click } = req.body
    console.log(title, type, img, content, date, click)
    // var content = content.replace(/'/g, "\\'");
    var add = await Article.create({
        title, type, img, content, date, click
    })
    console.log(add)
    res.json({ add })
})

//删除文章
router.get('/del', async function (req, res) {
    var { id } = req.query
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
                var del = await Article.destroy({
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

//查找文章
router.get('/find', async function (req, res) {
    var { id, title } = req.query
    console.log(id, title)
    if (id) {
        console.log('sssssss')
        var list = await Article.findAndCountAll({
            where: {
                id
            }
        })
        Article.update(
            {
                click: Sequelize.literal('`click` +1')
            },
            {
                where: { id }
            })
    } else {
        console.log('1111111111')
        var list = await Article.findAndCountAll({
            where: {
                title: { [Op.like]: "%" + title + "%" }
            }
        })
        Article.update(
            {
                click: Sequelize.literal('`click` +1')
            },
            {
                where: { title }
            })
    }
    res.json({ list })
})

//修改文章
router.post('/edit', async function (req, res) {
    console.log('开始修改文章')
    var { id, title, type, img, content, date, click } = req.body
    console.log(id, title, type, img, content, date, click)
    if (req.headers.authorization) {
        var token = req.headers.authorization.split(" ")[1]
        let secret = "token"
        console.log('999999999999')
        const bool = autojwt(token, secret)
        if (bool.code) {
            console.log(bool.decode)
            var role = bool.decode.login_user.role
            if (role == 'admin') {
                var edit = await Article.update(
                    {
                        title, type, img, content, date, click
                    },
                    {
                        where: { id }
                    })
                res.json({ code: 1, edit })
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
    // var content = content.replace(/'/g, "\\'");
})

module.exports = router