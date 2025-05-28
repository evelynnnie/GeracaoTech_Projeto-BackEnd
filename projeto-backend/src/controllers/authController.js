const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); 

// Chave secreta para JWT (
const JWT_SECRET = process.env.JWT_SECRET || 'terracotapie'; 

/**
 * Middleware para autenticar o token JWT.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @param {function} next - Próxima função middleware.
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Erro de verificação de token:', err);
      return res.status(403).json({ message: 'Token de autenticação inválido ou expirado.' });
    }
    req.user = user; // Adiciona os dados do usuário decodificados ao objeto de requisição
    next();
  });
}

/**
 * Função para registrar um novo usuário.
 * POST /v1/user
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validação de campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos (name, email, password) são obrigatórios.' });
    }

    // Validação de formato de email básico
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está cadastrado.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o saltRounds

    // Cria o usuário no banco de dados
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Retorna a resposta de sucesso (201 Created)
    const { id, name: newName, email: newEmail } = newUser;
    return res.status(201).json({
      id,
      name: newName,
      email: newEmail,
      message: 'Usuário cadastrado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Função para gerar um token JWT para um usuário autenticado.
 * POST /v1/user/token
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function generateToken(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validação de campos obrigatórios
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Buscar o usuário pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Retorna 400 para evitar enumerar usuários
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Comparar a senha fornecida com a senha hashed no banco de dados
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 4. Gerar o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    // 5. Retornar o token
    return res.status(200).json({ token });

  } catch (error) {
    console.error('Erro ao gerar token:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

module.exports = {
  authenticateToken,
  registerUser,
  generateToken, 
};
