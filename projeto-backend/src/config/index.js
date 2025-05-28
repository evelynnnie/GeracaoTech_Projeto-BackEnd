const config = {
  development: { // Configuração para o ambiente de desenvolvimento
    jwtSecret: process.env.JWT_SECRET || 'terracotapie', 
    database: process.env.DB_NAME || 'projetobackenddb',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  },
  
  test: {
    // ... configurações de teste
  },
  production: {
    // ... configurações de produção
  }
};

module.exports = config;
