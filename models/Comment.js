const Sequelize = require("sequelize")
const sequelize = require("../config/db")
const Comment = sequelize.define(
    "comment",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        article_id: {
            type: Sequelize.INTEGER,
            defaultValue: -1
        },
        from_user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        to_comment_id: {
            type: Sequelize.INTEGER,
            defaultValue: -1
        },
        to_user_id: {
            type: Sequelize.INTEGER,
        },
        content: {
            type: Sequelize.STRING,
        }
    },
    {
        freezeTableName: true
    }
)
module.exports = Comment