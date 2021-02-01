const Article = require('./Article.js')
const Article_tag = require('./Article_tag.js')
const Comment = require('./Comment.js')
const User = require('./User.js')
const Tag = require('./Tag.js')
const Link = require('./Link.js')
const Music = require('./Music.js')
const Auth = require('./Auth')
const Role = require('./Role')
const Role_auth = require('./Role_auth')
const User_role = require('./User_role')
const Type = require('./Type')
const Article_type = require('./Article_type')
const Log = require('./Log')
const Visitor_log = require('./Visitor_log')
const Star = require('./Star')
const Frontend = require('./Frontend')
const User_article = require('./User_article')
const Qiniu_data = require('./Qiniu_data')
// 一对一关联：belongsTo，hasOne 
// 一对多关联：hasMany
// 多对多关联：belongsToMany

Comment.belongsTo(User, { as: 'from_user', foreignKey: 'from_user_id', targetKey: 'id' })
Comment.belongsTo(User, { as: 'to_user', foreignKey: 'to_user_id', targetKey: 'id' })

// Article有很多Comment,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article里
Article.hasMany(Comment, { foreignKey: 'article_id', sourceKey: 'id' })
// Comment属于Article,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article表里
Comment.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })

Tag.hasMany(Article_tag, { foreignKey: 'tag_id', sourceKey: 'id' })
Article_tag.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })
Article_tag.belongsTo(Tag, { foreignKey: 'tag_id', targetKey: 'id' })

Article.belongsToMany(Tag, { through: Article_tag, foreignKey: 'article_id', otherKey: 'tag_id' })
Tag.belongsToMany(Article, { through: Article_tag, foreignKey: 'tag_id', otherKey: 'article_id' })

// 2020-11-08新增
User_role.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' })
User_role.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id' })

Role_auth.belongsTo(Auth, { foreignKey: 'auth_id', targetKey: 'id' })
Role_auth.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id' })


Role.belongsToMany(User, { through: User_role, foreignKey: 'role_id', otherKey: 'user_id' })
User.belongsToMany(Role, { through: User_role, foreignKey: 'user_id', otherKey: 'role_id' })

User_role.belongsTo(User, { foreignKey: "user_id", targetKey: 'id' })
User_role.belongsTo(Role, { foreignKey: "role_id", targetKey: 'id' })

Role.belongsToMany(Auth, { through: Role_auth, foreignKey: 'role_id', otherKey: 'auth_id' })
Auth.belongsToMany(Role, { through: Role_auth, foreignKey: 'auth_id', otherKey: 'role_id' })

User.hasMany(Log, { foreignKey: 'user_id', sourceKey: 'id' })
Log.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' })

Role.belongsTo(Role, { as: "p_role", foreignKey: 'p_id', sourceKey: 'id' })
// Role.hasMany(Role, { as: "h_role", foreignKey: 'id', sourceKey: 'p_id' })
Auth.hasMany(Auth, { foreignKey: 'id', sourceKey: 'p_id' }) //??????

// 点赞
Star.belongsTo(Article, { foreignKey: "article_id", targetKey: "id" })
Star.belongsTo(Comment, { foreignKey: "comment_id", targetKey: "id" })
Star.belongsTo(User, { foreignKey: "from_user_id", targetKey: "id" })

Article.hasMany(Star, { foreignKey: "article_id", sourceKey: "id" })
User.hasMany(Star, { foreignKey: "to_user_id", sourceKey: "id" })

Comment.hasMany(Star, { foreignKey: "comment_id", sourceKey: "id" })

Star.belongsTo(User, { as: "from_user", foreignKey: "from_user_id", targetKey: "id" })
Star.belongsTo(User, { as: "to_user", foreignKey: "to_user_id", targetKey: "id" })

// 评论回复
// Comment.belongsTo(Comment, { as: "huifu", foreignKey: "to_comment_id", targetKey: "id" })
// 自连接的源键其实可以不写，不写默认就是mode里定义的主键
// Comment.hasMany(Comment, { as: "huifu", foreignKey: "to_comment_id", sourceKey: "id" })
Comment.hasMany(Comment, { as: "huifu", foreignKey: "to_comment_id", sourceKey: "id" })
Comment.hasMany(Comment, { as: "huifucount", foreignKey: "to_comment_id", sourceKey: "id" })

// User_article.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' })
// User_article.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })
// Article.hasOne(User_article, { foreignKey: 'article_id', targetKey: 'id' })
Article.belongsToMany(User, { through: User_article, foreignKey: 'article_id', otherKey: 'user_id' })
User.belongsToMany(Article, { through: User_article, foreignKey: 'user_id', otherKey: 'article_id' })

// Type.hasMany(Article_type, { foreignKey: 'tag_id', sourceKey: 'id' })
Article_type.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })
Article_type.belongsTo(Type, { foreignKey: 'type_id', targetKey: 'id' })

Article.belongsToMany(Type, { through: Article_type, foreignKey: 'article_id', otherKey: 'type_id' })
Type.belongsToMany(Article, { through: Article_type, foreignKey: 'type_id', otherKey: 'article_id' })

Qiniu_data.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' })