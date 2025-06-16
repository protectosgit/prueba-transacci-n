class PaymentResultDTO {
    constructor(transactionId, status, message, productNewStock, wompiTransactionId) {
        this.transactionId = transactionId;
        this.status = status;
        this.message = message;
        this.productNewStock = productNewStock;
        this.wompiTransactionId = wompiTransactionId;
    }
}

module.exports = PaymentResultDTO;