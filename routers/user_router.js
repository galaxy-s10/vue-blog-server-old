const express = require('express');
const MD5 = require('crypto-js/md5');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { secret } = require('../config/secret');
const Joi = require('@hapi/joi');
const router = express.Router();
const User = require('../models/User');
const Third_user = require('../models/Third_user');
const Role = require('../models/Role');
const Star = require('../models/Star');
var Comment = require('../models/Comment');
var Article = require('../models/Article');
// var User_article = require('../models/User_article')
const User_role = require('../models/User_role');
const userInfo = require('../lib/userInfo');
const permission = require('../lib/permission');
const authJwt = require('../lib/authJwt');
const User_article = require('../models/User_article');

// 判断权限
router.use(async (req, res, next) => {
  let permissionResult;
  switch (req.path.toLowerCase()) {
    case '/add':
      permissionResult = await permission(userInfo.id, 'ADD_USER');
      break;
    case '/delete':
      permissionResult = await permission(userInfo.id, 'DELETE_USER');
      break;
    case '/updateUserAndRole':
      permissionResult = await permission(userInfo.id, 'UPDATE_USER');
      break;
  }
  if (permissionResult && permissionResult.code != 200) {
    next(permissionResult);
  } else {
    next();
  }
});

// 判断参数
// const validateUser = Joi.object({
//     id: [
//         null,
//         Joi.number().required()
//     ],
//     username: Joi.string().min(3).max(10).required(),
//     password: Joi.string().pattern(new RegExp(/^\w{6,12}$/)).required(),
//     // role: [
//     //     "user",
//     //     "admin"
//     // ],
//     avatar: [
//         null,
//         Joi.string().max(150)
//     ],
//     title: Joi.string().min(3).max(20),
// }).xor("id").xor("avatar")

// 注册用户
router.post('/register', async function (req, res, next) {
  const { username, password } = req.body;
  const bool = await User.findOne({
    attributes: ['username'],
    where: {
      username,
    },
  });
  // 查询是否同名用户
  if (!bool) {
    const add_user = await User.create({
      username,
      password,
    });
    const add_third_user = await Third_user.create({
      userid: add_user.id,
      platform: 'website',
      platform_openid: add_user.id,
    });
    add_user.setRoles([8]);
    res.status(200).json({
      code: 200,
      add_user,
      message: '注册成功!',
    });
  } else {
    next({
      code: 400,
      message: username + '用户名已被注册!',
    });
  }
});

// 新增用户
router.post('/add', async function (req, res, next) {
  const { username, password, avatar, title } = req.body;
  const list = await User.findOne({
    attributes: ['username'],
    where: {
      username,
    },
  });
  // 这个功能有bug
  // 查询是否同名用户
  if (!list) {
    const jwt_res = authJwt(req);
    if (role == 'admin') {
      if (jwt_res.code == 401) {
        next(jwt_res);
        return;
      } else if (jwt_res.code == 200 && jwt_res.user.role == 'user') {
        next(jwt_res);
        return;
      } else if (jwt_res.code == 200 && jwt_res.user.role == 'admin') {
        const userinfo = await User.create({
          attributes: {
            exclude: ['password', 'token'],
          },
          username,
          password,
          avatar,
          title,
        });
        res.json({
          code: 1,
        });
        return;
      }
    } else {
      const userInfo = await User.create({
        attributes: {
          exclude: ['password', 'token'],
        },
        username,
        password,
        avatar,
        title,
      });
      const userRole = await User_role.create({
        user_id: userInfo.id,
        role_id: 6,
      });
      res.json({
        code: 200,
        userInfo,
        message: '注册成功!',
      });
      return;
    }
  } else {
    next({
      code: 400,
      message: username + '用户名已被注册!',
    });
  }
});

// 登录
router.post('/login', async function (req, res, next) {
  var { username, password, exp } = req.body;
  // console.log(username, password)
  if (username && password) {
    var password = MD5(password).toString();
    const userInfo = await User.findOne({
      attributes: {
        exclude: ['password', 'token'],
      },
      where: {
        username,
        password,
      },
    });
    if (userInfo) {
      if (!userInfo.status) {
        return next({
          code: 403,
          token: null,
          message: '该账号已被禁用!',
        });
        // res.status(403).json({ code: 403, token: null, message: "该账号已被禁用!" })
      }
      let created = Math.floor(Date.now() / 1000);
      const token = jwt.sign(
        {
          userInfo,
          // exp:1，1小时后过期
          // exp:2，2小时后过期
          // exp:3，3小时后过期
          // ...
          exp: created + 60 * 60 * exp,
          // exp: created + 60 * 60, //一小时后过期
        },
        secret
      );
      let { id } = userInfo;
      await User.update(
        {
          token,
        },
        {
          where: {
            id,
          },
        }
      );
      res.status(200).json({
        token,
        message: '登录成功!',
      });
    } else {
      console.log('密码错了');
      res.status(401).json({
        code: 401,
        token: null,
        message: '账号或密码错误!',
      });
    }
  } else {
    next({
      code: 400,
      message: '参数错误',
    });
  }
});

// 获取用户信息
router.get('/getUserInfo', async function (req, res) {
  const jwtResult = await authJwt(req);
  res.status(200).json(jwtResult);
});

