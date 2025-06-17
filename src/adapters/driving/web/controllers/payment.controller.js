const CreatePaymentDTO = require('../../../../application/dtos/CreatePaymentDTO');

class PaymentController {
    constructor(processPaymentUseCase) {
        this.processPaymentUseCase = processPaymentUseCase;
    }

    async processPayment(req, res) {
        try {
            console.log('Procesando pago con datos:', JSON.stringify(req.body, null, 2));
            const result = await this.processPaymentUseCase.execute(req.body);
            console.log('Resultado del pago:', JSON.stringify(result, null, 2));
            res.status(200).json(result);
        } catch (error) {
            console.error('Error en processPayment:', error);
            let statusCode = 500;
            let errorMessage = 'Error interno del servidor';
            let errorDetails = error.message;

            if (error.message.includes('inválido') || 
                error.message === 'Stock insuficiente' ||
                error.message.includes('debe ser mayor')) {
                statusCode = 400;
                errorMessage = error.message;
            } else if (error.message === 'Producto no encontrado') {
                statusCode = 404;
                errorMessage = error.message;
            } else if (error.message.includes('Error procesando el pago')) {
                statusCode = 502;
                errorMessage = error.message;
            }

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
                details: errorDetails
            });
        }
    }
}

module.exports = PaymentController;