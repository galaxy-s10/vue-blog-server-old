const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Day_data = sequelize.define(
  'day_data',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    today: {
      type: Sequelize.STRING(50),
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);
//   .sync({ force: true })
//   .then((res) => {
//     console.log('如果表存在 会删除表重新建表', res);
//   });
module.exports = Day_data;
