const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Article = sequelize.define(
    'Article',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING(50),
        },
        type: {
            type: Sequelize.STRING(20),
        },
        img: {
            type: Sequelize.STRING(100),
            defaultValue: '无'
        },
        content: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.DATE,
        },
        click: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    },
    {
        // timestamps: false,
        freezeTableName: true
    }
)
// Article.sync({ force: true }).then((res) => {
//     console.log('// 如果表存在 会删除表重新建表')
//     console.log(res)
//     // return Article.create({
//     //     id: 1,
//     //     username: 'John',
//     //     password: 'Hancock'
//     // });
// })
module.exports = Article