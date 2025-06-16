class ITransactionRepository {
    async save(transaction) {
        throw new Error('Método no implementado');
    }

    async getById(transactionId) {
        throw new Error('Método no implementado');
    }

    async updateStatus(transactionId, newStatus) {
        throw new Error('Método no implementado');
    }

    async updateWompiIdAndStatus(transactionId, wompiId, newStatus, wompiStatusMessage, wompiPaymentMethodType) {
        throw new Error('Método no implementado');
    }
}

module.exports = ITransactionRepository;