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

    // Crear transacción previa al pago (NUEVO)
    router.post('/create-transaction', (req, res) => paymentController.createTransaction(req, res));

    // Generar firma de integridad para Wompi (ESTE SÍ FUNCIONA)
    router.post('/integrity', generateIntegritySignature);

    // Endpoint para actualizar estado de transacción (para testing)
    router.post('/:id/update-status', (req, res) => paymentController.updateTransactionStatus(req, res));

    // Endpoint para verificar estado real en Wompi
    router.get('/:id/check-wompi', (req, res) => paymentController.checkWompiStatus(req, res));

    return router;
}; 