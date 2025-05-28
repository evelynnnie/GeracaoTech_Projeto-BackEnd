'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Categories', { // O nome da tabela será 'Categories' 
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false, // Preenchimento obrigatório
        unique: true // O slug deve ser único para URLs amigáveis
      },
      use_in_menu: {
        type: Sequelize.BOOLEAN,
        allowNull: true, // Preenchimento opcional
        defaultValue: false // Valor padrão 0 (false)
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
    await queryInterface.dropTable('Categories');
  }
};