class IPaymentGateway {
    async processPayment(paymentData) {
        throw new Error('Method not implemented');
    }

    async getTransactionStatus(wompiTransactionId) {
        throw new Error('Método no implementado');
    }
}

module.exports = IPaymentGateway;