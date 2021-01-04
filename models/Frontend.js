const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Frontend = sequelize.define(
    'frontend',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        frontend_login: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        frontend_register: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        frontend_about: {
            type: Sequelize.STRING,
        },
        frontend_comment: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    },
    {
        freezeTableName: true
    }
)

// .sync({ force: true })会删除并重建表
// .sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Frontend