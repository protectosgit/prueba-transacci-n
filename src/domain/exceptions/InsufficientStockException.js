class InsufficientStockException extends Error {
    constructor(message = 'Stock insuficiente') {
        super(message);
        this.name = 'InsufficientStockException';
    }
}

module.exports = InsufficientStockException;