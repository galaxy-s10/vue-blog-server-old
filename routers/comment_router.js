var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Comment = require('../models/Comment')
var User = require('../models/User')
var Article = require('../models/Article')
var Star = require('../models/Star')
var authJwt = require('../lib/authJwt')
const userInfo = require('../lib/userInfo')

// 判断权限
router.use((req, res, next) => {
    const validateList = ['/add']
    console.log(validateList.indexOf(req.path.toLowerCase()));
    if (validateList.indexOf(req.path.toLowerCase()) != -1) {
        const jwt_res = authJwt(req)
        console.log('判断权限');
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
const validateComment = Joi.object({
    id: [
        null,
        Joi.number()
    ],
    article_id: Joi.number().required(),
    from_user_id: Joi.number().required(),
    content: Joi.string().min(3).max(200).required(),
    to_comment_id: Joi.number().required(),
    to_user_id: Joi.number().required(),
}).xor('id')


// 文章留言列表
router.get('/', async function (req, res) {
    var currentId = userInfo.id || -2
    let { article_id, nowPage, pageSize, childrenNowPage, childrenPageSize } = req.query
    var allCount = await Comment.findAndCountAll({ where: { article_id } })
    var { count, rows } = await Comment.findAndCountAll({
        where: {
            article_id,
            to_comment_id: -1,
        },
        required: false,
        order: [
            ['createdAt', 'DESC'],
        ],
        offset: parseInt((nowPage - 1) * pageSize),
        limit: parseInt(pageSize),
        include: [
            {
                model: Comment,
                // required: false,
                as: "huifucount",
            },
            {
                order: [
                    ['createdAt', 'ASC'],
                ],
                model: Comment,
                required: false,
                as: "huifu",
                offset: parseInt((childrenNowPage - 1) * childrenPageSize),
                limit: parseInt(childrenPageSize),
                include: [
                    {
                        model: Star,
                        required: false,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['password', 'token'] },
                                as: "from_user",
                            },
                            {
                                model: User,
                                attributes: { exclude: ['password', 'token'] },
                                as: "to_user",
                            }
                        ]
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "to_user",
                    }
                ],
            },
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "from_user",
            },
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "to_user",
            },
            {
                where: {
                    to_user_id: { [Op.ne]: -1 },
                },
                required: false,
                model: Star,
                include: [
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "to_user",
                    }
                ]
            },

        ],
        distinct: true
    })
    // res.json({ count, rows })
    // return
    var newlist = [];
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        temp.isStar = false
        if (temp.huifu.length) {
            temp.huifu.forEach(item => {
                item.isStar = false
            })
        }
    }
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        if (temp.stars.length) {
            temp.stars.forEach(item => {
                item.from_user_id
            })
            temp.stars.forEach(item => {
                if (item.from_user_id == currentId) {
                    temp.isStar = true
                }
            })
        } else {
            temp.isStar = false
        }
        if (temp.huifu.length) {
            temp.huifu.forEach(item2 => {
                item2.stars.forEach(item1 => {
                    if (item1.from_user_id == currentId) {
                        item2.isStar = true
                    }
                })
            })
        }

        newlist.push(temp)
    }
    rows = newlist
    res.json({ allCount: allCount.count, count, rows, nowPage: parseInt(nowPage), pageSize: parseInt(pageSize), lastPage: Math.ceil(count / pageSize) })
})

// 文章子留言分页
router.get('/childrenPage', async function (req, res) {
    // var { article_id } = req.query
    var currentId = userInfo.id || -2
    let { article_id, childrenCommentId, childrenNowPage, childrenPageSize } = req.query
    var { count, rows } = await Comment.findAndCountAll({
        where: {
            article_id,
            to_comment_id: childrenCommentId
        },
        order: [['createdAt', 'ASC']],
        offset: parseInt((childrenNowPage - 1) * childrenPageSize),
        limit: parseInt(childrenPageSize),
        include: [
            {
                where: {
                    to_user_id: { [Op.ne]: -1 }
                },
                required: false,
                model: Star,
                include: [
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "to_user",
                    }
                ]
            },
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "from_user",
            },
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "to_user",
            }

        ],
        distinct: true
    })
    // res.json({ count, rows, a:111})
    // return
    var newlist = [];
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        temp.isStar = false
        newlist.push(temp)
    }
    for (let i = 0; i < newlist.length; i++) {
        var temp = newlist[i]
        if (temp.stars.length) {
            temp.stars.forEach(item => {
                if (item.from_user_id == currentId) {
                    temp.isStar = true
                }
            })
        }
    }
    rows = newlist
    res.json({ count, rows, to_comment_id: parseInt(childrenCommentId), childrenNowPage: parseInt(childrenNowPage), childrenPageSize: parseInt(childrenPageSize), childrenLastPage: Math.ceil(count / childrenPageSize) })
    return

})


