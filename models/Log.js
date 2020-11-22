const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Log = sequelize.define(
    'log',
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
        api_ip: {
            type: Sequelize.STRING(50),
        },
        api_hostname: {
            type: Sequelize.STRING(50),
        },
        api_method: {
            type: Sequelize.STRING(20),
        },
        api_path: {
            type: Sequelize.STRING(50),
        },
        api_query: {
            type: Sequelize.STRING,
        },
        api_body: {
            type: Sequelize.STRING,
        },
    },
    {
        freezeTableName: true
    }
)

// .sync({ force: true })会删除并重建表
// Log.sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Log