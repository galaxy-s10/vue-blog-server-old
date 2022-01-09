const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Auth = sequelize.define(
  'auth',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    auth_name: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    auth_description: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    p_id: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
module.exports = Auth;
