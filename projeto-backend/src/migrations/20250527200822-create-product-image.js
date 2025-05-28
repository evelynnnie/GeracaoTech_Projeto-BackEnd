'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductImages', { // O nome da tabela será 'ProductImages'
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: { // Chave estrangeira para a tabela Products
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { // Define a referência
          model: 'Products', // Nome da tabela referenciada
          key: 'id' // Coluna da tabela referenciada
        },
        onUpdate: 'CASCADE', // O que acontece se o ID do produto for atualizado
        onDelete: 'CASCADE'  // O que acontece se o produto for deletado
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true, // Preenchimento opcional
        defaultValue: false // Valor padrão 0 (false)
      },
      path: {
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
    await queryInterface.dropTable('ProductImages');
  }
};
