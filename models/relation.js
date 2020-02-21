var Article = require('./Article.js')
var Comment = require('./Comment.js')
var User = require('./User.js')

Comment.belongsTo(User, { as: 'from_user', foreignKey: 'from_userid', targetKey: 'id' })
// Message.belongsTo(User) //默认将 UserId 添加到 Message
// Article.hasMany(Comment)
Article.hasMany(Comment, { foreignKey: 'article_id', targetKey: 'id' })