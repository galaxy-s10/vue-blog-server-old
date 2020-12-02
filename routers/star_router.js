var express = require('express')
var router = express.Router()
const Joi = require('@hapi/joi')
var Article = require('../models/Article')
var Comment = require('../models/Comment')
var User = require('../models/User')
var authJwt = require('../lib/authJwt')
const Star = require('../models/Star')

// // 判断权限
// router.use((req, res, next) => {
//     console.log('判断权限');
//     const validateList = ['/add', '/del']
//     console.log(validateList.indexOf(req.path.toLowerCase()));
//     if (validateList.indexOf(req.path.toLowerCase()) != -1) {
//         const jwt_res = authJwt(req)
//         console.log(jwt_res);
//         jwt_res.code == 401 ? next(jwt_res) : next()
//         // 不加return会继续执行if语句外面的代码
//         return
//     } else {
//         next()
//     }
//     // console.log('没想到吧，我还会执行');
// })

// // 判断参数
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

// 判断某用户有没有给某篇文章点赞
router.get('/articleStar', async function (req, res) {
    var { from_user_id, article_id } = req.query
    var result = await Star.findOne({
        // 去重
        where: { article_id, from_user_id },
    })
    res.status(200).json({ code: 200, result })
})

// 给文章点赞
router.post('/starForArticle', async function (req, res) {
    var { article_id, from_user_id } = req.body
    var result = await Star.create({
        article_id, from_user_id
    })
    res.status(200).json({ code: 200, result, message: "点赞成功~" })
})

// 给文章取消点赞
router.delete('/delStarForArticle', async function (req, res) {
    var { article_id, from_user_id } = req.body
    var result = await Star.destroy({
        where: { article_id, from_user_id }
    })
    res.status(200).json({ code: 200, result, message: "已取消点赞~" })
})

// 给文章/留言板下的评论点赞
router.post('/starForComment', async function (req, res) {
    var { article_id, comment_id, from_user_id, to_user_id } = req.body
    var result = await Star.create({
        article_id, comment_id, from_user_id, to_user_id
    })
    res.status(200).json({ code: 200, result, message: "点赞成功~" })
})

// 给文章/留言板下的评论取消点赞
router.delete('/starForComment', async function (req, res) {
    var { article_id, comment_id, from_user_id, to_user_id } = req.body
    var result = await Star.destroy({
        where: { article_id, comment_id, from_user_id, to_user_id }
    })
    res.status(200).json({ code: 200, result, message: "已取消点赞~" })
})

module.exports = router