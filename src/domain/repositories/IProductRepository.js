class IProductRepository {
    async getById(id) {
        throw new Error('Method not implemented');
    }

    async create(product) {
        throw new Error('Method not implemented');
    }

    async update(id, product) {
        throw new Error('Method not implemented');
    }

    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IProductRepository;