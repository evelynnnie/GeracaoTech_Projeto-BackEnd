const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

// Rota para obter uma lista de produtos
// GET /v1/product/search
router.get('/v1/product/search', productController.searchProducts);

// Rota para obter informações do produto pelo ID
// GET /v1/product/:id
router.get('/v1/product/:id', productController.getProductById);

// Rota para criar um novo produto (REQUER AUTENTICAÇÃO)
// POST /v1/product
router.post('/v1/product', authMiddleware.authenticateToken, productController.createProduct);

// Rota para atualizar um produto pelo ID (REQUER AUTENTICAÇÃO)
// PUT /v1/product/:id
router.put('/v1/product/:id', authMiddleware.authenticateToken, productController.updateProduct);

// Rota para deletar um produto pelo ID (REQUER AUTENTICAÇÃO)
// DELETE /v1/product/:id
router.delete('/v1/product/:id', authMiddleware.authenticateToken, productController.deleteProduct);

module.exports = router;
