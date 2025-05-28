'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define a associação: Um Product tem muitas ProductImages
      Product.hasMany(models.ProductImage, {
        foreignKey: 'product_id',
        as: 'images' // Alias para a associação
      });

      // Define a associação: Um Product tem muitas ProductOptions
      Product.hasMany(models.ProductOption, {
        foreignKey: 'product_id',
        as: 'options' // Alias para a associação
      });

      // Define a associação muitos-para-muitos com Category
      Product.belongsToMany(models.Category, {
        through: models.ProductCategory, // Tabela de junção
        foreignKey: 'product_id',
        otherKey: 'category_id',
        as: 'categories' // Alias para a associação
      });
    }
  }
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Garante que o slug é único
    },
    use_in_menu: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    price_with_discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products', // Nome da tabela no banco de dados
    timestamps: true, // Habilita created_at e updated_at
    underscored: true, // Usa snake_case para as colunas geradas (created_at, updated_at)
  });
  return Product;
};
