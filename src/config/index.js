function getNumberEnv(key, defaultValue) {
    const value = process.env[key];
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

function getStringEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
}

const config = {
    nodeEnv: getStringEnv('NODE_ENV', 'development'),
    port: getNumberEnv('PORT', 3000),
    database: {
        host: getStringEnv('DB_HOST', 'localhost'),
        port: getNumberEnv('DB_PORT', 5432),
        name: getStringEnv('DB_NAME', 'pasarela'),
        user: getStringEnv('DB_USER', 'postgres'),
        password: getStringEnv('DB_PASSWORD', 'postgres'),
        dialect: 'postgres'
    },
    wompi: {
        apiUrl: getStringEnv('WOMPI_API_URL', 'https://sandbox.wompi.co/v1'),
        publicKey: getStringEnv('WOMPI_PUBLIC_KEY', 'pub_test_key'),
        privateKey: getStringEnv('WOMPI_PRIVATE_KEY', 'priv_test_key'),
        eventsKey: getStringEnv('WOMPI_EVENTS_KEY', 'events_test_key')
    }
};

module.exports = config;