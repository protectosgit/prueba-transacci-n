const CreatePaymentDTO = require('../../../../application/dtos/CreatePaymentDTO');
const Result = require('../../../../utils/Result');

class PaymentController {
    constructor(processPaymentUseCase) {
        this.processPaymentUseCase = processPaymentUseCase;
    }

    async processPayment(req, res) {
        try {
            // Validar y crear DTO
            const paymentDTO = new CreatePaymentDTO(req.body);

            // Procesar el pago
            const result = await this.processPaymentUseCase.execute(paymentDTO);

            if (!result.isSuccess) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                data: result.value
            });
        } catch (error) {
            if (error.name === 'InsufficientStockException') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = PaymentController;