require('dotenv').config();

module.exports = {
    development: {
        username: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || 'sapassword',
        database: process.env.MYSQLDATABASE || 'EmployeeDatabase',
        host: process.env.MYSQLHOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false,
    },
    test: {
        username: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || null,
        database: 'database_test', // Thường database test nên để riêng
        host: process.env.MYSQLHOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false,
    },
    production: {
        username: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        host: process.env.MYSQLHOST,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    },
};
