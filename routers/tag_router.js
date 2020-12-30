var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Article = require('../models/Article')
var Article_tag = require('../models/Article_tag')
var Tag = require('../models/Tag')
var Comment = require('../models/Comment')
var authJwt = require('../lib/authJwt')

// 判断权限
router.use((req, res, next) => {
    console.log('判断权限');
    const validateList = ['/add', '/del']
    console.log(validateList.indexOf(req.path.toLowerCase()));
    if (validateList.indexOf(req.path.toLowerCase()) != -1) {
        const jwt_res = authJwt(req)
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
// const validateTag = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     name: Joi.string().min(3).max(20).required(),
//     color: Joi.string().max(50).required(),
// }).xor('id')

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

// 获取标签列表
router.get('/tagPage', async function (req, res) {
    var { name, nowPage, pageSize } = req.query
    console.log('nowPage, pageSize')
    console.log(req.query)
    console.log(nowPage, pageSize)
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    var { count, rows } = await Tag.findAndCountAll({
        order: [['createdAt', 'desc']],
        include: [
            {
                model: Article,
            }
        ],
        limit: limit,
        offset: offset,
        // 去重
        distinct: true,
        where: {
            [Op.or]: [
                {
                    name: name ? {
                        [Op.like]: '%' + name + '%'
                    } : { [Op.like]: '%' + '' + '%' }
                },
                {
                    color: name ? {
                        [Op.like]: '%' + name + '%'
                    } : { [Op.like]: '%' + '' + '%' }
                },
            ],
        }
    })
    res.status(200).json({ code: 200, count, rows, message: '获取标签列表成功！' })
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
    res.status(200).json({ count, rows, message: '获取标签文章分页成功！' })
})

// 修改标签
router.put('/edit', async function (req, res, next) {
    const result = await Tag.update({
        ...req.body
    }, {
        where: { id: req.body.id }
    })
    res.status(200).json({ code: 200, result, message: '修改标签成功！' })
})

// 新增标签
router.post('/add', async function (req, res, next) {
    // try {
    //     await validateTag.validateAsync(req.body, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const jwt_res = authJwt(req)
    // if (jwt_res.user.role == 'admin') {
    // const { name, color } = req.body
    const result = await Tag.create({
        ...req.body
    })
    res.status(200).json({ code: 200, result, message: '新增标签成功！' })

    // } else {
    //     next(jwt_res)
    //     return
    // }
})

// 删除标签
router.delete('/del', async function (req, res, next) {
    // try {
    //     await Joi.number().required().validateAsync(req.body.id, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    // const jwt_res = authJwt(req)
    let find_tag = await Tag.findByPk(req.body.id)
    console.log(find_tag);
    if (find_tag == null) {
        next({ code: 400, message: '不能删除不存在的tag!' })
        return
    }
    let delelte_res = await find_tag.setArticles([])
    await find_tag.destroy()
    res.status(200).json({ code: 200, delelte_res, message: '删除标签成功！' })
})


module.exports = router