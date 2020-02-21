const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Comment = sequelize.define(
    'Comment',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        article_id: {
            type: Sequelize.INTEGER,
        },
        from_userid: {
            type: Sequelize.INTEGER,
        },
        to_commentid: {
            type: Sequelize.INTEGER,
        },
        to_username: {
            type: Sequelize.STRING,
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
module.exports = Comment