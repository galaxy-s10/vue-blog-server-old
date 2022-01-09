const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Comment = sequelize.define(
  'comment',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    from_user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    to_comment_id: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    to_user_id: {
      type: Sequelize.INTEGER,
    },
    content: {
      type: Sequelize.STRING,
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
module.exports = Comment;
