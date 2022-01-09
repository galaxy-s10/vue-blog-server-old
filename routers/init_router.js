var express = require('express');

var router = express.Router();
var Role = require('../models/Role');
var Auth = require('../models/Auth');
const Role_auth = require('../models/Role_auth');

const {
  bulkCreateAuth,
  bulkCreateRole,
  bulkCreateRoleAuth,
} = require('./initData');

router.post('/initAuth', async function (req, res, next) {
  try {
    await Auth.bulkCreate(bulkCreateAuth);
    res.status(200).json({
      code: 200,
      message: '初始化auth成功!',
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: 400,
      error,
    });
  }
});

router.post('/initRole', async function (req, res, next) {
  try {
    await Role.bulkCreate(bulkCreateRole);
    res.status(200).json({
      code: 200,
      message: '初始化role成功!',
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: 400,
      error,
    });
  }
});

// 初始化超级管理员权限
router.post('/initRoleAuth', async function (req, res, next) {
  try {
    await Role_auth.bulkCreate(bulkCreateRoleAuth);
    res.status(200).json({
      code: 200,
      message: '初始化role_auth成功!',
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: 400,
      error,
    });
  }
});

module.exports = router;
