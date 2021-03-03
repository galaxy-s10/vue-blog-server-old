const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Link = sequelize.define(
    'link',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        ip: {
            type: Sequelize.STRING(50),
        },
        email: {
            type: Sequelize.STRING(100),
        },
        name: {
            type: Sequelize.STRING(50),
        },
        avatar: {
            type: Sequelize.STRING(100),
        },
        description: {
            type: Sequelize.STRING(50),
        },
        url: {
            type: Sequelize.STRING(100),
        },
        status: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
    },
    {
        freezeTableName: true
    }
)
// Link.sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Link