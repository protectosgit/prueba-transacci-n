const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { generateIntegritySignature } = PaymentController;

module.exports = (paymentController) => {
    // DESHABILITADO: Este endpoint usa la API de transacciones que requiere firma en JSON
    // router.post('/', (req, res) => paymentController.processPayment(req, res));
    
    // Endpoint para procesar pagos deshabilitado - usar formulario directo de Wompi
    router.post('/', (req, res) => {
        res.status(400).json({
            success: false,
            error: '❌ Endpoint deshabilitado. Usar formulario directo de Wompi con /api/payments/integrity',
            message: 'Este endpoint usa la API de transacciones que requiere firma en JSON. Usar WompiService en el frontend.'
        });
    });
    
    // Obtener el estado de un pago
    router.get('/:id', (req, res) => paymentController.getPaymentStatus(req, res));
    
    // Webhook para actualizaciones de Wompi
    router.post('/webhook', (req, res) => paymentController.handleWebhook(req, res));

    // Generar firma de integridad para Wompi (ESTE SÍ FUNCIONA)
    router.post('/integrity', generateIntegritySignature);

    return router;
}; 