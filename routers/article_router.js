var express = require('express')
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var router = express.Router()
var Article = require('../models/Article')
var Tag = require('../models/Tag')
var Comment = require('../models/Comment')
var { autojwt } = require('./auto_jwt');

// 判断权限
router.use((req, res, next) => {
    console.log('判断权限');
    const validateList = ['/add', '/del', '/edit']
    console.log(validateList.indexOf(req.path.toLowerCase()));
    if (validateList.indexOf(req.path.toLowerCase()) != -1) {
        const jwt_res = autojwt(req)
        console.log(jwt_res);
        jwt_res.code == 401 ? next(jwt_res) : next()
        // 不加return会继续执行if语句外面的代码
        return
    } else {
        next()
    }
    // console.log('没想到吧，我还会执行');
})

// 判断参数
const validateArticle = Joi.object({
    id: [
        null,
        Joi.number()
    ],
    title: Joi.string()
        .min(3)
        .max(20)
        .required(),
    type: Joi.string()
        .min(2)
        .max(5)
        .required(),
    img: [
        null,
        Joi.string().min(3).max(100),
    ],
    content: Joi.string().min(3).required(),
    date: Joi.string().max(20).required(),
    click: Joi.number(),
    tagList: Joi.array().required()
}).xor('img').xor('id')


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
    var offset = parseInt((nowpage - 1) * pagesize)
    var limit = parseInt(pagesize)
    if (type) {
        var pagelist = await Article.findAndCountAll({
            where: { type },
            order: [['date', 'desc']],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Comment,
                },
                {
                    model: Tag,
                    through: { attributes: [] },
                },
            ],
            // 去重
            distinct: true,
        })
    }
    if (ordername && orderby) {
        var ordername = ordername.replace(/\'/g, "")
        var orderby = orderby.replace(/\'/g, "")
        var pagelist = await Article.findAndCountAll({
            order: [[ordername, orderby]],
            limit: limit,
            offset: offset,
            include: [{
                model: Comment,
            }],
            // 去重
            distinct: true,
        })
    }
    if (type == undefined && ordername == undefined && orderby == undefined) {
        var pagelist = await Article.findAndCountAll({
            order: [['date', 'desc']],
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Comment,
                },
                {
                    model: Tag,
                    through: { attributes: [] },
                },
            ],
            distinct: true,
        })
    }
    res.json({
        pagelist
    })
})

// 发表文章
router.post('/add', async function (req, res, next) {
    try {
        await validateArticle.validateAsync(req.body, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    const { title, type, img, content, date, click, tagList } = req.body
    const jwt_res = autojwt(req)
    if (jwt_res.user.role == 'admin') {
        let aaa = await Article.create({
            title, type, img, content, date, click
        })
        let bbb = await Tag.findAll({ where: { id: tagList } })
        let ccc = aaa.setTags(bbb)
        res.status(200).json({
            ccc
        })
    } else {
        next(jwt_res)
        return
    }

})

// 删除文章
router.delete('/del', async function (req, res, next) {
    try {
        await Joi.number().required().validateAsync(req.body.id, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    const jwt_res = autojwt(req)
    if (jwt_res.user.role == 'admin') {
        let find_article = await Article.findByPk(req.body.id)
        let delelte_tag = await find_article.setTags([])
        let delelte_article = await find_article.destroy()
        res.status(200).json({ code: 1, delelte_article })
    } else {
        next(jwt_res)
        return
    }
})

//查找文章
router.get('/find', async function (req, res) {
    var { id, title } = req.query
    // 查询某篇文章，点击量+1
    if (id) {
        var list = await Article.findAndCountAll({
            include: [
                {
                    model: Tag,
                    through: { attributes: [] },
                }
            ],
            where: {
                id
            }
        })
        Article.update(
            {
                click: Sequelize.literal('`click` +1')
            },
            {
                where: { id },
                // silent如果为true，则不会更新updateAt时间戳。
                silent: true
            })
    } else {
        // 模糊查询
        var list = await Article.findAndCountAll({
            where: {
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: '%' + title + '%'
                        }
                    },
                    {
                        content: {
                            [Op.like]: '%' + title + '%'
                        }
                    }
                ]
            }

        })
    }
    res.json({ list })

})

// 修改文章
router.put('/edit', async function (req, res, next) {
    try {
        await validateArticle.validateAsync(req.body, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    const { id, title, type, tagList, img, content, date, click } = req.body
    const newtags = []
    tagList.forEach((item) => {
        newtags.push(item.id)
    })
    const jwt_res = autojwt(req)
    if (jwt_res.user.role == 'admin') {
        let update_tags = await Tag.findAll({ where: { id: newtags } })
        let find_article = await Article.findByPk(id)
        let update_article = await find_article.update({ title, type, img, content, date, click })
        let update_article_result = await find_article.setTags(update_tags)
        res.status(200).json({ code: 1, update_article_result })
    } else {
        next(jwt_res)
        return
    }

})

module.exports = router