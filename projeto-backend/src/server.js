require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});