// 留言板留言列表
router.get('/comment', async function (req, res) {
    var currentId = userInfo.id || -2
    let { article_id, nowPage, pageSize, childrenNowPage, childrenPageSize } = req.query
    var allCount = await Comment.findAndCountAll({ where: { article_id } })
    var { count, rows } = await Comment.findAndCountAll({
        where: {
            article_id, to_comment_id: -1, to_user_id: -1
        },
        // required: false,
        order: [
            ['createdAt', 'DESC'],
        ],
        offset: parseInt((nowPage - 1) * pageSize),
        limit: parseInt(pageSize),
        include: [
            {
                model: Comment,
                // required: false,
                as: "huifucount",
            },
            {
                order: [
                    ['createdAt', 'ASC'],
                ],
                model: Comment,
                // required: false,
                as: "huifu",
                offset: parseInt((childrenNowPage - 1) * childrenPageSize),
                limit: parseInt(childrenPageSize),
                include: [
                    {
                        model: Star,
                        required: false,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['password', 'token'] },
                                as: "from_user",
                            },
                            {
                                model: User,
                                attributes: { exclude: ['password', 'token'] },
                                as: "to_user",
                            }
                        ]
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "to_user",
                    }
                ],
            },
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "from_user",
            },
            {
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "to_user",
            },
            {
                where: {
                    to_user_id: { [Op.ne]: -1 },
                },
                required: false,
                model: Star,
                include: [
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: { exclude: ['password', 'token'] },
                        as: "to_user",
                    }
                ]
            },

        ],
        distinct: true
    })
    // res.json({ count, rows })
    // return
    var newlist = [];
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        temp.isStar = false
        if (temp.huifu.length) {
            temp.huifu.forEach(item => {
                item.isStar = false
            })
        }
    }
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        if (temp.stars.length) {
            temp.stars.forEach(item => {
                item.from_user_id
            })
            temp.stars.forEach(item => {
                if (item.from_user_id == currentId) {
                    temp.isStar = true
                }
            })
        } else {
            temp.isStar = false
        }
        if (temp.huifu.length) {
            temp.huifu.forEach(item2 => {
                item2.stars.forEach(item1 => {
                    if (item1.from_user_id == currentId) {
                        item2.isStar = true
                    }
                })
            })
        }

        newlist.push(temp)
    }
    rows = newlist
    res.json({ allCount: allCount.count, count, rows, nowPage: parseInt(nowPage), pageSize: parseInt(pageSize), lastPage: Math.ceil(count / pageSize) })
})



// 留言板子留言分页
router.get('/commentChildrenPage', async function (req, res) {
    var currentId = userInfo.id || -2
    let { childrenCommentId, childrenNowPage, childrenPageSize } = req.query
    var { count, rows } = await Comment.findAndCountAll({
        where: {
            article_id: -1,
            to_comment_id: childrenCommentId
        },
        order: [['createdAt', 'ASC']],
        offset: parseInt((childrenNowPage - 1) * childrenPageSize),
        limit: parseInt(childrenPageSize),
        include: [
            {
                where: {
                    to_user_id: { [Op.ne]: -1 }
                },
                required: false,
                model: Star,
                include: [
                    {
                        model: User,
                        attributes: ['username', 'avatar'],
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: ['username', 'avatar'],
                        as: "to_user",
                    }
                ]
            },
            {
                model: User,
                attributes: ['username', 'avatar'],
                as: "from_user",
            },
            {
                model: User,
                attributes: ['username', 'avatar'],
                as: "to_user",
            }

        ],
        distinct: true
    })
    // res.json({ count, rows, a:111})
    // return
    var newlist = [];
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        temp.isStar = false
        newlist.push(temp)
    }
    for (let i = 0; i < newlist.length; i++) {
        var temp = newlist[i]
        if (temp.stars.length) {
            temp.stars.forEach(item => {
                if (item.from_user_id == currentId) {
                    temp.isStar = true
                }
            })
        }
    }
    rows = newlist
    res.json({ count, rows, to_comment_id: parseInt(childrenCommentId), childrenNowPage: parseInt(childrenNowPage), childrenPageSize: parseInt(childrenPageSize), childrenLastPage: Math.ceil(count / childrenPageSize) })
    return

})




