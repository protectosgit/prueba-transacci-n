const Result = require('../../../../utils/Result');

class ProductController {
    constructor(getProductUseCase, createProductUseCase, getAllProductsUseCase) {
        this.getProductUseCase = getProductUseCase;
        this.createProductUseCase = createProductUseCase;
        this.getAllProductsUseCase = getAllProductsUseCase;
    }

    async createProduct(req, res) {
        try {
            const { name, description, price, stock } = req.body;

            // Validaciones básicas
            if (!name || !description || !price || stock === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos: name, description, price, stock'
                });
            }

            if (price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio debe ser mayor a 0'
                });
            }

            if (stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El stock no puede ser negativo'
                });
            }

            const result = await this.createProductUseCase.execute({
                name,
                description,
                price,
                stock
            });

            if (!result.isSuccess) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(201).json({
                success: true,
                data: result.value
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async getProduct(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const result = await this.getProductUseCase.execute(id);

            if (!result.isSuccess) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: result.value
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async getAllProducts(req, res) {
        try {
            const result = await this.getAllProductsUseCase.execute();

            if (!result.isSuccess) {
                return res.status(500).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                data: result.value
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = ProductController;