const CreatePaymentDTO = require('../../../../application/dtos/CreatePaymentDTO');
const crypto = require('crypto');
const config = require('../../../../config');

class PaymentController {
    constructor(processPaymentUseCase, getPaymentStatusUseCase, processWebhookUseCase, createTransactionUseCase, transactionRepository, productRepository, wompiAdapter) {
        this.processPaymentUseCase = processPaymentUseCase;
        this.getPaymentStatusUseCase = getPaymentStatusUseCase;
        this.processWebhookUseCase = processWebhookUseCase;
        this.createTransactionUseCase = createTransactionUseCase;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.wompiAdapter = wompiAdapter;
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

    async createTransaction(req, res) {
        try {
            console.log('Creando transacción con datos completos:', JSON.stringify(req.body, null, 2));
            
            const { 
                reference, 
                amount,
                customer,
                delivery,
                cartItems,
                paymentMethod 
            } = req.body;

            // Validar parámetros requeridos mínimos
            if (!reference) {
                return res.status(400).json({
                    success: false,
                    error: 'Referencia es requerida'
                });
            }

            // Valores por defecto para transacciones desde retorno de Wompi
            const transactionData = {
                reference,
                amount: amount || '0',
                customerData: customer || { email: 'no-email@example.com' },
                deliveryData: delivery || null,
                cartItems: cartItems || [],
                paymentMethod: paymentMethod || 'CARD'
            };

            const result = await this.createTransactionUseCase.execute(transactionData);

            if (result.isSuccess) {
                return res.status(201).json({
                    success: true,
                    data: result.value
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en createTransaction:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getPaymentStatus(req, res) {
        try {
            const { id } = req.params;
            console.log('Consultando estado de pago para:', id);

            const result = await this.getPaymentStatusUseCase.execute(id);
            console.log('Resultado de getPaymentStatusUseCase:', result);

            if (result.isSuccess) {
                return res.json({
                    success: true,
                    data: result.value
                });
            } else {
                // Si la transacción no existe, intentar crearla desde el webhook
                if (result.error === 'Transacción no encontrada') {
                    console.log('Transacción no encontrada, intentando crear desde webhook...');
                    
                    // Obtener datos del webhook si existen
                    const webhookResult = await this.processWebhookUseCase.execute({
                        event: 'transaction.created',
                        data: {
                            transaction: {
                                id: id,
                                reference: id,
                                amount_in_cents: 0,
                                status: 'PENDING'
                            }
                        }
                    });

                    if (webhookResult.success) {
                        // Intentar obtener la transacción nuevamente
                        const retryResult = await this.getPaymentStatusUseCase.execute(id);
                        if (retryResult.isSuccess) {
                            return res.json({
                                success: true,
                                data: retryResult.value
                            });
                        }
                    }
                }

                // Si no se pudo crear o recuperar, devolver error
                return res.status(404).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error en getPaymentStatus:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async handleWebhook(req, res) {
        try {
            console.log('Webhook recibido de Wompi:', JSON.stringify(req.body, null, 2));
            console.log('Headers del webhook:', JSON.stringify(req.headers, null, 2));
            
            if (!this.processWebhookUseCase) {
                console.log('ProcessWebhookUseCase no está disponible');
                return res.status(200).json({
                    success: true,
                    message: 'Webhook recibido pero no procesado (servicio no disponible)'
                });
            }

            const result = await this.processWebhookUseCase.execute(req.body);
            
            if (result.success) {
                console.log('Webhook procesado exitosamente:', result.data);
                res.status(200).json({
                    success: true,
                    message: 'Webhook procesado exitosamente',
                    data: result.data
                });
            } else {
                console.log('Error procesando webhook:', result.error);
                // Aunque haya error en el procesamiento, respondemos 200 para que Wompi no reenvíe
                res.status(200).json({
                    success: false,
                    message: 'Webhook recibido pero con errores en el procesamiento',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Error manejando webhook:', error);
            // Respondemos 200 para evitar reintentos de Wompi
            res.status(200).json({
                success: false,
                error: 'Error interno procesando webhook',
                details: error.message
            });
        }
    }

    // Método para actualizar estado de transacción (testing/simulación)
    async updateTransactionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status = 'COMPLETED' } = req.body;
            
            console.log(`Actualizando estado de transacción ${id} a ${status}`);

            // Buscar la transacción por ID o referencia
            let transaction = null;
            if (!isNaN(id)) {
                transaction = await this.transactionRepository.findById(parseInt(id));
            }
            if (!transaction) {
                transaction = await this.transactionRepository.findByReference(id);
            }

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transacción no encontrada'
                });
            }

            // Actualizar el estado
            await this.transactionRepository.updateStatus(transaction.id, status);

            // Si se aprueba, actualizar el stock de los productos
            if (status === 'COMPLETED' || status === 'APPROVED') {
                try {
                    // Verificar si hay items en el carrito
                    if (transaction.cartItems && Array.isArray(transaction.cartItems)) {
                        console.log('📦 Actualizando stock para múltiples productos:', transaction.cartItems);
                        
                        for (const item of transaction.cartItems) {
                            const productId = item.product?.id || item.productId;
                            const quantity = item.quantity || 1;
                            
                            if (productId) {
                                const product = await this.productRepository.findById(productId);
                                if (product && product.stock >= quantity) {
                                    const newStock = product.stock - quantity;
                                    await this.productRepository.updateStock(productId, newStock);
                                    console.log(`✅ Stock actualizado para producto ${productId}: ${product.stock} -> ${newStock} (reducido en ${quantity})`);
                                } else {
                                    console.warn(`⚠️ Stock insuficiente para producto ${productId}. Stock disponible: ${product?.stock}, requerido: ${quantity}`);
                                }
                            }
                        }
                    } else {
                        // Fallback: actualizar stock del producto individual (modo legacy)
                        const product = await this.productRepository.findById(transaction.productId);
                        if (product && product.stock > 0) {
                            await this.productRepository.updateStock(product.id, product.stock - 1);
                            console.log(`✅ Stock actualizado para producto individual ${product.id}: ${product.stock} -> ${product.stock - 1}`);
                        }
                    }
                } catch (stockError) {
                    console.warn('❌ Error actualizando stock:', stockError);
                }
            }

            // Obtener la transacción actualizada
            const updatedTransaction = await this.transactionRepository.findById(transaction.id);

            return res.json({
                success: true,
                message: `Estado actualizado a ${status}. ${status === 'COMPLETED' ? 'Stock actualizado automáticamente.' : ''}`,
                data: {
                    id: updatedTransaction.id,
                    reference: updatedTransaction.reference,
                    status: updatedTransaction.status,
                    amount: updatedTransaction.amount,
                    updatedAt: updatedTransaction.updatedAt
                }
            });

        } catch (error) {
            console.error('Error actualizando estado de transacción:', error);
            return res.status(500).json({
                success: false,
                error: `Error actualizando estado: ${error.message}`
            });
        }
    }

    // Método para consultar estado real en Wompi y actualizar automáticamente
    async checkWompiStatus(req, res) {
        try {
            const { id } = req.params;
            console.log(`🔍 Verificando estado real en Wompi para: ${id}`);

            // Buscar la transacción por ID o referencia
            let transaction = null;
            if (!isNaN(id)) {
                transaction = await this.transactionRepository.findById(parseInt(id));
            }
            if (!transaction) {
                transaction = await this.transactionRepository.findByReference(id);
            }

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    error: 'Transacción no encontrada'
                });
            }

            // Si no hay wompiTransactionId, no podemos consultar Wompi
            if (!transaction.wompiTransactionId) {
                return res.json({
                    success: true,
                    message: 'No hay ID de Wompi para consultar',
                    shouldUpdate: false,
                    currentStatus: transaction.status
                });
            }

            try {
                // Consultar estado real en Wompi
                const wompiStatus = await this.wompiAdapter.getTransactionStatus(transaction.wompiTransactionId);
                console.log(`📊 Estado en Wompi: ${wompiStatus} | Estado local: ${transaction.status}`);

                // Mapear estados de Wompi a nuestros estados
                const statusMapping = {
                    'APPROVED': 'COMPLETED',
                    'DECLINED': 'FAILED',
                    'VOIDED': 'FAILED',
                    'ERROR': 'FAILED',
                    'PENDING': 'PENDING'
                };

                const newLocalStatus = statusMapping[wompiStatus] || 'PENDING';

                // Si el estado cambió, actualizar la transacción
                if (newLocalStatus !== transaction.status && newLocalStatus !== 'PENDING') {
                    console.log(`🔄 Actualizando estado de ${transaction.status} → ${newLocalStatus}`);

                    // Actualizar estado en la base de datos
                    await this.transactionRepository.updateStatus(transaction.id, newLocalStatus, {
                        wompiStatus: wompiStatus
                    });

                    // Si se aprobó, actualizar stock
                    if (newLocalStatus === 'COMPLETED') {
                        await this.updateProductStock(transaction);
                    }

                    return res.json({
                        success: true,
                        message: `Estado actualizado de ${transaction.status} a ${newLocalStatus} según Wompi`,
                        shouldUpdate: true,
                        previousStatus: transaction.status,
                        newStatus: newLocalStatus,
                        wompiStatus: wompiStatus
                    });
                } else {
                    return res.json({
                        success: true,
                        message: 'Estado sin cambios',
                        shouldUpdate: false,
                        currentStatus: transaction.status,
                        wompiStatus: wompiStatus
                    });
                }

            } catch (wompiError) {
                console.warn('⚠️ Error consultando Wompi:', wompiError.message);
                
                // Si Wompi no responde, simular aprobación después de cierto tiempo
                const transactionAge = new Date() - new Date(transaction.createdAt);
                const FIVE_MINUTES = 5 * 60 * 1000;

                if (transactionAge > FIVE_MINUTES && transaction.status === 'PENDING') {
                    console.log('⏰ Transacción antigua sin respuesta de Wompi, simulando aprobación...');
                    
                    await this.transactionRepository.updateStatus(transaction.id, 'COMPLETED', {
                        wompiStatus: 'SIMULATED_APPROVED'
                    });
                    
                    await this.updateProductStock(transaction);

                    return res.json({
                        success: true,
                        message: 'Pago simulado como aprobado (Wompi no disponible)',
                        shouldUpdate: true,
                        previousStatus: transaction.status,
                        newStatus: 'COMPLETED',
                        wompiStatus: 'SIMULATED_APPROVED'
                    });
                }

                return res.json({
                    success: false,
                    error: 'Error consultando estado en Wompi',
                    details: wompiError.message
                });
            }

        } catch (error) {
            console.error('Error verificando estado en Wompi:', error);
            return res.status(500).json({
                success: false,
                error: `Error interno: ${error.message}`
            });
        }
    }

    // Método auxiliar para actualizar stock de productos
    async updateProductStock(transaction) {
        try {
            if (transaction.cartItems && Array.isArray(transaction.cartItems)) {
                console.log('📦 Actualizando stock para múltiples productos:', transaction.cartItems);
                
                for (const item of transaction.cartItems) {
                    const productId = item.product?.id || item.productId;
                    const quantity = item.quantity || 1;
                    
                    if (productId) {
                        const product = await this.productRepository.findById(productId);
                        if (product && product.stock >= quantity) {
                            const newStock = product.stock - quantity;
                            await this.productRepository.updateStock(productId, newStock);
                            console.log(`✅ Stock actualizado para producto ${productId}: ${product.stock} → ${newStock} (reducido en ${quantity})`);
                        } else {
                            console.warn(`⚠️ Stock insuficiente para producto ${productId}. Stock disponible: ${product?.stock}, requerido: ${quantity}`);
                        }
                    }
                }
            } else {
                // Fallback: actualizar stock del producto individual
                const product = await this.productRepository.findById(transaction.productId);
                if (product && product.stock > 0) {
                    await this.productRepository.updateStock(product.id, product.stock - 1);
                    console.log(`✅ Stock actualizado para producto individual ${product.id}: ${product.stock} → ${product.stock - 1}`);
                }
            }
        } catch (stockError) {
            console.warn('❌ Error actualizando stock:', stockError);
        }
    }
}

// Generar firma de integridad para Wompi
const generateIntegritySignature = (req, res) => {
    try {
        const { reference, amount_in_cents, currency } = req.body;
        
        // Validar parámetros requeridos
        if (!reference || !amount_in_cents || !currency) {
            return res.status(400).json({
                error: 'Parámetros requeridos: reference, amount_in_cents, currency'
            });
        }

        // Crear cadena para firma según documentación Wompi
        const concatenatedString = `${reference}${amount_in_cents}${currency}${config.wompi.integrityKey}`;
        
        // Generar hash SHA256
        const integrity = crypto
            .createHash('sha256')
            .update(concatenatedString)
            .digest('hex');

        res.json({
            integrity,
            reference,
            amount_in_cents,
            currency
        });

    } catch (error) {
        console.error('Error generando firma de integridad:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

module.exports = PaymentController;
module.exports.generateIntegritySignature = generateIntegritySignature;