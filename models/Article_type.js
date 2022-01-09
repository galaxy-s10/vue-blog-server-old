const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Article_type = sequelize.define(
  'article_type',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: Sequelize.INTEGER,
    },
    type_id: {
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
module.exports = Article_type;
