const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa o middleware de autenticação

// Rota para obter informações do usuário pelo ID
// GET /v1/user/:id
router.get('/v1/user/:id', userController.getUserById);

// Rota para cadastrar um novo usuário
// POST /v1/user
router.post('/v1/user', userController.createUser);

// Rota para atualizar um usuário pelo ID (REQUER AUTENTICAÇÃO)
// PUT /v1/user/:id
router.put('/v1/user/:id', authMiddleware.authenticateToken, userController.updateUser);

// Rota para deletar um usuário pelo ID (REQUER AUTENTICAÇÃO)
// DELETE /v1/user/:id
router.delete('/v1/user/:id', authMiddleware.authenticateToken, userController.deleteUser);

// Rota de login temporária para gerar JWT
// POST /v1/auth/login
router.post('/v1/auth/login', userController.loginUser);

module.exports = router;
