var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Article = require('../models/Article')
var Article_tag = require('../models/Article_tag')
var Tag = require('../models/Tag')
var Star = require('../models/Star')
var User = require('../models/User')
var Comment = require('../models/Comment')
var authJwt = require('../lib/authJwt')
const permission = require('../lib/permission')

// 判断权限
router.use(async (req, res, next) => {
    let permissionResult
    switch (req.path.toLowerCase()) {
        case "add":
            permissionResult = await permission(userInfo.id, 'ADD_TAG');
            break;
        case "delete":
            permissionResult = await permission(userInfo.id, 'DELETE_TAG');
            break;
        case "update":
            permissionResult = await permission(userInfo.id, 'UPDATE_TAG');
            break;
    }
    if (permissionResult && permissionResult.code == 403) {
        next(permissionResult)
    } else {
        next()
    }
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
router.get('/pageList', async function (req, res) {
    var { nowPage, pageSize, keyword, createdAt, updatedAt } = req.query
    console.log('nowPage, pageSize')
    console.log(req.query)
    console.log(nowPage, pageSize)
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
    let whereData = {}
    if (createdAt) {
        whereData['createdAt'] = { [Op.between]: [createdAt, `${createdAt} 23:59:59`] }
    }
    if (updatedAt) {
        whereData['updatedAt'] = { [Op.between]: [updatedAt, `${updatedAt} 23:59:59`] }
    }
    let search = [
        {
            name: {
                [Op.like]: '%' + "" + '%'
            }
        },
        {
            color: {
                [Op.like]: '%' + "" + '%'
            }
        }
    ]
    if (keyword) {
        search = [
            {
                title: {
                    [Op.like]: '%' + keyword + '%'
                }
            },
            {
                color: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        ]
    }
    var { count, rows } = await Tag.findAndCountAll({
        where: {
            ...whereData,
            [Op.or]: search
        },
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
    })
    res.status(200).json({ code: 200, count, rows, message: '获取标签列表成功！' })
})

// 标签文章分页
router.get('/page', async function (req, res) {
    var { id, nowPage, pageSize } = req.query
    var offset = parseInt((nowPage - 1) * pageSize)
    var limit = parseInt(pageSize)
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
router.put('/update', async function (req, res, next) {
    let row = { ...req.body }
    delete row.id
    const result = await Tag.update({
        ...row
    }, {
        where: { id: req.body.id }
    })
    res.status(200).json({ code: 200, result, message: '修改标签成功！' })
})

// 新增标签
router.post('/add', async function (req, res, next) {
    let row = { ...req.body }
    delete row.id
    const result = await Tag.create({
        ...row
    })
    res.status(200).json({ code: 200, result, message: '新增标签成功！' })
})

// 删除标签
router.delete('/delete', async function (req, res, next) {
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