var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Comment = require('../models/Comment')
var User = require('../models/User')
var Article = require('../models/Article')
var authJwt = require('../lib/authJwt')

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
    from_userid: Joi.number().required(),
    content: Joi.string().min(3).max(200).required(),
    to_commentid: Joi.number().required(),
    to_userid: Joi.number().required(),
}).xor('id')


//留言板留言/单篇文章留言列表
router.get('/', async function (req, res) {
    var { article_id } = req.query
    var { rows, count } = await Comment.findAndCountAll({
        where: { article_id },
        include: [{
            model: User,
            attributes: ['username', 'avatar', 'role'],
            as: "from_user",
        },
        {
            model: User,
            attributes: ['username', 'avatar', 'role'],
            as: "to_user",
        }
        ],
        order: [['createdAt', 'DESC']],
    })
    // res.json({ rows, count })
    var lists = []
    // 遍历原本的数据
    for (var i = 0; i < rows.length; i++) {
        // var father = rows[i]
        // 获取干净的JSON对象
        var list = rows[i].get({
            plain: true,
        })
        // 如果newrows里有to_commentid,则把这条数据插入它的父级
        var child = []
        for (var j = 0; j < rows.length; j++) {
            if (rows[j].to_commentid == list.id) {
                child.push(rows[j])
            }
        }
        list.children = child
        if (rows[i].to_commentid == -1) {
            lists.push(list)
        }
    }
    res.json({ lists, count })

})

//所有文章留言列表
router.get('/all', async function (req, res) {
    var { rows, count } = await Comment.findAndCountAll({
        where: {
            article_id: { [Op.ne]: -1 }
        },
        // attributes: ['article_id','content','to_commentid'],
        include: [
            {
                model: Article,
                attributes: ['title'],
            },
            {
                // model: Article,
                // attributes: ['title'],
                model: User,
                attributes: ['username', 'avatar', 'role'],
                as: "from_user",
            },
            {
                attributes: ['username', 'avatar', 'role'],
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
        // 如果newrows里有to_commentid,则把这条数据插入它的父级
        var child = []
        for (var j = 0; j < rows.length; j++) {
            if (rows[j].to_commentid == list.id) {
                child.push(rows[j])
            }
        }
        list.children = child
        if (rows[i].to_commentid == -1) {
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
    var { article_id, from_userid, content, to_commentid, to_userid } = req.body
    console.log(article_id, from_userid, content, to_commentid, to_userid)
    var add = await Comment.create({
        article_id, from_userid, content, to_commentid, to_userid
    })
    res.status(200).json({ code: 1, add })


})


module.exports = router