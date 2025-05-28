'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define a associação: ProductImage pertence a um Product
      // Esta é a única associação que deve estar aqui para ProductImage
      ProductImage.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product' // Alias para a associação
      });
    }
  }
  ProductImage.init({
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
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'ProductImages', // Nome da tabela no banco de dados
    timestamps: true, // Habilita created_at e updated_at
    underscored: true, // Usa snake_case para as colunas geradas (created_at, updated_at)
  });
  return ProductImage;
};
