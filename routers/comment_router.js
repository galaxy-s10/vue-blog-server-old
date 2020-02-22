var express = require('express')
var router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
var Comment = require('../models/Comment')
var User = require('../models/User')
var Article = require('../models/Article')

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
            attributes: ['username', 'avatar', 'role'],
            model: User,
            as: "to_user",
        }
        ],
        order: [['createdAt', 'DESC']],
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


//发表留言
router.post('/add', function (req, res) {
    console.log('发表留言')
    var { article_id, from_userid, content, to_commentid, to_username, date } = req.body
    console.log(req.body)
    var add = Comment.create({
        article_id, from_userid, content, to_commentid, to_username, date
    })
    res.json(add)
})
//文章发表留言
router.post('/addcomment', function (req, res) {
    console.log('文章发表留言')
    console.log(req)
    message.addcomment(req.body, function (err, ress) {
        if (err) {
            console.log('文章发表留言sql错了')
            console.log(err)
            res.status(200).send({
                data: err
            })
        } else {
            console.log('文章发表留言成功')
            res.status(200).send({
                code: 20000,
                data: ress
            })
        }

    })
})

//删除留言
router.get('/del', function (req, res) {
    console.log('删除留言')
    message.delete(req.query, function (err, ress) {
        if (err) {
            console.log('删除留言sql错了')
            console.log(err)
            res.status(200).send({
                data: err
            })
        } else {
            console.log('删除留言成功')
            res.status(200).send({
                code: 20000,
                data: ress
            })
        }

    })
})

//查找留言
router.get('/find', function (req, res) {
    console.log('查找留言')
    message.findone(req.query, function (err, ress) {
        if (err) {
            console.log('查找留言sql错了')
            console.log(err)
            res.status(200).send({
                data: err
            })
        } else {
            console.log('查找留言成功')
            res.status(200).send({
                code: 20000,
                data: ress
            })
        }

    })
})

//修改留言
router.post('/edit', function (req, res) {
    console.log('修改留言')
    message.edit(req.body, function (err, ress) {
        if (err) {
            console.log('修改留言sql错了')
            console.log(err)
            res.status(200).send({
                data: err
            })
        } else {
            console.log('修改留言成功')
            res.status(200).send({
                code: 20000,
                data: ress
            })
        }
    })

})


module.exports = router