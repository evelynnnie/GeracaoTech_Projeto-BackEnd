const jwt = require('jsonwebtoken');

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';

/**
 * Middleware para autenticar o token JWT.
 * Se o token não for fornecido ou for inválido, retorna 400 Bad Request.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @param {function} next - Próxima função middleware.
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    // Retorna 400 Bad Request se o token não for fornecido
    return res.status(400).json({ message: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Erro de verificação de token:', err);
      // Retorna 400 Bad Request se o token for inválido ou expirado
      return res.status(400).json({ message: 'Token de autenticação inválido ou expirado.' });
    }
    req.user = user; // Adiciona os dados do usuário decodificados ao objeto de requisição
    next();
  });
}

module.exports = {
  authenticateToken,
};
