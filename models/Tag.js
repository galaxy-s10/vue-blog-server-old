const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Tag = sequelize.define(
    'tag',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
        },
        color: {
            type: Sequelize.STRING,
        },
    },
    {
        freezeTableName: true
    }
)
module.exports = Tag