'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', { // O nome da tabela será 'Users' 
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório
      },
      surname: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false, // Preenchimento obrigatório
        unique: true // O email deve ser único
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório
      },
      createdAt: { // Coluna created_at (gerada por timestamps: true)
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at' // Mapeia para created_at no banco de dados
      },
      updatedAt: { // Coluna updated_at (gerada por timestamps: true)
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at' // Mapeia para updated_at no banco de dados
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};