const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Role_auth = sequelize.define(
    'role_auth',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        role_id: {
            type: Sequelize.INTEGER,
        },
        auth_id: {
            type: Sequelize.INTEGER,
        },
    },
    {
        freezeTableName: true
    }
)
// Role_auth.sync({ force: true }).then((res) => {
//     console.log('// 如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Role_auth