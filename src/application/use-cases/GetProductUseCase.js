const Result = require('../../utils/Result');

class GetProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(id) {
        try {
            const product = await this.productRepository.getById(id);
            if (!product) {
                return Result.fail('Producto no encontrado');
            }
            return Result.ok(product);
        } catch (error) {
            return Result.fail(error.message);
        }
    }
}

module.exports = GetProductUseCase;