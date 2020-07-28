var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
var Article = require('../models/Article')
var Article_tag = require('../models/Article_tag')
var Tag = require('../models/Tag')
var Comment = require('../models/Comment')
var { autojwt } = require('./auto_jwt')

// 判断权限
router.use((req, res, next) => {
    console.log('判断权限');
    const validateList = ['/add', '/del']
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
const validateTag = Joi.object({
    id: [
        null,
        Joi.number()
    ],
    name: Joi.string().min(3).max(20).required(),
    color: Joi.string().max(50).required(),
}).xor('id')

// 获取标签
router.get('/list', async function (req, res) {
    var size = req.query.size
    if (size) {
        var offset = 0
        var limit = parseInt(size)
        var { rows, count } = await Tag.findAndCountAll({
            include: [{
                model: Article,
            }
            ],
            limit: limit,
            offset: offset,
            // 去重
            distinct: true,
        })
    } else {
        var { rows, count } = await Tag.findAndCountAll({
            include: [{
                model: Article,
                // through: { attributes: [] },
            }],
            // // 去重
            // distinct: true,

        })
    }

    res.json({ count, rows })
})

// 标签文章分页
router.get('/page', async function (req, res) {
    var { id, page, size } = req.query
    var offset = parseInt((page - 1) * size)
    var limit = parseInt(size)
    var { count, rows } = await Article_tag.findAndCountAll({
        include: [
            {
                model: Article,
                include: [
                    {
                        model: Comment,
                    },
                    {
                        model: Tag,
                    }
                ],
            }
        ],
        limit: limit,
        offset: offset,
        // 去重
        distinct: true,
        where: { tag_id: id },
    })
    res.status(200).json({ count, rows })
})

// 新增标签
router.post('/add', async function (req, res,next) {
    try {
        await validateTag.validateAsync(req.body, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    const jwt_res = autojwt(req)
    if (jwt_res.user.role == 'admin') {
        const { name, color } = req.body
        const ress = await Tag.create({
            name, color
        })
        res.status(200).json(ress)
    } else {
        next(jwt_res)
        return
    }
})

// 删除标签
router.delete('/del', async function (req, res,next) {
    try {
        await Joi.number().required().validateAsync(req.body.id, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    const jwt_res = autojwt(req)
    if (jwt_res.user.role == 'admin') {
        let find_tag = await Tag.findByPk(req.body.id)
        console.log(find_tag);
        if(find_tag == null){
            next({ code: 400, message: '不能删除不存在的tag!' })
            return
        }
        let delelte_res = await find_tag.setArticles([])
        await find_tag.destroy()
        res.status(200).json(delelte_res)
    } else {
        next(jwt_res)
        return
    }
})


module.exports = router