class IDeliveryRepository {
    async save(delivery) {
        throw new Error('Método no implementado');
    }

    async getByTransactionId(transactionId) {
        throw new Error('Método no implementado');
    }
}

module.exports = IDeliveryRepository;