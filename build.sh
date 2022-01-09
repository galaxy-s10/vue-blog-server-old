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
echo 开始安装依赖：
npm install
echo pm2维护：
pm2 start app.js --name 'node3003'
