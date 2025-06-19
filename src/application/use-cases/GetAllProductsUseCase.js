const Result = require('../../utils/Result');

class GetAllProductsUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute() {
        try {
            const products = await this.productRepository.findAll();
            return Result.ok(products);
        } catch (error) {
            return Result.fail(`Error al obtener los productos: ${error.message}`);
        }
    }
}

module.exports = GetAllProductsUseCase; 