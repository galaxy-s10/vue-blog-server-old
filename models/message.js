const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Message = sequelize.define(
    'Message',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        message_id: {
            type: Sequelize.INTEGER,
        },
        from_userid: {
            type: Sequelize.INTEGER,
        },
        to_userid: {
            type: Sequelize.INTEGER,
        },
        content: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.DATE,
        }
    },
    {
        // timestamps: false,
        freezeTableName: true
    }
)
// Message.belongsTo(User)
// Message.belongsTo(User,{foreignKey: 'from_userid'})
// Message.belongsTo(User,{as:'authora',foreignKey: 'from_userid', sourceKey: 'id'})
// User.hasMany(Message,{as:'author',foreignKey: 'from_userid', sourceKey: 'id'})
module.exports = Message