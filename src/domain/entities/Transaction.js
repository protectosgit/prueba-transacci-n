const { v4: uuidv4 } = require('uuid');

class Transaction {
    constructor({
        productId,
        customerId,
        deliveryInfo,
        amount,
        baseFee,
        deliveryFee,
        id = uuidv4()
    }) {
        this.id = id;
        this.productId = productId;
        this.customerId = customerId;
        this.deliveryInfo = deliveryInfo;
        this.amount = amount;
        this.baseFee = baseFee;
        this.deliveryFee = deliveryFee;
        this.totalAmount = this._calculateTotalAmount();
        this.status = 'PENDING';
        this.transactionDate = new Date();
        this.wompiTransactionId = null;
        this.wompiStatusMessage = null;
        this.wompiPaymentMethodType = null;
    }

    _calculateTotalAmount() {
        return this.amount + this.baseFee + this.deliveryFee;
    }

    updateStatus(newStatus, wompiStatusMessage = null) {
        const validStatuses = ['PENDING', 'COMPLETED', 'FAILED'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Estado de transacción inválido');
        }
        this.status = newStatus;
        if (wompiStatusMessage) {
            this.wompiStatusMessage = wompiStatusMessage;
        }
    }

    assignWompiTransactionId(wompiTransactionId, paymentMethodType) {
        this.wompiTransactionId = wompiTransactionId;
        this.wompiPaymentMethodType = paymentMethodType;
    }
}

module.exports = Transaction;