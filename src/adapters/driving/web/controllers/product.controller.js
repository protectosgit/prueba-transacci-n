const Result = require('../../../../utils/Result');

class ProductController {
    constructor(getProductUseCase) {
        this.getProductUseCase = getProductUseCase;
    }

    async getProduct(req, res) {
        try {
            const result = await this.getProductUseCase.execute(req.params.id);

            if (!result.isSuccess) {
                return res.status(404).json({
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