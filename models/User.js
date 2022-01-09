const Sequelize = require('sequelize');
const MD5 = require('crypto-js/md5');
const sequelize = require('../config/db');
const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    username: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    avatar: {
      type: Sequelize.STRING(100),
      defaultValue: null,
    },
    title: {
      type: Sequelize.STRING(50),
      defaultValue: '这个人很懒，什么也没有留下',
    },
    token: {
      type: Sequelize.TEXT,
      defaultValue: null,
    },
  },
  {
    hooks: {
      afterValidate: function (User, options) {
        if (User.changed('password')) {
          User.password = MD5(User.password).toString();
        }
      },
    },
    // timestamps: false,
    freezeTableName: true,
  }
)
//   .sync({ force: true })
//   .then((res) => {
//     console.log('如果表存在 会删除表重新建表', res);
//   });
module.exports = User;
