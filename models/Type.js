const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Type = sequelize.define(
  'type',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(50),
    },
  },
  {
    freezeTableName: true,
  }
);
//   .sync({ force: true })
//   .then((res) => {
//     console.log('如果表存在 会删除表重新建表', res);
//   });
module.exports = Type;
