class ITransactionRepository {
    async create(transaction) {
        throw new Error('Método no implementado');
    }

    async getById(id) {
        throw new Error('Método no implementado');
    }

    async update(id, transaction) {
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