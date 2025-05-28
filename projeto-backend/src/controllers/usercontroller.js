const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para registrar um novo usuário
// POST /v1/user
router.post('/v1/user', authController.registerUser);

// Rota para gerar um token JWT (login)
// POST /v1/user/token
router.post('/v1/user/token', authController.generateToken);

module.exports = router;
