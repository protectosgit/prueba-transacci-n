const express = require('express');
const router = express.Router();

module.exports = (productController) => {
    router.post('/', (req, res) => productController.createProduct(req, res));
    router.get('/:id', (req, res) => productController.getProduct(req, res));
    return router;
};