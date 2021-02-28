const Sequelize = require('sequelize')
const MD5 = require('crypto-js/md5')
const sequelize = require('../config/db')
const Third_user = sequelize.define(
    'third_user',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        userid: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        platform: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        platform_openid: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        platform_token: {
            type: Sequelize.STRING,
            defaultValue: null
        },

    },
    {
        freezeTableName: true
    }
)
// .sync({ force: true }).then((res) => {
//     console.log('// 如果表存在 会删除表重新建表')
//     console.log(res)
// })

module.exports = Third_user