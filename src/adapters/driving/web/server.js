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
        this.app.use(cors());
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