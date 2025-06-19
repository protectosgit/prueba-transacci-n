const Result = require('../../utils/Result');

class ProcessPaymentUseCase {
    constructor(
        transactionRepository,
        productRepository,
        paymentGateway
    ) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.paymentGateway = paymentGateway;
    }

    async execute(paymentData) {
        try {
    
            
            // Validar datos de entrada
            this.validatePaymentData(paymentData);


            // Obtener producto y verificar stock

            const product = await this.productRepository.findById(paymentData.productId);
            if (!product) {

                return Result.fail('Producto no encontrado');
            }


            if (!product.hasStock || !product.hasStock(1)) {

                return Result.fail('Stock insuficiente');
            }


            // Crear transacción inicial

            const transaction = await this.transactionRepository.save({
                customerId: paymentData.customerId,
                productId: paymentData.productId,
                amount: paymentData.amount,
                status: 'PENDING',
                paymentMethod: paymentData.paymentMethod,
                paymentToken: paymentData.paymentToken
            });


            try {
                // Procesar pago
    
                const paymentResult = await this.paymentGateway.processPayment({
                    amount: paymentData.amount,
                    token: paymentData.paymentToken,
                    transactionId: transaction.id
                });
    

                if (paymentResult.success) {
                    // Actualizar stock
    
                    product.updateStock(product.stock - 1);
                    await this.productRepository.update(product);
    

                    // Actualizar transacción como completada
    
                    await this.transactionRepository.update({
                        ...transaction,
                        status: 'COMPLETED'
                    });

                    return Result.ok({
                        success: true,
                        transactionId: transaction.id,
                        message: 'Pago procesado exitosamente'
                    });
                } else {
                    // Actualizar transacción como fallida
    
                    await this.transactionRepository.update({
                        ...transaction,
                        status: 'FAILED'
                    });

                    return Result.fail(paymentResult.message);
                }
            } catch (error) {
                console.error('Error en el procesamiento del pago:', error);
                // Actualizar transacción como fallida en caso de error
    
                await this.transactionRepository.update({
                    ...transaction,
                    status: 'FAILED'
                });

                return Result.fail(`Error procesando el pago: ${error.message}`);
            }
        } catch (error) {
            console.error('Error en execute:', error);
            return Result.fail(error.message);
        }
    }

    validatePaymentData(paymentData) {

        
        if (!paymentData.productId) {
            throw new Error('ID de producto inválido');
        }

        if (!paymentData.customerId) {
            throw new Error('ID de cliente inválido');
        }

        if (!paymentData.amount || paymentData.amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }

        if (!paymentData.paymentMethod) {
            throw new Error('Método de pago inválido');
        }

        if (!paymentData.paymentToken) {
            throw new Error('Token de pago inválido');
        }
        

    }
}

module.exports = ProcessPaymentUseCase;