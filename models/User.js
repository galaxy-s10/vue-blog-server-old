const Sequelize = require('sequelize')
const MD5 = require('crypto-js/md5')
const sequelize = require('../config/db')
const User = sequelize.define(
    'user',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        username: Sequelize.STRING(20),
        password: Sequelize.STRING(50),
        role: {
            type: Sequelize.STRING(20),
            defaultValue: 'user'
        },
        status: {
            type: Sequelize.INTEGER,
        },
        avatar: {
            type: Sequelize.STRING(100),
            defaultValue: null
        },
        title: {
            type: Sequelize.STRING(20),
            defaultValue: '无'
        },
        token: {
            type: Sequelize.STRING,
        },
    },
    {
        hooks: {
            afterValidate: function (User, options) {
                if (User.changed('password')) {
                    User.password = MD5(User.password).toString()
                }
            }
        },
        // timestamps: false,
        freezeTableName: true
    }
)
// Usera.sync().then((res) => {
//     console.log('// 如果表存在 不会刷新结构')
//     console.log(res)
// })
// User.sync({ force: true }).then((res) => {
//     console.log('// 如果表存在 会删除表重新建表')
//     console.log(res)
//     return User.create({
//         id: 1,
//         username: 'John',
//         password: 'Hancock'
//     });
// })

// Message.belongsTo(User) //默认将 UserId 添加到 Message
// Message.belongsTo(User,{ as:'userxxx', foreignKey: 'from_userid',targetKey: 'id'})
// Message.belongsToMany(User,)


module.exports = User