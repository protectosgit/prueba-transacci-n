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
            console.log('Iniciando procesamiento de pago...');
            
            // Validar datos de entrada
            this.validatePaymentData(paymentData);
            console.log('Datos de pago validados');

            // Obtener producto y verificar stock
            console.log('Buscando producto con ID:', paymentData.productId);
            const product = await this.productRepository.findById(paymentData.productId);
            if (!product) {
                console.log('Producto no encontrado');
                return Result.fail('Producto no encontrado');
            }
            console.log('Producto encontrado:', JSON.stringify(product, null, 2));

            if (!product.hasStock || !product.hasStock(1)) {
                console.log('Stock insuficiente');
                return Result.fail('Stock insuficiente');
            }
            console.log('Stock verificado');

            // Crear transacción inicial
            console.log('Creando transacción...');
            const transaction = await this.transactionRepository.save({
                customerId: paymentData.customerId,
                productId: paymentData.productId,
                amount: paymentData.amount,
                status: 'PENDING',
                paymentMethod: paymentData.paymentMethod,
                paymentToken: paymentData.paymentToken
            });
            console.log('Transacción creada:', JSON.stringify(transaction, null, 2));

            try {
                // Procesar pago
                console.log('Procesando pago con gateway...');
                const paymentResult = await this.paymentGateway.processPayment({
                    amount: paymentData.amount,
                    token: paymentData.paymentToken,
                    transactionId: transaction.id
                });
                console.log('Resultado del gateway:', JSON.stringify(paymentResult, null, 2));

                if (paymentResult.success) {
                    // Actualizar stock
                    console.log('Actualizando stock del producto...');
                    product.updateStock(product.stock - 1);
                    await this.productRepository.update(product);
                    console.log('Stock actualizado');

                    // Actualizar transacción como completada
                    console.log('Actualizando estado de la transacción a COMPLETED...');
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
                    console.log('Actualizando estado de la transacción a FAILED...');
                    await this.transactionRepository.update({
                        ...transaction,
                        status: 'FAILED'
                    });

                    return Result.fail(paymentResult.message);
                }
            } catch (error) {
                console.error('Error en el procesamiento del pago:', error);
                // Actualizar transacción como fallida en caso de error
                console.log('Actualizando estado de la transacción a FAILED debido a error...');
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
        console.log('Validando datos de pago:', JSON.stringify(paymentData, null, 2));
        
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
        
        console.log('Datos de pago válidos');
    }
}

module.exports = ProcessPaymentUseCase;