const { getSequelize } = require('../../../infrastructure/database/connection');
const { Op } = require('sequelize');

class TransactionRepository {
    constructor(model) {
        this.model = model;
    }

    async save(transaction) {
        try {
            const savedTransaction = await this.model.create(transaction);
            // Recargar la transacción con las asociaciones
            return await this.model.findOne({
                where: { id: savedTransaction.id },
                include: [
                    { association: 'customer' },
                    { association: 'product' }
                ]
            });
        } catch (error) {
            throw new Error(`Error al guardar la transacción: ${error.message}`);
        }
    }

    async update(transaction) {
        try {
            await this.model.update(transaction, {
                where: { id: transaction.id }
            });
            // Recargar la transacción con las asociaciones
            return await this.model.findOne({
                where: { id: transaction.id },
                include: [
                    { association: 'customer' },
                    { association: 'product' }
                ]
            });
        } catch (error) {
            throw new Error(`Error al actualizar la transacción: ${error.message}`);
        }
    }

    async updateStatus(id, status, additionalData = {}) {
        try {
            const updateData = { status, ...additionalData, updatedAt: new Date() };
            await this.model.update(updateData, {
                where: { id }
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error al actualizar estado de la transacción: ${error.message}`);
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

    async findByReference(reference) {
        try {
    
            
            // Buscar en todos los campos que podrían contener la referencia
            const transaction = await this.model.findOne({
                where: {
                    [Op.or]: [
                        { paymentToken: reference },
                        { reference: reference },
                        { wompiTransactionId: reference },
                        ...(isNaN(reference) ? [] : [{ id: parseInt(reference) }])
                    ]
                },
                include: [
                    { association: 'customer' },
                    { association: 'product' }
                ]
            });
            
    
            return transaction;
        } catch (error) {
            console.error('Error en findByReference:', error);
            throw new Error(`Error al buscar la transacción por referencia: ${error.message}`);
        }
    }

    async findByWompiTransactionId(wompiTransactionId) {
        try {
            const transaction = await this.model.findOne({
                where: { wompiTransactionId }
            });
            return transaction;
        } catch (error) {
            throw new Error(`Error al buscar por ID de Wompi: ${error.message}`);
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

    async findPendingTransactions() {
        try {
            const transactions = await this.model.findAll({
                where: { 
                    status: ['PENDING', 'PROCESSING']
                }
            });
            return transactions;
        } catch (error) {
            throw new Error(`Error al buscar transacciones pendientes: ${error.message}`);
        }
    }
}

module.exports = TransactionRepository;