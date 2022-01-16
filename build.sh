#!/usr/bin/env bash
###
# Author: shuisheng
# Email: 2274751790@qq.com
# Github: https://github.com/galaxy-s10
# Date: 2022-01-10 12:23:21
# LastEditTime: 2022-01-16 04:03:18
# Description: https://gitee.com/galaxy-s10/vueblog-server
###

# 约定$1为任务名, $2为环境, $3为Jenkins工作区
JOBNAME=$1 # 注意: JOBNAME=$1,这个等号左右不能有空格！
ENV=$2
WORKSPACE=$3
PUBLICDIR=/node

echo 删除node_modules:
rm -rf node_modules

echo 查看npm版本:
npm -v

echo 设置npm淘宝镜像:
npm config set registry http://registry.npm.taobao.org/

echo 当前npm镜像:
npm get registry

echo 开始安装依赖:
npm install
