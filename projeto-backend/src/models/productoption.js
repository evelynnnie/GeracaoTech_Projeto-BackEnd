'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define a associação: ProductOption pertence a um Product
      ProductOption.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product' // Alias para a associação
      });
    }
  }
  ProductOption.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shape: {
      type: DataTypes.ENUM('square', 'circle'), // Tipo ENUM com valores permitidos
      allowNull: true,
      defaultValue: 'square',
    },
    radius: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM('text', 'color'), // Tipo ENUM com valores permitidos
      allowNull: true,
      defaultValue: 'text',
    },
    values: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'ProductOption',
    tableName: 'ProductOptions', // Nome da tabela no banco de dados
    timestamps: true, // Habilita created_at e updated_at
    underscored: true, // Usa snake_case para as colunas geradas (created_at, updated_at)
  });
  return ProductOption;
};
