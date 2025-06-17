const Result = require('../../utils/Result');

class GetProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(productId) {
        try {
            if (!productId) {
                return Result.fail('ID de producto inválido');
            }

            const product = await this.productRepository.findById(productId);
            
            if (!product) {
                return Result.fail('Producto no encontrado');
            }

            return Result.ok(product);
        } catch (error) {
            return Result.fail(`Error al obtener el producto: ${error.message}`);
        }
    }
}

module.exports = GetProductUseCase;