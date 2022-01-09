const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Music = sequelize.define(
  'music',
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
    img: {
      type: Sequelize.STRING(100),
    },
    author: {
      type: Sequelize.STRING(50),
    },
    url: {
      type: Sequelize.STRING(100),
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  }
);
// .sync({ force: true })
// .then((res) => {
//   console.log('如果表存在 会删除表重新建表', res);
// });
module.exports = Music;
