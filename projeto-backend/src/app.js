const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes'); 

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Rota de exemplo (pode ser removida ou mantida para teste inicial)
app.get('/', (req, res) => {
  res.send('Bem-vindo à API!');
});

// Usa as rotas de usuário
app.use('/', userRoutes);

// Usa as rotas de categoria
app.use('/', categoryRoutes);

// Usa as rotas de produto
app.use('/', productRoutes); 

// Exporta o app para ser usado pelo server.js e pelos testes
module.exports = app;
