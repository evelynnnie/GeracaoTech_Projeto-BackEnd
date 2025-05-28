'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define a associação muitos-para-muitos com Product
      Category.belongsToMany(models.Product, {
        through: models.ProductCategory, // Tabela de junção
        foreignKey: 'category_id',
        otherKey: 'product_id',
        as: 'products' // Alias para a associação
      });
    }
  }
  Category.init({
    // ... (atributos existentes)
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
      allowNull: true, // Opcional
      defaultValue: false, // Valor padrão 0 (false)
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories', // Nome da tabela no banco de dados
    timestamps: true, // Habilita created_at e updated_at
    underscored: true, // Usa snake_case para as colunas geradas (created_at, updated_at)
  });
  return Category;
};