// 获取用户列表
router.get('/pageList', async function (req, res, next) {
  var { nowPage, pageSize, keyword, status, createdAt, updatedAt } = req.query;
  var offset = parseInt((nowPage - 1) * pageSize);
  var limit = parseInt(pageSize);
  let whereData = {};
  if (createdAt) {
    whereData['createdAt'] = {
      [Op.between]: [createdAt, `${createdAt} 23:59:59`],
    };
  }
  if (updatedAt) {
    whereData['updatedAt'] = {
      [Op.between]: [updatedAt, `${updatedAt} 23:59:59`],
    };
  }
  let search = [
    {
      username: {
        [Op.like]: '%' + '' + '%',
      },
    },
    {
      title: {
        [Op.like]: '%' + '' + '%',
      },
    },
  ];
  // let permissionResult = await permission(userInfo.id, "USER_LIST")

  // if (status != undefined) {
  //     if (!permissionResult) {
  //         whereData["status"] = 1
  //     } else {
  //         whereData["status"] = status
  //     }

  // } else {
  //     if (!permissionResult) {
  //         whereData["status"] = 1
  //     }
  // }
  if (keyword != undefined) {
    search = [
      {
        username: {
          [Op.like]: '%' + keyword + '%',
        },
      },
      {
        title: {
          [Op.like]: '%' + keyword + '%',
        },
      },
    ];
  }
  const { rows, count } = await User.findAndCountAll({
    attributes: {
      exclude: ['password', 'token'],
    },
    limit: limit,
    offset: offset,
    where: {
      ...whereData,
      [Op.or]: search,
    },
    include: [
      {
        model: Role,
        include: [
          {
            model: Role,
            as: 'p_role',
          },
        ],
      },
      {
        model: Star,
      },
      {
        model: Third_user,
      },
    ],
    // 去重
    distinct: true,
  });
  res.status(200).json({
    code: 200,
    count,
    rows,
    message: '获取用户列表成功!',
  });
});

// 查询用户网站所有信息
router.get('/allData', async function (req, res, next) {
  const detail = await User.findOne({
    attributes: {
      exclude: ['token', 'password'],
    },
    include: [
      {
        model: Article,
      },
      {
        model: Star,
      },
    ],
    where: {
      id: 1,
    },
  });
  // let newreq = req.get({
  //     plain: true,
  // })
  // console.log(req);
  console.log(req.headers);
  res.status(200).json({
    code: 200,
    detail,
    message: '查询用户信息成功!',
    reqinfo: {
      api_ip: req.headers['x-real-ip'],
      api_hostname: req.hostname,
      api_path: req.path,
      api_method: req.method,
      api_query: JSON.stringify(req.query),
      api_body: JSON.stringify(req.body),
    },
  });
});

// 查询是否重名
router.get('/findDuplicate', async function (req, res, next) {
  // try {
  const count = await User.count({
    where: {
      username: req.query.username,
      id: {
        [Op.ne]: req.query.id,
      },
    },
  });
  res.status(200).json({
    code: 200,
    count,
    message: count == 0 ? '你可使用该昵称' : '已存在相同昵称用户,请重试!',
  });
  // } catch (err) {
  //     console.log(err)
  //     res.status(400).json({
  //         code: 400,
  //         message: err.message
  //     })
  // }
});

// 查询用户信息
router.get('/findOne', async function (req, res, next) {
  const detail = await User.findOne({
    attributes: {
      exclude: ['token', 'password'],
    },
    include: [
      {
        model: Article,
      },
      {
        model: Star,
      },
      // {
      //     model: Star,
      //     as: 'userHasStar',
      //     include: [
      //         {
      //             model: Article,
      //         },
      //     ]
      // },
      // {
      //     model: User_article,
      //     where: {
      //         id: 2
      //     },
      //     required: false,
      // },
    ],
    where: {
      id: req.query.id,
    },
  });
  res.status(200).json({
    code: 200,
    detail,
    message: '查询用户信息成功!',
  });
});

// 修改用户
router.put('/update', async function (req, res, next) {
  let {
    // id,
    username,
    password,
    title,
    avatar,
    status,
  } = req.body;
  const count = await User.count({
    where: {
      username: username,
      id: {
        [Op.ne]: userInfo.id,
      },
    },
  });
  if (count == 0) {
    let find_user = await User.findByPk(userInfo.id);
    let update_user = await find_user.update({
      username,
      password,
      title,
      avatar,
      status,
    });
    res.status(200).json({
      code: 200,
      update_user,
      message: '修改用户成功!',
    });
  } else {
    res.status(200).json({
      code: 200,
      message: '已存在相同昵称用户,请重试!',
    });
  }
});

// 修改用户信息和角色
router.put('/updateUserAndRole', async function (req, res, next) {
  let { id, username, password, title, avatar, status, roles } = req.body;
  let find_user = await User.findByPk(id);
  let update_user = await find_user.update({
    username,
    password,
    title,
    avatar,
    status,
  });
  let result = await find_user.setRoles(roles);
  res.status(200).json({
    code: 200,
    result,
    message: '修改用户信息和角色成功!',
  });
});

// 删除用户
router.delete('/delete', async function (req, res, next) {
  let find_user = await User.findByPk(req.body.id);
  let result = await find_user.setRoles([]);
  await find_user.destroy();
  res.status(200).json({
    code: 200,
    result,
    message: '删除用户成功!',
  });
});

module.exports = router;
