require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'payment_processing_db'
    },
    wompi: {
        privateKey: process.env.WOMPI_PRIVATE_KEY_SANDBOX,
        apiUrl: process.env.WOMPI_API_URL_SANDBOX
    }
};