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
            const result = await this.processPaymentUseCase.execute(req.body);
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

            // Calcular el amount desde cartItems si no se proporciona
            let calculatedAmount = amount;
            if (!calculatedAmount && cartItems && cartItems.length > 0) {
                calculatedAmount = cartItems.reduce((total, item) => {
                    const itemPrice = parseFloat(item.product?.price || 0);
                    const quantity = parseInt(item.quantity || 1);
                    return total + (itemPrice * quantity);
                }, 0);
            }

            // Si aún no hay amount, buscar el primer producto en cartItems
            if (!calculatedAmount && cartItems && cartItems.length > 0) {
                const firstProduct = cartItems[0].product;
                if (firstProduct && firstProduct.price) {
                    calculatedAmount = parseFloat(firstProduct.price);
                }
            }

            // Si sigue sin amount, usar 0 como último recurso
            if (!calculatedAmount) {
                calculatedAmount = 0;
            }

            // Valores por defecto para transacciones desde retorno de Wompi
            const transactionData = {
                reference,
                amount: calculatedAmount,
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

            // Intentar encontrar la transacción directamente en el repositorio
            const transaction = await this.transactionRepository.findByReference(id);

            if (transaction) {
                // Si la transacción existe, devolverla con todos sus datos
                return res.json({
                    success: true,
                    data: {
                        id: transaction.id,
                        reference: transaction.reference,
                        amount: transaction.amount,
                        status: transaction.status,
                        paymentMethod: transaction.paymentMethod,
                        paymentToken: transaction.paymentToken,
                        wompiTransactionId: transaction.wompiTransactionId,
                        wompiStatus: transaction.wompiStatus,
                        customer: transaction.customer,
                        product: transaction.product,
                        cartItems: transaction.cartItems || [],
                        deliveryInfo: transaction.deliveryInfo,
                        totalItems: transaction.totalItems || (transaction.cartItems ? transaction.cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0),
                        createdAt: transaction.createdAt,
                        updatedAt: transaction.updatedAt,
                        metadata: {
                            hasMultipleProducts: transaction.cartItems && transaction.cartItems.length > 1,
                            hasDeliveryInfo: !!transaction.deliveryInfo,
                            dataSource: 'transaction_record'
                        }
                    }
                });
            }

            // Si no existe, usar el caso de uso original
            const result = await this.getPaymentStatusUseCase.execute(id);

            if (result.isSuccess) {
                return res.json({
                    success: true,
                    data: result.value
                });
            } else {
                // Si la transacción no existe, intentar crearla desde el webhook
                if (result.error === 'Transacción no encontrada') {
                    
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
            if (!this.processWebhookUseCase) {
                return res.status(200).json({
                    success: false,
                    message: 'Webhook recibido pero no procesado (servicio no disponible)'
                });
            }

            const result = await this.processWebhookUseCase.execute(req.body);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Webhook procesado exitosamente',
                    data: result.data
                });
            } else {
                return res.status(200).json({
                    success: false,
                    message: 'Webhook recibido pero con errores en el procesamiento',
                    error: result.error
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Error interno procesando webhook',
                message: error.message
            });
        }
    }

    async setupWebhook(req, res) {
        try {
            if (!this.wompiAdapter) {
                return res.status(500).json({
                    success: false,
                    message: 'Adaptador de Wompi no disponible'
                });
            }

            const result = await this.wompiAdapter.setupWebhook();

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    webhookId: result.webhookId
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Error configurando webhook',
                message: error.message
            });
        }
    }

    // Método para actualizar estado de transacción (testing/simulación)
    async updateTransactionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status = 'COMPLETED' } = req.body;
            
    

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
                        
                        for (const item of transaction.cartItems) {
                            const productId = item.product?.id || item.productId;
                            const quantity = item.quantity || 1;
                            
                            if (productId) {
                                const product = await this.productRepository.findById(productId);
                                if (product && product.stock >= quantity) {
                                    const newStock = product.stock - quantity;
                                    await this.productRepository.updateStock(productId, newStock);
                                }
                            }
                        }
                    } else {
                        // Fallback: actualizar stock del producto individual (modo legacy)
                        const product = await this.productRepository.findById(transaction.productId);
                        if (product && product.stock > 0) {
                            await this.productRepository.updateStock(product.id, product.stock - 1);
                        }
                    }
                } catch (stockError) {
                    // Error actualizando stock (silenciado)
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

    // Método para consultar estado directamente en Wompi
    async checkWompiStatus(req, res) {
        try {
            const { id } = req.params;
            
            if (!this.wompiAdapter) {
                return res.status(500).json({
                    success: false,
                    message: 'Adaptador de Wompi no disponible'
                });
            }

            // Consultar directamente en Wompi API (usar staging para pruebas)
            const wompiResponse = await fetch(`https://production.wompi.co/v1/transactions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY_STAGING}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!wompiResponse.ok) {
                return res.status(404).json({
                    success: false,
                    message: 'Transacción no encontrada en Wompi'
                });
            }

            const wompiData = await wompiResponse.json();

            if (wompiData.data) {
                // Intentar encontrar nuestra transacción por referencia
                let ourTransaction = await this.transactionRepository.findByReference(wompiData.data.reference);
                
                if (!ourTransaction) {
                    // Si no la encontramos, crearla usando el webhook
                    const webhookData = {
                        event: 'transaction.updated',
                        data: {
                            transaction: wompiData.data
                        }
                    };

                    const webhookResult = await this.processWebhookUseCase.execute(webhookData);
                    
                    if (webhookResult.success) {
                        ourTransaction = await this.transactionRepository.findByReference(wompiData.data.reference);
                    }
                }

                return res.status(200).json({
                    success: true,
                    data: wompiData.data,
                    ourTransaction: ourTransaction
                });
            }

            return res.status(404).json({
                success: false,
                message: 'Datos de transacción no válidos'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Error consultando estado en Wompi',
                message: error.message
            });
        }
    }

    // Método auxiliar para actualizar stock de productos
    async updateProductStock(transaction) {
        try {
            if (transaction.cartItems && Array.isArray(transaction.cartItems)) {
                
                for (const item of transaction.cartItems) {
                    const productId = item.product?.id || item.productId;
                    const quantity = item.quantity || 1;
                    
                    if (productId) {
                        const product = await this.productRepository.findById(productId);
                                            if (product && product.stock >= quantity) {
                        const newStock = product.stock - quantity;
                        await this.productRepository.updateStock(productId, newStock);
                        }
                    }
                }
            } else {
                // Fallback: actualizar stock del producto individual
                const product = await this.productRepository.findById(transaction.productId);
                if (product && product.stock > 0) {
                    await this.productRepository.updateStock(product.id, product.stock - 1);
                }
            }
        } catch (stockError) {
            // Error actualizando stock (silenciado)
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