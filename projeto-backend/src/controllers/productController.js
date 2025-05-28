const {
  Product,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  Category,
  sequelize 
} = require('../models');
const { Op } = require('sequelize'); 

/**
 * Helper para incluir associações comuns de produto em consultas.
 */
const productIncludeOptions = [
  {
    model: ProductImage,
    as: 'images',
    attributes: ['id', 'content'] // Retorna id e content da imagem
  },
  {
    model: ProductOption,
    as: 'options',
    attributes: ['id', 'title', 'shape', 'radius', 'type'],
    include: [{
      model: ProductOptionValue,
      as: 'values',
      attributes: ['id', 'value']
    }]
  },
  {
    model: Category,
    as: 'categories',
    attributes: ['id', 'name', 'slug'], // Seleciona apenas id, name, slug da categoria
    through: { attributes: [] } // Não retorna campos da tabela pivô (ProductCategories)
  }
];

/**
 * Formata um objeto de produto para a saída da API, incluindo category_ids como array
 * e ajustando a estrutura de imagens e opções conforme o requisito.
 * @param {object} product - O objeto de produto retornado pelo Sequelize (pode ser uma instância ou um objeto JSON).
 * @returns {object} O objeto de produto formatado.
 */
function formatProductForResponse(product) {
  const formattedProduct = product.toJSON ? product.toJSON() : product; // Converte para um objeto JS simples se for instância Sequelize

  // Extrai apenas os IDs das categorias e remove o objeto completo de categorias
  formattedProduct.category_ids = formattedProduct.categories
    ? formattedProduct.categories.map(cat => cat.id)
    : [];
  delete formattedProduct.categories;

  // Formata as imagens para ter apenas 'id' e 'content'
  formattedProduct.images = formattedProduct.images
    ? formattedProduct.images.map(img => ({ id: img.id, content: img.content }))
    : [];

  // Formata as opções para ter 'values' como array de strings, como no requisito
  formattedProduct.options = formattedProduct.options
    ? formattedProduct.options.map(option => {
        const optionObj = {
          id: option.id,
          title: option.title,
          shape: option.shape,
          radius: option.radius,
          type: option.type,
          values: option.values ? option.values.map(val => val.value) : [], // Pega apenas o 'value'
        };
        return optionObj;
      })
    : [];

  return formattedProduct;
}


