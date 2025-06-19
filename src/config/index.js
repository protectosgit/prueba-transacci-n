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
    host: getStringEnv('HOST', '0.0.0.0'), // Permitir conexiones desde cualquier IP
    database: {
        // DATABASE_URL para Render (interno) y desarrollo (externo)
        url: getStringEnv('DATABASE_URL', 
            process.env.NODE_ENV === 'production' 
                ? 'postgresql://pasarela_db_user:GSR9FS8hyclcsCFxjeMkhEkD4LXIpOzc@dpg-d1a3ebqdbo4c73c3hat0-a/pasarela_db'
                : 'postgresql://pasarela_db_user:GSR9FS8hyclcsCFxjeMkhEkD4LXIpOzc@dpg-d1a3ebqdbo4c73c3hat0-a.oregon-postgres.render.com/pasarela_db'
        ),
        // Configuración individual (fallback)
        host: getStringEnv('DB_HOST', 'dpg-d1a3ebqdbo4c73c3hat0-a.oregon-postgres.render.com'),
        port: getNumberEnv('DB_PORT', 5432),
        name: getStringEnv('DB_NAME', 'pasarela_db'),
        user: getStringEnv('DB_USER', 'pasarela_db_user'),
        password: getStringEnv('DB_PASSWORD', 'GSR9FS8hyclcsCFxjeMkhEkD4LXIpOzc'),
        dialect: 'postgres'
    },
    wompi: {
        apiUrl: getStringEnv('WOMPI_API_URL', 'https://sandbox.wompi.co/v1'),
        // Llaves UAT/Staging oficiales proporcionadas (para desarrollo)
        publicKey: getStringEnv('WOMPI_PUBLIC_KEY', 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7'),
        privateKey: getStringEnv('WOMPI_PRIVATE_KEY', 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg'),
        eventsKey: getStringEnv('WOMPI_EVENTS_KEY', 'stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N'),
        integrityKey: getStringEnv('WOMPI_INTEGRITY_KEY', 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp')
    }
};

module.exports = config;