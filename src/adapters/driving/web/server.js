const express = require('express');
const cors = require('cors');
const config = require('../../../config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../../../config/swagger');

class Server {
    constructor(productRoutes, paymentRoutes) {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes(productRoutes, paymentRoutes);
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Configuración dinámica de CORS basada en variables de entorno
        const corsOptions = {
            origin: (origin, callback) => {
                // Permitir requests sin origin (aplicaciones móviles, Postman, etc.)
                if (!origin) {
                    return callback(null, true);
                }
                
                // En desarrollo, ser más permisivo con localhost
                if (config.nodeEnv !== 'production') {
                    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                        return callback(null, true);
                    }
                }
                
                // Verificar si el origin está en la lista de allowed origins
                if (config.cors.allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    if (config.nodeEnv === 'production') {
                        callback(new Error(`Origin ${origin} no permitido por CORS`));
                    } else {
                        callback(null, true);
                    }
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: [
                'Origin', 
                'X-Requested-With', 
                'Content-Type', 
                'Accept', 
                'Authorization',
                'Cache-Control',
                'X-Forwarded-For',
                'Access-Control-Allow-Origin',
                'ngrok-skip-browser-warning',
                'sec-ch-ua',
                'sec-ch-ua-mobile',
                'sec-ch-ua-platform'
            ],
            credentials: config.cors.allowCredentials,
            optionsSuccessStatus: 200,
            preflightContinue: false,
            maxAge: config.cors.maxAge
        };
        
        this.app.use(cors(corsOptions));
        
        // Middleware adicional para headers explícitos
        this.app.use((req, res, next) => {
            const origin = req.headers.origin;
            
            // Configurar headers dinámicamente
            if (config.nodeEnv !== 'production') {
                // En desarrollo, ser más permisivo
                res.header('Access-Control-Allow-Origin', origin || '*');
            } else {
                // En producción, verificar lista específica
                if (config.cors.allowedOrigins.includes(origin)) {
                    res.header('Access-Control-Allow-Origin', origin);
                }
            }
            
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Forwarded-For, ngrok-skip-browser-warning, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform');
            res.header('Access-Control-Allow-Credentials', config.cors.allowCredentials.toString());
            res.header('Access-Control-Max-Age', config.cors.maxAge.toString());
            
            // Manejar preflight requests
            if (req.method === 'OPTIONS') {
                res.status(200).end();
                return;
            }
            next();
        });
        
        // Middleware de logging deshabilitado para producción
        
        this.app.use(express.json());
        
        // Configuración CORS cargada silenciosamente
    }

    setupRoutes(productRoutes, paymentRoutes) {
        // Ruta principal
        this.app.get('/', (req, res) => {
            res.json({ 
                message: 'API de Procesamiento de Pagos',
                version: '1.0.0',
                docs: '/api-docs',
                endpoints: {
                    products: '/api/products',
                    payments: '/api/payments'
                }
            });
        });

        // Swagger UI Documentation
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
            explorer: true,
            customCss: `
                .swagger-ui .topbar { display: none; }
                .swagger-ui .info .title { color: #3b82f6; }
                .swagger-ui .scheme-container { background: #f8fafc; }
            `,
            customSiteTitle: "Payment Processing API - Documentación"
        }));

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: config.nodeEnv
            });
        });

        // API Routes
        this.app.use('/api/products', productRoutes);
        this.app.use('/api/payments', paymentRoutes);

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Ruta no encontrada',
                availableEndpoints: {
                    docs: '/api-docs',
                    health: '/health',
                    products: '/api/products',
                    payments: '/api/payments'
                }
            });
        });
    }

    setupErrorHandling() {
        // Error handler global
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: err.message
            });
        });
    }

    getApp() {
        return this.app;
    }
}

module.exports = Server;