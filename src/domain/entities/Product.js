const { v4: uuidv4 } = require('uuid');

class Product {
    constructor(name, description, price, stock, id = uuidv4()) {
        this.id = id;
        this.name = name;
        this.description = description;
        this._setPrice(price);
        this._setStock(stock);
    }

    _setPrice(price) {
        if (price < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        this.price = price;
    }

    _setStock(stock) {
        if (stock < 0) {
            throw new Error('El stock no puede ser negativo');
        }
        this.stock = stock;
    }

    decreaseStock(quantity) {
        if (this.stock < quantity) {
            throw new Error('Stock insuficiente');
        }
        this.stock -= quantity;
    }

    increaseStock(quantity) {
        this.stock += quantity;
    }
}

module.exports = Product;