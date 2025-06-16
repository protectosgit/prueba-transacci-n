const IProductRepository = require('../../../domain/repositories/IProductRepository');
const Product = require('../../../domain/entities/Product');

class ProductRepository extends IProductRepository {
    constructor(productModel) {
        super();
        this.productModel = productModel;
    }

    async getById(productId) {
        try {
            const product = await this.productModel.findByPk(productId);
            if (!product) return null;

            return new Product(
                product.name,
                product.description,
                product.price,
                product.stock,
                product.id
            );
        } catch (error) {
            throw new Error(`Error al obtener producto: ${error.message}`);
        }
    }

    async update(product) {
        try {
            await this.productModel.update(
                {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock
                },
                {
                    where: { id: product.id }
                }
            );
            return product;
        } catch (error) {
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    }
}

module.exports = ProductRepository;