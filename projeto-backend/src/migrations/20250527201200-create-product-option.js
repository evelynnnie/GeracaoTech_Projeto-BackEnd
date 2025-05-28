'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductOptions', { // O nome da tabela será 'ProductOptions'
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
      title: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório
      },
      shape: {
        type: Sequelize.ENUM('square', 'circle'), // Tipo ENUM com valores permitidos
        allowNull: true, // Preenchimento opcional
        defaultValue: 'square' // Valor padrão
      },
      radius: {
        type: Sequelize.INTEGER,
        allowNull: true, // Preenchimento opcional
        defaultValue: 0 // Valor padrão
      },
      type: {
        type: Sequelize.ENUM('text', 'color'), // Tipo ENUM com valores permitidos
        allowNull: true, // Preenchimento opcional
        defaultValue: 'text' // Valor padrão
      },
      values: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório (valores separados por vírgula)
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
    await queryInterface.dropTable('ProductOptions');
  }
};
