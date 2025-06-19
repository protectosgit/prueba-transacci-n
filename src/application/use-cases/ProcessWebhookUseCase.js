const Result = require('../../utils/Result');

class ProcessWebhookUseCase {
    constructor(transactionRepository, productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    async execute(webhookData) {
        try {
            // Verificar que sea un evento de transacción
            if (!webhookData.event || !webhookData.data || !webhookData.data.transaction) {
                return Result.failure('Webhook no contiene datos de transacción válidos');
            }

            const transaction = webhookData.data.transaction;
            const wompiTransactionId = transaction.id;
            const newStatus = this.mapWompiStatusToInternal(transaction.status);

            // Buscar la transacción en nuestra base de datos
            let ourTransaction = await this.transactionRepository.findByWompiTransactionId(wompiTransactionId);

            if (!ourTransaction) {
                // Si no la encontramos por wompiTransactionId, intentar por reference
                const reference = transaction.reference;
                if (reference) {
                    ourTransaction = await this.transactionRepository.findByReference(reference);
                }
            }

            if (!ourTransaction) {
                // NO crear transacciones automáticamente desde webhooks transaction.created
                // porque tienen datos vacíos (amount_in_cents: 0)
                if (webhookData.event === 'transaction.created') {
                    return Result.success({
                        message: 'Webhook transaction.created ignorado - esperando datos del frontend',
                        transactionId: null,
                        wompiTransactionId: wompiTransactionId
                    });
                }

                // Solo crear transacciones desde webhooks que no sean 'transaction.created'
                // y que tengan datos válidos
                if (transaction.amount_in_cents > 0) {
                    const newTransactionData = {
                        reference: transaction.reference || wompiTransactionId,
                        amount: transaction.amount_in_cents / 100,
                        status: this.mapWompiStatusToInternal(transaction.status),
                        paymentMethod: 'credit_card',
                        paymentToken: wompiTransactionId,
                        wompiTransactionId: wompiTransactionId,
                        wompiStatus: transaction.status,
                        wompiResponse: JSON.stringify(webhookData),
                        customerId: 1,
                        productId: 1,
                        failureReason: transaction.status_message || null
                    };
                    
                    try {
                        ourTransaction = await this.transactionRepository.save(newTransactionData);
                    } catch (createError) {
                        return Result.failure(`Error creando transacción: ${createError.message}`);
                    }
                } else {
                    // Webhook sin datos válidos, ignorar
                    return Result.success({
                        message: 'Webhook ignorado - datos insuficientes',
                        transactionId: null,
                        wompiTransactionId: wompiTransactionId
                    });
                }
            }

            const previousStatus = ourTransaction.status;

            // Actualizar la transacción
            const updateData = {
                status: newStatus,
                wompiTransactionId: wompiTransactionId,
                wompiStatus: transaction.status,
                wompiResponse: JSON.stringify(webhookData),
                failureReason: transaction.status_message || null
            };

            await this.transactionRepository.updateStatus(ourTransaction.id, updateData);

            // Manejar cambios de inventario
            await this.handleStockChanges(ourTransaction, previousStatus, newStatus);

            return Result.success({
                transactionId: ourTransaction.id,
                previousStatus,
                newStatus,
                wompiTransactionId
            });

        } catch (error) {
            return Result.failure(`Error procesando webhook: ${error.message}`);
        }
    }

    async handleStockChanges(transaction, previousStatus, newStatus) {
        try {
            // Si el pago se aprueba, reducir stock
            if (newStatus === 'APPROVED' && previousStatus !== 'APPROVED') {
                await this.productRepository.updateStock(transaction.productId, -1);
            }

            // Si un pago previamente aprobado se rechaza, restaurar stock
            if (previousStatus === 'APPROVED' && ['FAILED', 'DECLINED', 'REJECTED'].includes(newStatus)) {
                await this.productRepository.updateStock(transaction.productId, 1);
            }

        } catch (error) {
            // No fallar el webhook por errores de stock
        }
    }

    mapWompiStatusToInternal(wompiStatus) {
        const statusMap = {
            'APPROVED': 'APPROVED',
            'PENDING': 'PENDING',
            'DECLINED': 'DECLINED',
            'VOIDED': 'FAILED',
            'ERROR': 'FAILED',
            'FAILED': 'FAILED'
        };

        return statusMap[wompiStatus] || 'PENDING';
    }
}

module.exports = ProcessWebhookUseCase; 