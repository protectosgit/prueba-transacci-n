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
        // Llaves UAT/Staging oficiales proporcionadas
        publicKey: getStringEnv('WOMPI_PUBLIC_KEY', 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7'),
        privateKey: getStringEnv('WOMPI_PRIVATE_KEY', 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg'),
        eventsKey: getStringEnv('WOMPI_EVENTS_KEY', 'stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N'),
        integrityKey: getStringEnv('WOMPI_INTEGRITY_KEY', 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp')
    }
};

module.exports = config;