/**
 * Obtém uma lista de produtos com opções de busca, paginação e seleção de campos.
 * GET /v1/product/search
 * Query params:
 * limit: Número de itens por página (padrão: 12, -1 para todos)
 * page: Número da página (padrão: 1)
 * fields: Campos a serem retornados, separados por vírgula (ex: "id,name,slug")
 * match: Termo para buscar no nome ou descrição
 * category_ids: IDs das categorias, separados por vírgula
 * price_range: Faixa de preço (ex: "100-200")
 * option[ID]: Valores de opção para filtrar (ex: "option[45]=GG,PP")
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function searchProducts(req, res) {
  try {
    let { limit = 12, page = 1, fields, match, category_ids, price_range } = req.query;

    // Conversão de tipos
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);

    // Validação de paginação
    if (isNaN(limit) || isNaN(page) || page < 1 || (limit !== -1 && limit < 1)) {
      return res.status(400).json({ message: 'Parâmetros de paginação (limit, page) inválidos.' });
    }

    const findOptions = {
      where: {
        enabled: true // Produtos habilitados por padrão na busca
      },
      include: JSON.parse(JSON.stringify(productIncludeOptions)), // Faz uma cópia profunda para não modificar o original
      attributes: [], // Será definido com base em 'fields'
      distinct: true, // Garante contagem correta com includes
      subQuery: false, // Pode ser necessário ajustar dependendo da complexidade dos JOINS
    };

    // 1. Filtrar por 'match' (nome ou descrição)
    if (match) {
      findOptions.where[Op.or] = [
        { name: { [Op.like]: `%${match}%` } },
        { description: { [Op.like]: `%${match}%` } },
      ];
    }

    // 2. Filtrar por 'category_ids'
    if (category_ids) {
      const ids = category_ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        // Adiciona um include para a tabela de categorias com o filtro
        // Usamos 'required: true' para garantir que apenas produtos que possuam essas categorias sejam retornados
        findOptions.include = findOptions.include.map(includeOpt => {
          if (includeOpt.as === 'categories') {
            return {
              ...includeOpt,
              where: { id: { [Op.in]: ids } },
              required: true // Garante que o produto tenha pelo menos uma das categorias
            };
          }
          return includeOpt;
        });
      }
    }

    // 3. Filtrar por 'price_range'
    if (price_range) {
      const [minPriceStr, maxPriceStr] = price_range.split('-');
      const minPrice = parseFloat(minPriceStr);
      const maxPrice = parseFloat(maxPriceStr);

      if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice <= maxPrice) {
        findOptions.where.price = {
          [Op.between]: [minPrice, maxPrice]
        };
      } else if (!isNaN(minPrice) && isNaN(maxPrice)) {
        findOptions.where.price = { [Op.gte]: minPrice };
      } else if (isNaN(minPrice) && !isNaN(maxPrice)) {
        findOptions.where.price = { [Op.lte]: maxPrice };
      } else {
        return res.status(400).json({ message: 'Formato de price-range inválido. Use "min-max" ou apenas "min-" ou "-max".' });
      }
    }

    // 4. Filtrar por 'option[ID]=VALUE1,VALUE2'
    const optionFilters = Object.entries(req.query)
      .filter(([key]) => key.startsWith('option[') && key.endsWith(']'))
      .map(([key, value]) => {
        const optionId = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')), 10);
        const optionValues = value.split(',').map(v => v.trim());
        if (!isNaN(optionId) && optionValues.length > 0) {
          return { optionId, optionValues };
        }
        return null;
      }).filter(Boolean);

    if (optionFilters.length > 0) {
      // Para cada filtro de opção, adicionamos um include específico
      optionFilters.forEach(filter => {
        findOptions.include.push({
          model: ProductOption,
          as: 'options', // Alias usado no Product.hasMany
          attributes: [], // Não precisamos dos dados da opção aqui
          where: { id: filter.optionId },
          include: [{
            model: ProductOptionValue,
            as: 'values', // Alias usado no ProductOption.hasMany
            attributes: [],
            where: { value: { [Op.in]: filter.optionValues } },
            required: true // Garante que o JOIN atua como um filtro
          }],
          required: true // Garante que o JOIN atua como um filtro
        });
      });
    }

    // 5. Seleção de campos (fields)
    const defaultProductFields = ['id', 'enabled', 'name', 'slug', 'stock', 'description', 'price', 'price_with_discount'];
    if (fields) {
      const selectedFields = fields.split(',').map(field => field.trim());
      // Filtrar campos válidos e garantir que o 'id' esteja sempre presente
      const validFields = defaultProductFields.filter(field => selectedFields.includes(field));

      // Se 'images' ou 'options' forem solicitados, o include já cuida disso.
      // Apenas precisamos garantir que os campos base do produto estejam incluídos.
      if (!validFields.includes('id')) {
        validFields.unshift('id');
      }
      findOptions.attributes = validFields;
    } else {
      findOptions.attributes = defaultProductFields;
    }

    // Paginação
    let offset = 0;
    if (limit !== -1) {
      offset = (page - 1) * limit;
      findOptions.limit = limit;
      findOptions.offset = offset;
    }

    // Executa a busca
    // Usamos findAndCountAll para obter os dados e o total de resultados
    const { count, rows } = await Product.findAndCountAll(findOptions);

    // Formata a resposta
    const formattedProducts = rows.map(product => formatProductForResponse(product));

    return res.status(200).json({
      data: formattedProducts,
      total: count,
      limit: limit,
      page: page,
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Obtém informações de um produto pelo ID.
 * GET /v1/product/:id
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: productIncludeOptions
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    return res.status(200).json(formatProductForResponse(product));

  } catch (error) {
    console.error('Erro ao obter produto por ID:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Cria um novo produto com suas imagens e opções.
 * POST /v1/product
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function createProduct(req, res) {
  const t = await sequelize.transaction(); // Inicia uma transação

  try {
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids,
      images, // Array de objetos { type, content }
      options // Array de objetos { title, shape, radius, type, values }
    } = req.body;

    // Validação de campos obrigatórios
    if (!name || !slug || price === undefined || price === null) {
      await t.rollback();
      return res.status(400).json({ message: 'Os campos "name", "slug" e "price" são obrigatórios.' });
    }
    if (typeof price !== 'number' || price < 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Preço inválido. Deve ser um número positivo.' });
    }
    if (price_with_discount !== undefined && price_with_discount !== null && (typeof price_with_discount !== 'number' || price_with_discount < 0)) {
      await t.rollback();
      return res.status(400).json({ message: 'Preço com desconto inválido. Deve ser um número positivo.' });
    }
    if (stock !== undefined && stock !== null && (typeof stock !== 'number' || stock < 0)) {
      await t.rollback();
      return res.status(400).json({ message: 'Estoque inválido. Deve ser um número positivo.' });
    }

    // Validação de slug único
    const existingProduct = await Product.findOne({ where: { slug }, transaction: t });
    if (existingProduct) {
      await t.rollback();
      return res.status(400).json({ message: 'Este slug já está em uso.' });
    }

    // Criação do produto
    const newProduct = await Product.create({
      enabled: enabled !== undefined ? enabled : true,
      name,
      slug,
      stock: stock !== undefined ? stock : 0,
      description,
      price,
      price_with_discount: price_with_discount !== undefined ? price_with_discount : null,
    }, { transaction: t });

    // Lidar com Imagens
    if (images && Array.isArray(images) && images.length > 0) {
      const productImages = images.map(img => ({
        product_id: newProduct.id,
        type: img.type,
        content: img.content,
      }));
      await ProductImage.bulkCreate(productImages, { transaction: t });
    }

    // Lidar com Opções e seus Valores
    if (options && Array.isArray(options) && options.length > 0) {
      for (const opt of options) {
        if (!opt.title || !opt.type || !Array.isArray(opt.values) || opt.values.length === 0) {
          await t.rollback();
          return res.status(400).json({ message: 'Opção de produto inválida: title, type e values são obrigatórios e values deve ser um array não vazio.' });
        }
        const newOption = await ProductOption.create({
          product_id: newProduct.id,
          title: opt.title,
          shape: opt.shape || null,
          radius: opt.radius || null,
          type: opt.type,
        }, { transaction: t });

        const optionValues = opt.values.map(val => ({
          option_id: newOption.id,
          value: String(val), // Garante que o valor é string
        }));
        await ProductOptionValue.bulkCreate(optionValues, { transaction: t });
      }
    }

    // Lidar com Categorias
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      // Verificar se as categorias existem
      const existingCategories = await Category.findAll({
        where: { id: { [Op.in]: category_ids } },
        attributes: ['id'],
        transaction: t
      });
      if (existingCategories.length !== category_ids.length) {
        await t.rollback();
        return res.status(400).json({ message: 'Uma ou mais categorias especificadas não existem.' });
      }
      // Adicionar associações de categoria
      await newProduct.setCategories(category_ids, { transaction: t });
    }

    await t.commit(); // Confirma a transação

    // Retorna o produto recém-criado com suas associações
    const createdProduct = await Product.findByPk(newProduct.id, {
      include: productIncludeOptions
    });

    return res.status(201).json(formatProductForResponse(createdProduct));

  } catch (error) {
    await t.rollback(); // Desfaz a transação em caso de erro
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Atualiza um produto existente, suas imagens e opções.
 * PUT /v1/product/:id
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function updateProduct(req, res) {
  const t = await sequelize.transaction(); // Inicia uma transação

  try {
    const { id } = req.params;
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids,
      images, // Array de objetos { id?, type?, content?, deleted? }
      options // Array de objetos { id?, title?, shape?, radius?, type?, values?, deleted? }
    } = req.body;

    const product = await Product.findByPk(id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductOption, as: 'options', include: [{ model: ProductOptionValue, as: 'values' }] },
      ],
      transaction: t
    });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // 1. Validação e atualização dos campos do produto
    const updateData = {};
    if (enabled !== undefined) {
      if (typeof enabled !== 'boolean') {
        await t.rollback();
        return res.status(400).json({ message: 'O campo "enabled" deve ser um booleano.' });
      }
      updateData.enabled = enabled;
    }
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        await t.rollback();
        return res.status(400).json({ message: 'O campo "name" é inválido.' });
      }
      updateData.name = name;
    }
    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim() === '') {
        await t.rollback();
        return res.status(400).json({ message: 'O campo "slug" é inválido.' });
      }
      const existingProduct = await Product.findOne({
        where: { slug, id: { [Op.ne]: id } },
        transaction: t
      });
      if (existingProduct) {
        await t.rollback();
        return res.status(400).json({ message: 'Este slug já está em uso por outro produto.' });
      }
      updateData.slug = slug;
    }
    if (stock !== undefined) {
      if (typeof stock !== 'number' || stock < 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Estoque inválido.' });
      }
      updateData.stock = stock;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Preço inválido.' });
      }
      updateData.price = price;
    }
    if (price_with_discount !== undefined) {
      if (typeof price_with_discount !== 'number' || price_with_discount < 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Preço com desconto inválido.' });
      }
      updateData.price_with_discount = price_with_discount;
    }

    if (Object.keys(updateData).length > 0) {
      await product.update(updateData, { transaction: t });
    }

    // 2. Lidar com Imagens
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.id && img.deleted) {
          // Deletar imagem existente
          await ProductImage.destroy({ where: { id: img.id, product_id: product.id }, transaction: t });
        } else if (img.id) {
          // Atualizar imagem existente
          const existingImage = await ProductImage.findByPk(img.id, { transaction: t });
          if (!existingImage || existingImage.product_id !== product.id) {
            await t.rollback();
            return res.status(400).json({ message: `Imagem com ID ${img.id} não encontrada ou não pertence a este produto.` });
          }
          if (img.content && img.type) { // Apenas atualiza se content e type forem fornecidos
            await existingImage.update({ type: img.type, content: img.content }, { transaction: t });
          } else if (img.content || img.type) { // Se apenas um for fornecido, é um erro
            await t.rollback();
            return res.status(400).json({ message: `Para atualizar a imagem com ID ${img.id}, 'type' e 'content' devem ser fornecidos juntos.` });
          }
        } else if (img.content && img.type) {
          // Adicionar nova imagem
          await ProductImage.create({ product_id: product.id, type: img.type, content: img.content }, { transaction: t });
        } else {
          await t.rollback();
          return res.status(400).json({ message: `Formato de imagem inválido para atualização/criação: ${JSON.stringify(img)}` });
        }
      }
    }

    // 3. Lidar com Opções e seus Valores
    if (options && Array.isArray(options)) {
      for (const opt of options) {
        if (opt.id && opt.deleted) {
          // Deletar opção existente e seus valores
          await ProductOption.destroy({ where: { id: opt.id, product_id: product.id }, transaction: t });
        } else if (opt.id) {
          // Atualizar opção existente
          const existingOption = await ProductOption.findByPk(opt.id, { transaction: t });
          if (!existingOption || existingOption.product_id !== product.id) {
            await t.rollback();
            return res.status(400).json({ message: `Opção com ID ${opt.id} não encontrada ou não pertence a este produto.` });
          }

          const optionUpdateData = {};
          if (opt.title !== undefined) optionUpdateData.title = opt.title;
          if (opt.shape !== undefined) optionUpdateData.shape = opt.shape;
          if (opt.radius !== undefined) optionUpdateData.radius = opt.radius;
          if (opt.type !== undefined) optionUpdateData.type = opt.type;

          if (Object.keys(optionUpdateData).length > 0) {
            await existingOption.update(optionUpdateData, { transaction: t });
          }

          // Atualizar/Adicionar/Deletar valores da opção
          if (Array.isArray(opt.values)) {
            // Primeiro, deleta todos os valores existentes para esta opção
            await ProductOptionValue.destroy({ where: { option_id: existingOption.id }, transaction: t });
            // Depois, recria todos os valores fornecidos
            const newOptionValues = opt.values.map(val => ({
              option_id: existingOption.id,
              value: String(val),
            }));
            if (newOptionValues.length > 0) {
              await ProductOptionValue.bulkCreate(newOptionValues, { transaction: t });
            }
          } else if (opt.values !== undefined && !Array.isArray(opt.values)) {
            await t.rollback();
            return res.status(400).json({ message: `Os valores para a opção com ID ${opt.id} devem ser um array.` });
          }
        } else {
          // Adicionar nova opção
          if (!opt.title || !opt.type || !Array.isArray(opt.values) || opt.values.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Nova opção de produto inválida: title, type e values são obrigatórios e values deve ser um array não vazio.' });
          }
          const newOption = await ProductOption.create({
            product_id: product.id,
            title: opt.title,
            shape: opt.shape || null,
            radius: opt.radius || null,
            type: opt.type,
          }, { transaction: t });

          const optionValues = opt.values.map(val => ({
            option_id: newOption.id,
            value: String(val),
          }));
          await ProductOptionValue.bulkCreate(optionValues, { transaction: t });
        }
      }
    }

    // 4. Lidar com Categorias
    if (category_ids !== undefined) {
      if (!Array.isArray(category_ids)) {
        await t.rollback();
        return res.status(400).json({ message: 'O campo "category_ids" deve ser um array de IDs.' });
      }
      const existingCategories = await Category.findAll({
        where: { id: { [Op.in]: category_ids } },
        attributes: ['id'],
        transaction: t
      });
      if (existingCategories.length !== category_ids.length) {
        await t.rollback();
        return res.status(400).json({ message: 'Uma ou mais categorias especificadas não existem.' });
      }
      await product.setCategories(category_ids, { transaction: t });
    }

    await t.commit(); // Confirma a transação

    return res.status(204).send();

  } catch (error) {
    await t.rollback(); // Desfaz a transação em caso de erro
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Deleta um produto pelo ID.
 * DELETE /v1/product/:id
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function deleteProduct(req, res) {
  const t = await sequelize.transaction(); // Inicia uma transação

  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Deleta o produto (com onDelete: CASCADE nas associações, imagens e opções serão deletadas automaticamente)
    await product.destroy({ transaction: t });

    await t.commit(); // Confirma a transação

    return res.status(204).send();

  } catch (error) {
    await t.rollback(); // Desfaz a transação em caso de erro
    console.error('Erro ao deletar produto:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}


module.exports = {
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
