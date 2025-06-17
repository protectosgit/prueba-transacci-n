const express = require('express');
const router = express.Router();

module.exports = (productController) => {
    router.get('/:id', (req, res) => productController.getProduct(req, res));
    return router;
};