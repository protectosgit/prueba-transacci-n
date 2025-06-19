function getNumberEnv(key, defaultValue) {
    const value = process.env[key];
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

function getStringEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
}

function getBooleanEnv(key, defaultValue) {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
}

function getArrayEnv(key, defaultValue = []) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim());
}

const config = {
    nodeEnv: getStringEnv('NODE_ENV', 'development'),
    port: getNumberEnv('PORT', 3000),
    host: getStringEnv('HOST', '0.0.0.0'), // Permitir conexiones desde cualquier IP
    
    // Configuración de CORS
    cors: {
        allowedOrigins: getArrayEnv('CORS_ALLOWED_ORIGINS', [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'https://main.d10nqda7yg14nv.amplifyapp.com',
            'https://*.amplifyapp.com'
            
        ]),
        allowCredentials: getBooleanEnv('CORS_ALLOW_CREDENTIALS', false),
        maxAge: getNumberEnv('CORS_MAX_AGE', 86400)
    },
    
    // URLs del frontend
    frontend: {
        amplifyUrl: getStringEnv('FRONTEND_AMPLIFY_URL', 'https://main.d10nqda7yg14nv.amplifyapp.com'),
        devUrl: getStringEnv('FRONTEND_DEV_URL', 'http://localhost:3000'),
        prodUrl: getStringEnv('FRONTEND_PROD_URL', 'https://main.d10nqda7yg14nv.amplifyapp.com')
    },
    
    // Base de datos
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
        dialect: 'postgres',
        ssl: getBooleanEnv('DB_SSL', process.env.NODE_ENV === 'production')
    },
    
    // Configuración de Wompi
    wompi: {
        apiUrl: getStringEnv('WOMPI_API_URL', 
            process.env.NODE_ENV === 'production' 
                ? 'https://api.wompi.co/v1' 
                : 'https://sandbox.wompi.co/v1'
        ),
        publicKey: getStringEnv('WOMPI_PUBLIC_KEY', 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7'),
        privateKey: getStringEnv('WOMPI_PRIVATE_KEY', 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg'),
        eventsKey: getStringEnv('WOMPI_EVENTS_KEY', 'stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N'),
        integrityKey: getStringEnv('WOMPI_INTEGRITY_KEY', 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp')
    },
    
    // Configuración de logging y debugging
    logging: {
        level: getStringEnv('LOG_LEVEL', 'info'),
        enableSQL: getBooleanEnv('LOG_SQL', false),
        enableRequests: getBooleanEnv('LOG_REQUESTS', process.env.NODE_ENV !== 'production')
    },
    
    // Configuración de seguridad
    security: {
        rateLimitWindowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutos
        rateLimitMax: getNumberEnv('RATE_LIMIT_MAX', 100), // 100 requests por ventana
        enableHelmet: getBooleanEnv('ENABLE_HELMET', true)
    }
};

module.exports = config;