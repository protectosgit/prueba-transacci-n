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
        // Configuración de CORS para aceptar conexiones desde cualquier origen
        const corsOptions = {
            origin: '*', 
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: [
                'Origin', 
                'X-Requested-With', 
                'Content-Type', 
                'Accept', 
                'Authorization',
                'Cache-Control',
                'X-Forwarded-For'
            ],
            credentials: false,
            optionsSuccessStatus: 200 // Para soporte de navegadores legacy
        };
        
        this.app.use(cors(corsOptions));
        
        // Middleware adicional para headers de seguridad
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Forwarded-For');
            
            if (req.method === 'OPTIONS') {
                res.status(200).end();
                return;
            }
            next();
        });
        
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