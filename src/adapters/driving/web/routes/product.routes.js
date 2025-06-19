const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Devuelve una lista completa de todos los productos disponibles en el catálogo
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               data: [
 *                 {
 *                   id: 1,
 *                   name: "iPhone 15 Pro",
 *                   description: "Apple iPhone 15 Pro 128GB con chip A17 Pro y cámara de 48MP",
 *                   price: 4500000,
 *                   stock: 12,
 *                   createdAt: "2025-06-19T16:32:44.899Z",
 *                   updatedAt: "2025-06-19T16:32:44.899Z"
 *                 }
 *               ]
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     description: Crea un nuevo producto en el catálogo con la información proporcionada
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *           example:
 *             name: "MacBook Pro M3"
 *             description: "MacBook Pro 14 pulgadas con chip M3, 16GB RAM, 512GB SSD"
 *             price: 8500000
 *             stock: 5
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               data:
 *                 id: 6
 *                 name: "MacBook Pro M3"
 *                 description: "MacBook Pro 14 pulgadas con chip M3, 16GB RAM, 512GB SSD"
 *                 price: 8500000
 *                 stock: 5
 *                 createdAt: "2025-06-19T17:45:00.000Z"
 *                 updatedAt: "2025-06-19T17:45:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Todos los campos son requeridos: name, description, price, stock"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     description: Devuelve la información detallada de un producto específico
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único del producto
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "iPhone 15 Pro"
 *                 description: "Apple iPhone 15 Pro 128GB con chip A17 Pro y cámara de 48MP"
 *                 price: 4500000
 *                 stock: 12
 *                 createdAt: "2025-06-19T16:32:44.899Z"
 *                 updatedAt: "2025-06-19T16:32:44.899Z"
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Producto no encontrado"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "ID debe ser un número válido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

module.exports = (productController) => {
    router.get('/', (req, res) => productController.getAllProducts(req, res));
    router.post('/', (req, res) => productController.createProduct(req, res));
    router.get('/:id', (req, res) => productController.getProduct(req, res));
    return router;
};