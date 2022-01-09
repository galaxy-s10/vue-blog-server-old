###
# @Author: hss
# @Email: 2274751790@qq.com
# @Github: https://github.com/galaxy-s10
# @Date: 2022-01-09
# @Description: https://github.com/galaxy-s10/vueblog-server
###
echo 查看npm版本:
npm -v
echo 删除node_modules:
rm -rf node_modules
echo 开始安装依赖:
npm install
echo 设置npm淘宝镜像:
npm config set registry http://registry.npm.taobao.org/
echo 当前npm镜像:
npm get registry
echo 全局安装pm2:
npm install pm2 -g
# echo pm2维护：
# pm2 start app.js --name 'node3003'
