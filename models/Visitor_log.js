const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Visitor_log = sequelize.define(
    'visitor_log',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
        },
        ip: {
            type: Sequelize.STRING(50),
        },
        state: {
            type: Sequelize.INTEGER,
        },
        data: {
            type: Sequelize.STRING(300),
        },
    },
    {
        freezeTableName: true
    }
)

// .sync({ force: true })会删除并重建表
// Visitor_log.sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Visitor_log