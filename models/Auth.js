const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Auth = sequelize.define(
    'auth',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        auth_name: {
            type: Sequelize.STRING(50),
        },
        auth_description: {
            type: Sequelize.STRING(50),
        },
        p_id: {
            type: Sequelize.INTEGER,
        }
    },
    {
        freezeTableName: true
    }
)
// Auth.sync({ force: true }).then((res) => {
//     console.log('// 如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Auth