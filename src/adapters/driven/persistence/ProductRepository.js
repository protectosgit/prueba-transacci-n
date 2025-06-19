const Product = require('../../../domain/entities/Product');

class ProductRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id) {
        try {
            const productModel = await this.model.findByPk(id);
            if (!productModel) return null;
            
            return new Product(productModel.toJSON());
        } catch (error) {
            throw new Error(`Error al buscar el producto: ${error.message}`);
        }
    }

    async update(product) {
        try {
            await this.model.update(product, {
                where: { id: product.id }
            });
            return product;
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }
    }

    async updateStock(productId, newStock) {
        try {
    
            
            const [updatedRowsCount] = await this.model.update(
                { stock: newStock },
                { where: { id: productId } }
            );

            if (updatedRowsCount === 0) {
                throw new Error('Producto no encontrado o no se pudo actualizar');
            }

    
            return await this.findById(productId);
        } catch (error) {
            console.error('Error actualizando stock:', error);
            throw new Error(`Error al actualizar stock del producto: ${error.message}`);
        }
    }

    async create(productData) {
        try {
            // Omitimos el id para que Sequelize lo genere automáticamente
            const { id, ...data } = productData;
            const productModel = await this.model.create(data);
            return new Product(productModel.toJSON());
        } catch (error) {
            throw new Error(`Error al crear el producto: ${error.message}`);
        }
    }

    async save(product) {
        try {
            // Si el producto ya tiene ID, actualizamos
            if (product.id) {
                return await this.update(product);
            }
            // Si no tiene ID, creamos uno nuevo
            return await this.create(product);
        } catch (error) {
            throw new Error(`Error al guardar el producto: ${error.message}`);
        }
    }

    async findAll() {
        try {
            const products = await this.model.findAll();
            return products.map(product => new Product(product.toJSON()));
        } catch (error) {
            throw new Error(`Error al obtener los productos: ${error.message}`);
        }
    }
}

module.exports = ProductRepository;