const { v4: uuidv4 } = require('uuid');

class Product {
    constructor(data) {
        this.validateData(data);
        
        this.id = data.id;
        this.name = data.name;
        this.description = data.description || '';
        this.price = data.price;
        this.stock = data.stock;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    validateData(data) {
        if (!data.name) {
            throw new Error('El nombre es requerido');
        }

        if (data.name.length > 100) {
            throw new Error('El nombre no puede exceder los 100 caracteres');
        }

        if (data.description && data.description.length > 500) {
            throw new Error('La descripción no puede exceder los 500 caracteres');
        }

        if (!data.price || data.price <= 0) {
            throw new Error('El precio debe ser mayor a 0');
        }

        if (typeof data.stock !== 'number' || data.stock < 0) {
            throw new Error('El stock no puede ser negativo');
        }
    }

    updateStock(newStock) {
        if (newStock < 0) {
            throw new Error('El stock no puede ser negativo');
        }
        this.stock = newStock;
        this.updatedAt = new Date();
    }

    hasStock(quantity) {
        return this.stock >= quantity;
    }

    calculateTotal(quantity) {
        if (quantity <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }
        return this.price * quantity;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: this.stock,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Product;