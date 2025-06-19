class IProductRepository {
    async getById(id) {
        throw new Error('Metodo no implementado');
    }

    async create(product) {
        throw new Error('Metodo no implementado');
    }

    async update(id, product) {
        throw new Error('Metodo no implementado');
    }

    async delete(id) {
        throw new Error('Metodo no implementado');
    }

    async getAll() {
        throw new Error('Metodo no implementado');
    }
}

module.exports = IProductRepository;