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
        name: {
            type: Sequelize.STRING,
        },
        avatar: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        url: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.STRING,
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