const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Role = sequelize.define(
    'role',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        role_name: {
            type: Sequelize.STRING(50),
        },
        role_description: {
            type: Sequelize.STRING(50),
        },
        p_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
    },
    {
        freezeTableName: true
    }
)
// Role.sync({ force: true }).then((res) => {
//     console.log('// 如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Role