//父留言分页
router.get('/fasdfads', async function (req, res) {
    // var { article_id } = req.query
    var currentId = userInfo.id || -2
    let { article_id, childrenCommentId, childrenNowPage, childrenPageSize } = req.query
    var { rows, count } = await Comment.findAndCountAll({
        where: {
            article_id,
            to_comment_id
        },
        offset: parseInt((childrenNowPage - 1) * childrenPageSize),
        limit: parseInt(childrenPageSize),
        include: [
            {
                where: {
                    to_user_id: { [Op.ne]: -1 }
                },
                required: false,
                model: Star,
                include: [
                    {
                        model: User,
                        attributes: ['username', 'avatar'],
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: ['username', 'avatar'],
                        as: "to_user",
                    }
                ]
            },
            {
                order: [['createdAt', 'DESC']],
                model: Comment,
                as: "huifu",
                offset: 0,
                limit: 2,
                include: [
                    {
                        model: Star,
                        include: [
                            {
                                model: User,
                                attributes: ['username', 'avatar'],
                                as: "from_user",
                            },
                            {
                                model: User,
                                attributes: ['username', 'avatar'],
                                as: "to_user",
                            }
                        ]
                    },
                    {
                        model: User,
                        attributes: ['username', 'avatar'],
                        as: "from_user",
                    },
                    {
                        model: User,
                        attributes: ['username', 'avatar'],
                        as: "to_user",
                    }
                ],
            },
            {
                model: User,
                attributes: ['username', 'avatar'],
                as: "from_user",
            },
            {
                model: User,
                attributes: ['username', 'avatar'],
                as: "to_user",
            }

        ],
        distinct: true
    })
    var newlist = [];
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        temp.isStar = false
        if (temp.huifu.length) {
            temp.huifu.forEach(item => {
                item.isStar = false
            })
        }
    }
    for (let i = 0; i < rows.length; i++) {
        var temp = rows[i].get({
            plain: true,
        })
        if (temp.stars.length) {
            temp.stars.forEach(item => {
                item.from_user_id
            })
            temp.stars.forEach(item => {
                if (item.from_user_id == currentId) {
                    temp.isStar = true
                }
            })
        } else {
            temp.isStar = false
        }
        if (temp.huifu.length) {
            temp.huifu.forEach(item2 => {
                item2.stars.forEach(item1 => {
                    if (item1.from_user_id == currentId) {
                        item2.isStar = true
                    }
                })
            })
        }

        newlist.push(temp)
    }
    rows = newlist
    res.json({ count, rows, childrenNowPage, childrenPageSize, childrenLastPage: Math.ceil(count / childrenPageSize) })
    return

})



//所有文章留言列表
router.get('/all', async function (req, res) {
    var { rows, count } = await Comment.findAndCountAll({
        where: {
            article_id: { [Op.ne]: -1 }
        },
        // attributes: ['article_id','content','to_comment_id'],
        include: [
            {
                model: Article,
                attributes: ['title'],
            },
            {
                // model: Article,
                // attributes: ['title'],
                model: User,
                attributes: { exclude: ['password', 'token'] },
                as: "from_user",
            },
            {
                attributes: { exclude: ['password', 'token'] },
                model: User,
                as: "to_user",
            }
        ],
        order: [['article_id', 'ASC']],
    })

    var lists = []
    // 遍历原本的数据
    for (var i = 0; i < rows.length; i++) {
        // var father = rows[i]
        // 获取干净的JSON对象
        var list = rows[i].get({
            plain: true,
        })
        // 如果newrows里有to_comment_id,则把这条数据插入它的父级
        var child = []
        for (var j = 0; j < rows.length; j++) {
            if (rows[j].to_comment_id == list.id) {
                child.push(rows[j])
            }
        }
        list.children = child
        if (rows[i].to_comment_id == -1) {
            lists.push(list)
        }
    }
    res.json(lists)
})


// 发表留言
router.post('/add', async function (req, res, next) {
    console.log('发表留言')
    try {
        await validateComment.validateAsync(req.body, { convert: false })
    } catch (err) {
        next({ code: 400, message: err.message })
        return
    }
    var { article_id, from_user_id, content, to_comment_id, to_user_id } = req.body
    console.log(article_id, from_user_id, content, to_comment_id, to_user_id)
    var add = await Comment.create({
        article_id, from_user_id, content, to_comment_id, to_user_id
    })
    res.status(200).json({ code: 1, add })


})


module.exports = router