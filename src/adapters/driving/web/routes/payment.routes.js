const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { generateIntegritySignature } = PaymentController;

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Procesar pago (DESHABILITADO)
 *     description: ⚠️ Este endpoint está deshabilitado. Usar el formulario directo de Wompi con /api/payments/integrity
 *     tags: [Payments]
 *     deprecated: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number, example: 25000 }
 *               currency: { type: string, example: "COP" }
 *               reference: { type: string, example: "ORDER-001" }
 *     responses:
 *       400:
 *         description: Endpoint deshabilitado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "❌ Endpoint deshabilitado. Usar formulario directo de Wompi con /api/payments/integrity"
 */

/**
 * @swagger
 * /api/payments/integrity:
 *   post:
 *     summary: Generar firma de integridad para Wompi
 *     description: |
 *       Genera la firma de integridad SHA256 requerida por Wompi para validar transacciones.
 *       Esta firma se debe usar en el formulario de checkout de Wompi.
 *       
 *       **Fórmula de la firma:**
 *       `SHA256(reference + amount_in_cents + currency + integrity_key)`
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentIntegrity'
 *           examples:
 *             pequeña_compra:
 *               summary: Compra pequeña
 *               description: Ejemplo de un producto básico
 *               value:
 *                 reference: "ORDER-001-2025"
 *                 amount_in_cents: 2500000
 *                 currency: "COP"
 *             compra_grande:
 *               summary: Compra costosa
 *               description: Ejemplo de un producto de alto valor
 *               value:
 *                 reference: "ORDER-PREMIUM-002"
 *                 amount_in_cents: 450000000
 *                 currency: "COP"
 *     responses:
 *       200:
 *         description: Firma de integridad generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentIntegrityResponse'
 *             examples:
 *               compra_exitosa:
 *                 summary: Respuesta exitosa
 *                 value:
 *                   integrity: "cb895675de564d1845362e3caccb721f40deb68dda8b8c275b047510b06dde3b"
 *                   reference: "ORDER-001-2025"
 *                   amount_in_cents: 2500000
 *                   currency: "COP"
 *       400:
 *         description: Parámetros faltantes o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               parametros_faltantes:
 *                 summary: Parámetros requeridos faltantes
 *                 value:
 *                   error: "Parámetros requeridos: reference, amount_in_cents, currency"
 *               moneda_invalida:
 *                 summary: Moneda no soportada
 *                 value:
 *                   error: "Currency debe ser COP o USD"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Obtener estado de un pago
 *     description: Consulta el estado actual de una transacción usando su ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la transacción
 *         schema:
 *           type: string
 *         example: "txn_12345"
 *     responses:
 *       200:
 *         description: Estado del pago obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id: { type: string, example: "txn_12345" }
 *                         status: { type: string, enum: ["PENDING", "APPROVED", "DECLINED", "ERROR"], example: "APPROVED" }
 *                         amount: { type: number, example: 25000 }
 *                         currency: { type: string, example: "COP" }
 *                         reference: { type: string, example: "ORDER-001" }
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook de notificaciones de Wompi
 *     description: |
 *       Endpoint para recibir notificaciones automáticas de Wompi sobre cambios de estado en las transacciones.
 *       
 *       **⚠️ Este endpoint es usado internamente por Wompi y no debe ser llamado manualmente.**
 *       
 *       Se debe configurar en el dashboard de Wompi apuntando a:
 *       `https://back-pasarela.onrender.com/api/payments/webhook`
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event: { type: string, example: "transaction.updated" }
 *               data: 
 *                 type: object
 *                 properties:
 *                   transaction:
 *                     type: object
 *                     properties:
 *                       id: { type: string, example: "25475-1635177069-28787" }
 *                       status: { type: string, example: "APPROVED" }
 *                       reference: { type: string, example: "ORDER-001" }
 *     responses:
 *       200:
 *         description: Webhook procesado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean, example: true }
 *       400:
 *         description: Datos del webhook inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/create-transaction:
 *   post:
 *     summary: Crear transacción previa al pago
 *     description: Crea una transacción en la base de datos antes de procesar el pago con Wompi
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reference, amount, currency, customer, delivery, cartItems]
 *             properties:
 *               reference: { type: string, example: "ORDER-001-2025" }
 *               amount: { type: number, example: 25000 }
 *               currency: { type: string, example: "COP" }
 *               customer:
 *                 type: object
 *                 properties:
 *                   name: { type: string, example: "Juan Pérez" }
 *                   email: { type: string, example: "juan@email.com" }
 *                   phone: { type: string, example: "+573001234567" }
 *               delivery:
 *                 type: object
 *                 properties:
 *                   address: { type: string, example: "Calle 123 #45-67" }
 *                   city: { type: string, example: "Bogotá" }
 *               cartItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: integer, example: 1 }
 *                     quantity: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

    // Configurar webhook de Wompi
    router.post('/setup-webhook', (req, res) => paymentController.setupWebhook(req, res));

    return router;
}; 