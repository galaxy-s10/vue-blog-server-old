var Article = require('./Article.js')
var Article_tag = require('./Article_tag.js')
var Comment = require('./Comment.js')
var User = require('./User.js')
var Tag = require('./Tag.js')
var Link = require('./Link.js')

// 一对一关联：belongsTo，hasOne 
// 一对多关联：hasMany
// 多对多关联：belongsToMany

Comment.belongsTo(User, { as: 'from_user', foreignKey: 'from_userid', targetKey: 'id' })
Comment.belongsTo(User, { as: 'to_user', foreignKey: 'to_userid', targetKey: 'id' })

// Article有很多Comment,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article里
Article.hasMany(Comment, { foreignKey: 'article_id', sourceKey: 'id' })
// Comment属于Article,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article表里
Comment.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })

Tag.hasMany(Article_tag, { foreignKey: 'tag_id', sourceKey: 'id' })
Article_tag.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })
Article_tag.belongsTo(Tag, { foreignKey: 'tag_id', targetKey: 'id' })

Article.belongsToMany(Tag, { through: Article_tag, foreignKey: 'article_id', otherKey: 'tag_id' })
Tag.belongsToMany(Article, { through: Article_tag, foreignKey: 'tag_id', otherKey: 'article_id' })
