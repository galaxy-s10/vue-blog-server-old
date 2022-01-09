const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const User_role = sequelize.define(
  'user_role',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    role_id: {
      type: Sequelize.INTEGER,
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
module.exports = User_role;
