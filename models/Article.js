const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Article = sequelize.define(
    // 这将控制自动生成的foreignKey和关联命名的名称
    'article',
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
        is_comment: {
            type: Sequelize.INTEGER,
        },
        status: {
            type: Sequelize.INTEGER,
        },
        img: {
            type: Sequelize.STRING(100),
            defaultValue: null
        },
        content: {
            type: Sequelize.STRING,
        },
        click: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    },
    {
        freezeTableName: true,
    }
)
// .sync({ force: true })会删除并重建表
// Articlea.sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Article