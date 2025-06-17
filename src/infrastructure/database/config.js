const config = require('../../config');

module.exports = {
    database: config.db.database,
    username: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: config.nodeEnv === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true
    }
}; 