const Result = require('../../utils/Result');

class CreateProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(productData) {
        try {
            // Validaciones de negocio
            if (!productData.name || !productData.description || !productData.price || productData.stock === undefined) {
                return Result.fail('Todos los campos son requeridos');
            }

            if (productData.price <= 0) {
                return Result.fail('El precio debe ser mayor a 0');
            }

            if (productData.stock < 0) {
                return Result.fail('El stock no puede ser negativo');
            }

            // Crear el producto
            const product = await this.productRepository.create(productData);
            
            return Result.ok(product);
        } catch (error) {
            console.error('Error al crear el producto:', error);
            return Result.fail('Error al crear el producto');
        }
    }
}

module.exports = CreateProductUseCase; 