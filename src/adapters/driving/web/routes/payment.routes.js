const express = require('express');
const router = express.Router();

module.exports = (paymentController) => {
    // Procesar un nuevo pago
    router.post('/', (req, res) => paymentController.processPayment(req, res));
    
    // Obtener el estado de un pago
    router.get('/:id', (req, res) => paymentController.getPaymentStatus(req, res));
    
    // Webhook para actualizaciones de Wompi
    router.post('/webhook', (req, res) => paymentController.handleWebhook(req, res));

    return router;
}; 