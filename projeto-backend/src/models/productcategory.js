'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associações aqui, se houver
      // Esta tabela é a "through" para a relação muitos-para-muitos
      ProductCategory.belongsTo(models.Product, { foreignKey: 'product_id' });
      ProductCategory.belongsTo(models.Category, { foreignKey: 'category_id' });
    }
  }
  ProductCategory.init({
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'ProductCategory',
    tableName: 'ProductCategories', // Nome da tabela no banco de dados
    timestamps: true, // Habilita created_at e updated_at
    underscored: true, // Usa snake_case para as colunas geradas (created_at, updated_at)
  });
  return ProductCategory;
};
