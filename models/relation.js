var Article = require('./Article.js')
var Comment = require('./Comment.js')
var User = require('./User.js')

// Comment.belongsTo(User, { as: 'from_user', foreignKey: 'from_userid', targetKey: 'id' })
Comment.belongsTo(User, { as: 'from_user',foreignKey: 'from_userid', targetKey: 'id' })
Comment.belongsTo(User, { as: 'to_user',foreignKey: 'to_userid', targetKey: 'id' })
// Message.belongsTo(User) //默认将 UserId 添加到 Message
// Article.hasMany(Comment)
Article.hasMany(Comment, { foreignKey: 'article_id', targetKey: 'id' })


// Comment属于Article,也就是外键在Comment表里，主键在Article表里
Comment.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })
// User.hasMany(Comment,{as: { singular: 'from_user', plural: 'from_users' }, foreignKey: 'from_userid', targetKey: 'from_userid' })