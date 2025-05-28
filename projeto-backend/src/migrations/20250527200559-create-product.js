'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', { // O nome da tabela será 'Products' (plural de Product)
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true, // Preenchimento opcional
        defaultValue: false // Valor padrão 0 (false)
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false // Preenchimento obrigatório
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false, // Preenchimento obrigatório
        unique: true // O slug deve ser único
      },
      use_in_menu: {
        type: Sequelize.BOOLEAN,
        allowNull: true, // Preenchimento opcional
        defaultValue: false // Valor padrão 0 (false)
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: true, // Preenchimento opcional
        defaultValue: 0 // Valor padrão 0
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true // Preenchimento opcional
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false // Preenchimento obrigatório
      },
      price_with_discount: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('Products');
  }
};
