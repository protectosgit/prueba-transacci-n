const express = require('express');
const cors = require('cors');

class Server {
    constructor(productRoutes, paymentRoutes) {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes(productRoutes, paymentRoutes);
        this.setupErrorHandling();
    }

    setupMiddleware() {
        const corsOptions = {
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                
                const allowedOrigins = [
                    'http://localhost:3000',
                    'http://localhost:3001', 
                    'http://localhost:5173',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173',
                    'https://main.d2dqy7vl9c624.amplifyapp.com',
                    'https://main.d10nqda7yg14nv.amplifyapp.com'
                ];
                
                if (process.env.NODE_ENV !== 'production') {
                    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                        return callback(null, true);
                    }
                }
                
                if (allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    if (process.env.NODE_ENV === 'production') {
                        callback(new Error('No permitido por CORS'));
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
                'Access-Control-Allow-Origin'
            ],
            credentials: false,
            optionsSuccessStatus: 200,
            preflightContinue: false
        };
        
        this.app.use(cors(corsOptions));
        
        this.app.use((req, res, next) => {
            const origin = req.headers.origin;
            
            if (process.env.NODE_ENV !== 'production') {
                res.header('Access-Control-Allow-Origin', origin || '*');
            } else {
                const allowedOrigins = [
                    'https://main.d2dqy7vl9c624.amplifyapp.com',
                    'https://main.d10nqda7yg14nv.amplifyapp.com'
                ];
                if (allowedOrigins.includes(origin)) {
                    res.header('Access-Control-Allow-Origin', origin);
                }
            }
            
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Forwarded-For');
            res.header('Access-Control-Allow-Credentials', 'false');
            
            if (req.method === 'OPTIONS') {
                res.status(200).end();
                return;
            }
            next();
        });
        
        if (process.env.NODE_ENV !== 'production') {
            this.app.use((req, res, next) => {
                console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
                next();
            });
        }
        
        this.app.use(express.json());
    }

    setupRoutes(productRoutes, paymentRoutes) {
        this.app.get('/', (req, res) => {
            res.json({ message: 'API de Procesamiento de Pagos' });
        });

        this.app.use('/api/products', productRoutes);
        this.app.use('/api/payments', paymentRoutes);

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Ruta no encontrada'
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