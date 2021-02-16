var express = require('express')
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var router = express.Router()
var Article = require('../models/Article')
var Article_type = require('../models/Article_type')
var Tag = require('../models/Tag')
var Type = require('../models/Type')
var Comment = require('../models/Comment')
var User_article = require('../models/User_article')
var User = require('../models/User')
var Star = require('../models/Star')
var authJwt = require('../lib/authJwt');
const userInfo = require('../lib/userInfo')
const permission = require('../lib/permission')

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "/add":
            permissionResult = await permission(userInfo.id, 'ADD_ARTICLE');
            break;
        case "/delete":
            permissionResult = await permission(userInfo.id, 'DELETE_ARTICLE');
            break;
        case "/update":
            permissionResult = await permission(userInfo.id, 'UPDATE_ARTICLE');
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
})

// 判断参数
// const validateArticle = Joi.object({
//     id: [
//         null,
//         Joi.number()
//     ],
//     title: Joi.string()
//         .min(3)
//         .max(20)
//         .required(),
//     type: Joi.string()
//         .min(2)
//         .max(5)
//         .required(),
//     img: [
//         null,
//         Joi.string().min(3).max(100),
//     ],
//     content: Joi.string().min(3).required(),
//     date: Joi.string().max(20).required(),
//     click: Joi.number(),
//     tagList: Joi.array().required()
// }).xor('img').xor('id')


// 获取文章列表
router.get('/pageList', async function (req, res, next) {
    console.log('获取文章列表')
    var { ordername, orderby, type_id, keyword, status, is_comment, nowPage, pageSize, createdAt, updatedAt } = req.query
    console.log(ordername, orderby, type_id, keyword, status, is_comment, nowPage, pageSize, createdAt, updatedAt)
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    let whereData = {}
    let whereData1 = {}
    let search = [
        {
            title: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            content: {
                [Op.like]: '%' + "" + '%'
            }
        }
    ]
    let orderData = []
    if (createdAt) {
        whereData['createdAt'] = { [Op.between]: [createdAt, `${createdAt} 23:59:59`] }
    }
    if (updatedAt) {
        whereData['updatedAt'] = { [Op.between]: [updatedAt, `${updatedAt} 23:59:59`] }
    }
    if (type_id) {
        console.log('666666');
        whereData1['id'] = type_id
    }
    if (keyword) {
        search = [
            {
                title: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                content: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        ]
    }
    // 如果没有权限只能看已发布的文章
    // 有权限可以查看所有文章
    let permissionResult = await permission(userInfo.id, 'SELECT_ARTICLE')
    if (status != undefined) {
        if (permissionResult.code == 403) {
            whereData['status'] = 1
        } else {
            whereData['status'] = status
        }

    } else {
        if (permissionResult.code == 403) {
            whereData['status'] = 1
        }
    }
    if (is_comment != undefined) {
        whereData['is_comment'] = is_comment
    }
    if (ordername && orderby) {
        orderData.push([
            ordername, orderby
        ])
    }
    var { count, rows } = await Article.findAndCountAll({
        where: {
            ...whereData,
            [Op.or]: search,
        },
        order: orderData,
        limit: limit,
        offset: offset,
        // include: [
        // {
        // model: Article,
        // where: whereData1,
        include: [
            {
                model: Type,
                // as:'xxx',
                where: whereData1,
            },
            {
                model: Star,
                where: {
                    to_user_id: -1
                },
                required: false,
            },
            {
                attributes: { exclude: ['password', 'token'] },
                model: User,
            },
            {
                model: Comment,
            },
            {
                model: Tag,
                through: { attributes: [] },
            },
        ],
        required: false,
        // },
        // ],
        // 这里需要去重。
        distinct: true,
    })
    return res.status(200).json({
        code: 200,
        pageSize: pageSize * 1,
        nowPage: nowPage * 1,
        lastPage: Math.ceil(count / pageSize),
        count,
        rows,
        message: '获取文章列表成功!'
    })
})


// 发表文章
router.post('/add', async function (req, res, next) {
    // try {
    //     await validateArticle.validateAsync(req.body, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    let user_id = userInfo.id;
    let permissionResult = await permission(user_id, 'ADD_ARTICLE')
    if (permissionResult.code == 403) {
        next(permissionResult)
        return
    }
    const { title, img, type_id, is_comment, status, content, click, tags } = req.body
    let add_article = await Article.create({
        title, img, is_comment, status, content, click
    })
    await add_article.setTags(tags)
    await add_article.setTypes([type_id])
    await add_article.setUsers([user_id])
    res.status(200).json({ code: 200, add_article, message: '发表文章成功!' })
})

// 删除文章
router.delete('/delete', async function (req, res, next) {
    // try {
    //     await Joi.number().required().validateAsync(req.body.id, { convert: false })
    // } catch (err) {
    //     next({ code: 400, message: err.message })
    //     return
    // }
    let delete_article = await Article.findByPk(req.body.id)
    await delete_article.setTags([])
    await delete_article.setTypes([])
    await delete_article.setUsers([])
    await delete_article.destroy()
    res.status(200).json({ code: 200, delete_article, message: '删除文章成功!' })

})

// 查找文章
router.get('/findOne', async function (req, res, next) {
    var { id } = req.query
    var currentId = userInfo.id || -2
    console.log('66666');
    console.log(currentId);
    // 查询某篇文章，点击量+1
    var result = await Article.findOne({
        where: {
            id
        },
        include: [
            {
                model: Type,
            },
            {
                model: Tag,
                through: { attributes: [] },
            },
            {
                where: {
                    to_user_id: -1
                },
                /* 
                    sequelize默认是左外连接，如果你有条件，它会给你变成内连接
                    。这么做是有道理的，因为情况只返回内外条件都满足的数据。
                    为了能够保持外连接，需要用到required属性， 只需要把写上required: false属性即可。
                */
                //不加：required:fasld：INNER JOIN `star` AS `stars` ON `article`.`id` = `stars`.`article_id` AND `stars`.`to_user_id` = - 1
                //加：required:fasld： LEFT OUTER JOIN `star` AS `stars` ON `article`.`id` = `stars`.`article_id` AND `stars`.`to_user_id` = - 1
                required: false,
                model: Star,
            },
            {
                attributes: { exclude: ['password', 'token'] },
                model: User,
            },
        ],
    })
    var detail = result.get({
        plain: true,
    })
    detail.isStar = false
    if (detail.stars.length) {
        detail.stars.forEach(item => {
            if (item.from_user_id == currentId) {
                detail.isStar = true
            }
        })
    }

    Article.update(
        {
            click: Sequelize.literal('`click` +1')
        },
        {
            where: { id },
            // silent如果为true，则不会更新updateAt时间戳。
            silent: true
        })
    res.json({ detail })

})

// 修改文章
router.put('/update', async function (req, res, next) {
    const { id, title, img, is_comment, status, content, click, tags, type_id } = req.body
    let update_article = await Article.findByPk(id)
    await update_article.update({ title, img, is_comment, status, content, click })
    await update_article.setTags(tags)
    await update_article.setTypes([type_id])
    res.status(200).json({ code: 200, update_article, message: '修改文章成功!' })
})

module.exports = router