var Article = require('./Article.js')
var Article_tag = require('./Article_tag.js')
var Comment = require('./Comment.js')
var User = require('./User.js')
var Tag = require('./Tag.js')
var Link = require('./Link.js')
var Auth = require('./Auth')
var Role = require('./Role')
var Role_auth = require('./Role_auth')
var User_role = require('./User_role')
var Log = require('./Log')
var Star = require('./Star')

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
Auth.hasMany(Auth, { foreignKey: 'id', sourceKey: 'p_id' })

// 点赞
Star.belongsTo(Article, { foreignKey: "article_id", targetKey: "id" })
Star.belongsTo(Comment, { foreignKey: "comment_id", targetKey: "id" })
Star.belongsTo(User, { foreignKey: "from_user_id", targetKey: "id" })

Article.hasMany(Star, { foreignKey: "article_id", sourceKey: "id" })
User.hasMany(Star, { foreignKey: "to_user_id", sourceKey: "id" })