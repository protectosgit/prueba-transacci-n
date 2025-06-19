const Result = require('../../utils/Result');

class ProcessWebhookUseCase {
    constructor(transactionRepository, productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    async execute(webhookData) {
        try {
            console.log('📥 Procesando webhook de Wompi:', JSON.stringify(webhookData, null, 2));

            // Verificar que sea un evento de transacción
            if (!webhookData.event || !webhookData.data || !webhookData.data.transaction) {
                console.warn('⚠️ Webhook no contiene datos de transacción válidos');
                return Result.failure('Webhook no contiene datos de transacción válidos');
            }

            const transaction = webhookData.data.transaction;
            const wompiTransactionId = transaction.id;
            const newStatus = this.mapWompiStatusToInternal(transaction.status);

            console.log(`🔍 Buscando transacción con Wompi ID: ${wompiTransactionId}`);

            // Buscar la transacción en nuestra base de datos
            let ourTransaction = await this.transactionRepository.findByWompiTransactionId(wompiTransactionId);

            if (!ourTransaction) {
                // Si no la encontramos por wompiTransactionId, intentar por reference
                const reference = transaction.reference;
                if (reference) {
                    console.log(`🔍 Buscando por referencia: ${reference}`);
                    ourTransaction = await this.transactionRepository.findByReference(reference);
                }
            }

            if (!ourTransaction) {
                console.log(`🔄 Transacción no encontrada, creando nueva para Wompi ID: ${wompiTransactionId}`);
                
                // Crear nueva transacción desde el webhook
                const newTransactionData = {
                    reference: transaction.reference || wompiTransactionId,
                    amount: transaction.amount_in_cents / 100, // Convertir centavos a pesos
                    status: this.mapWompiStatusToInternal(transaction.status),
                    paymentMethod: 'credit_card',
                    paymentToken: wompiTransactionId,
                    wompiTransactionId: wompiTransactionId,
                    wompiStatus: transaction.status,
                    wompiResponse: JSON.stringify(webhookData),
                    customerId: 1, // Por ahora usar cliente fijo, se puede mejorar
                    productId: 1,  // Por ahora usar producto fijo, se puede mejorar
                    failureReason: transaction.status_message || null
                };

                console.log('📝 Creando nueva transacción:', newTransactionData);
                
                try {
                    ourTransaction = await this.transactionRepository.save(newTransactionData);
                    console.log(`✅ Transacción creada desde webhook: ID ${ourTransaction.id}`);
                } catch (createError) {
                    console.error('❌ Error creando transacción desde webhook:', createError);
                    return Result.failure(`Error creando transacción: ${createError.message}`);
                }
            }

            console.log(`✅ Transacción encontrada ID: ${ourTransaction.id}, Estado actual: ${ourTransaction.status}`);

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

            console.log(`🔄 Estado actualizado de ${previousStatus} a ${newStatus}`);

            // Manejar cambios de inventario
            await this.handleStockChanges(ourTransaction, previousStatus, newStatus);

            return Result.success({
                transactionId: ourTransaction.id,
                previousStatus,
                newStatus,
                wompiTransactionId
            });

        } catch (error) {
            console.error('❌ Error procesando webhook:', error);
            return Result.failure(`Error procesando webhook: ${error.message}`);
        }
    }

    async handleStockChanges(transaction, previousStatus, newStatus) {
        try {
            // Si el pago se aprueba, reducir stock
            if (newStatus === 'APPROVED' && previousStatus !== 'APPROVED') {
                console.log(`📦 Reduciendo stock para producto ID: ${transaction.productId}`);
                await this.productRepository.updateStock(transaction.productId, -1);
                console.log('✅ Stock reducido exitosamente');
            }

            // Si un pago previamente aprobado se rechaza, restaurar stock
            if (previousStatus === 'APPROVED' && ['FAILED', 'DECLINED', 'REJECTED'].includes(newStatus)) {
                console.log(`📦 Restaurando stock para producto ID: ${transaction.productId}`);
                await this.productRepository.updateStock(transaction.productId, 1);
                console.log('✅ Stock restaurado exitosamente');
            }

        } catch (error) {
            console.error('❌ Error manejando cambios de stock:', error);
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