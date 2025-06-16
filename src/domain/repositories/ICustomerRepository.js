class ICustomerRepository {
    async save(customer) {
        throw new Error('Método no implementado');
    }

    async getByEmail(email) {
        throw new Error('Método no implementado');
    }

    async getById(customerId) {
        throw new Error('Método no implementado');
    }
}

module.exports = ICustomerRepository;