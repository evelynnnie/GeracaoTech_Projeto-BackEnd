'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductCategories', { // O nome da tabela será 'ProductCategories'
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: { // Chave estrangeira para a tabela Products
        type: Sequelize.INTEGER,
        allowNull: false, // Preenchimento obrigatório
        references: { // Define a referência
          model: 'Products', // Nome da tabela referenciada
          key: 'id' // Coluna da tabela referenciada
        },
        onUpdate: 'CASCADE', // O que acontece se o ID do produto for atualizado
        onDelete: 'CASCADE'  // O que acontece se o produto for deletado
      },
      category_id: { // Chave estrangeira para a tabela Categories
        type: Sequelize.INTEGER,
        allowNull: false, // Preenchimento obrigatório
        references: { // Define a referência
          model: 'Categories', // Nome da tabela referenciada
          key: 'id' // Coluna da tabela referenciada
        },
        onUpdate: 'CASCADE', // O que acontece se o ID da categoria for atualizado
        onDelete: 'CASCADE'  // O que acontece se a categoria for deletada
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
    await queryInterface.dropTable('ProductCategories');
  }
};
