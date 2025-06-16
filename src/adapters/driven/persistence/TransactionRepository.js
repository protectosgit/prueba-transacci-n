const ITransactionRepository = require('../../../domain/repositories/ITransactionRepository');
const Transaction = require('../../../domain/entities/Transaction');

class TransactionRepository extends ITransactionRepository {
    constructor(transactionModel) {
        super();
        this.transactionModel = transactionModel;
    }

    async save(transaction) {
        try {
            const savedTransaction = await this.transactionModel.create({
                id: transaction.id,
                productId: transaction.productId,
                customerId: transaction.customerId,
                deliveryInfo: transaction.deliveryInfo,
                amount: transaction.amount,
                baseFee: transaction.baseFee,
                deliveryFee: transaction.deliveryFee,
                totalAmount: transaction.totalAmount,
                status: transaction.status,
                transactionDate: transaction.transactionDate,
                wompiTransactionId: transaction.wompiTransactionId,
                wompiStatusMessage: transaction.wompiStatusMessage,
                wompiPaymentMethodType: transaction.wompiPaymentMethodType
            });

            return new Transaction({
                ...savedTransaction.toJSON(),
                id: savedTransaction.id
            });
        } catch (error) {
            throw new Error(`Error al guardar transacción: ${error.message}`);
        }
    }

    async getById(transactionId) {
        try {
            const transaction = await this.transactionModel.findByPk(transactionId);
            if (!transaction) return null;

            return new Transaction(transaction.toJSON());
        } catch (error) {
            throw new Error(`Error al obtener transacción: ${error.message}`);
        }
    }

    async updateStatus(transactionId, newStatus) {
        try {
            await this.transactionModel.update(
                { status: newStatus },
                { where: { id: transactionId } }
            );
        } catch (error) {
            throw new Error(`Error al actualizar estado de transacción: ${error.message}`);
        }
    }

    async updateWompiIdAndStatus(
        transactionId,
        wompiId,
        newStatus,
        wompiStatusMessage,
        wompiPaymentMethodType
    ) {
        try {
            await this.transactionModel.update(
                {
                    wompiTransactionId: wompiId,
                    status: newStatus,
                    wompiStatusMessage: wompiStatusMessage,
                    wompiPaymentMethodType: wompiPaymentMethodType
                },
                { where: { id: transactionId } }
            );
        } catch (error) {
            throw new Error(`Error al actualizar información de Wompi: ${error.message}`);
        }
    }
}

module.exports = TransactionRepository;