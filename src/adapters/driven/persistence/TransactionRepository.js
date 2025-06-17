const { models } = require('../../../infrastructure/database/connection');

class TransactionRepository {
    constructor(model) {
        this.model = model;
    }

    async save(transaction) {
        try {
            const savedTransaction = await this.model.create(transaction);
            return savedTransaction;
        } catch (error) {
            throw new Error(`Error al guardar la transacción: ${error.message}`);
        }
    }

    async update(transaction) {
        try {
            await this.model.update(transaction, {
                where: { id: transaction.id }
            });
            return transaction;
        } catch (error) {
            throw new Error(`Error al actualizar la transacción: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            const transaction = await this.model.findByPk(id);
            return transaction;
        } catch (error) {
            throw new Error(`Error al buscar la transacción: ${error.message}`);
        }
    }

    async findByCustomerId(customerId) {
        try {
            const transactions = await this.model.findAll({
                where: { customerId }
            });
            return transactions;
        } catch (error) {
            throw new Error(`Error al buscar transacciones del cliente: ${error.message}`);
        }
    }

    async findByStatus(status) {
        try {
            const transactions = await this.model.findAll({
                where: { status }
            });
            return transactions;
        } catch (error) {
            throw new Error(`Error al buscar transacciones por estado: ${error.message}`);
        }
    }
}

module.exports = TransactionRepository;