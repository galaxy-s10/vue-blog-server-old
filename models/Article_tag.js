const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Article_tag = sequelize.define(
  'article_tag',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tag_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
module.exports = Article_tag;
