const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

// Rota para obter uma lista de categorias
// GET /v1/category/search
router.get('/v1/category/search', categoryController.searchCategories);

// Rota para obter informações da categoria pelo ID
// GET /v1/category/:id
router.get('/v1/category/:id', categoryController.getCategoryById);

// Rota para cadastrar uma nova categoria (REQUER AUTENTICAÇÃO)
// POST /v1/category
router.post('/v1/category', authMiddleware.authenticateToken, categoryController.createCategory);

// Rota para atualizar uma categoria pelo ID (REQUER AUTENTICAÇÃO)
// PUT /v1/category/:id
router.put('/v1/category/:id', authMiddleware.authenticateToken, categoryController.updateCategory);

// Rota para deletar uma categoria pelo ID (REQUER AUTENTICAÇÃO)
// DELETE /v1/category/:id
router.delete('/v1/category/:id', authMiddleware.authenticateToken, categoryController.deleteCategory);

module.exports = router;
