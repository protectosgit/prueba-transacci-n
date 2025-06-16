class IPaymentGateway {
    async processPayment(paymentDetails) {
        throw new Error('Método no implementado');
    }

    async getTransactionStatus(wompiTransactionId) {
        throw new Error('Método no implementado');
    }
}

module.exports = IPaymentGateway;