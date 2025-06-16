class IProductRepository {
    async getById(productId) {
        throw new Error('Método no implementado');
    }

    async update(product) {
        throw new Error('Método no implementado');
    }
}

module.exports = IProductRepository;