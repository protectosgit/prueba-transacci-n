class ITransactionRepository {
    async create(transaction) {
        throw new Error('Method not implemented');
    }

    async getById(id) {
        throw new Error('Method not implemented');
    }

    async update(id, transaction) {
        throw new Error('Method not implemented');
    }

    async updateStatus(transactionId, newStatus) {
        throw new Error('Método no implementado');
    }

    async updateWompiIdAndStatus(transactionId, wompiId, newStatus, wompiStatusMessage, wompiPaymentMethodType) {
        throw new Error('Método no implementado');
    }
}

module.exports = ITransactionRepository;