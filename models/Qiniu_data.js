const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Qiniu_data = sequelize.define(
    'qiniu_data',
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
        bucket: {
            type: Sequelize.STRING(50),
        },
        fsize: {
            type: Sequelize.INTEGER,
        },
        mimeType: {
            type: Sequelize.STRING(50),
        },
        hash: {
            type: Sequelize.STRING(50),
        },
        putTime: {
            type: Sequelize.INTEGER,
        },
        status: {
            type: Sequelize.INTEGER,
        },
        type: {
            type: Sequelize.INTEGER,
        },
        key: {
            type: Sequelize.STRING(50),
        },
    },
    {
        freezeTableName: true
    }
)
// .sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Qiniu_data