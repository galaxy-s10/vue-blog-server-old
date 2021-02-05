/*
 * @Author: your name
 * @Date: 2021-02-05 13:02:54
 * @LastEditTime: 2021-02-05 13:29:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \hss\vueblog-server\models\day.js
 */
const Sequelize = require('sequelize')
const sequelize = require('../config/db')
const Day_data = sequelize.define(
    'day_data',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        today: {
            type: Sequelize.STRING(50),
        },
    },
    {
        freezeTableName: true
    }
)

// .sync({ force: true })会删除并重建表
// Day_data.sync({ force: true }).then((res) => {
//     console.log('如果表存在 会删除表重新建表')
//     console.log(res)
// })
module.exports = Day_data