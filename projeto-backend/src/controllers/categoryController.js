const { Category } = require('../models'); 
const { Op } = require('sequelize'); 

/**
 * Obtém uma lista de categorias com opções de busca, paginação e seleção de campos.
 * GET /v1/category/search
 * Query params:
 * limit: Número de itens por página (padrão: 12, -1 para todos)
 * page: Número da página (padrão: 1)
 * fields: Campos a serem retornados, separados por vírgula (ex: "id,name,slug")
 * use_in_menu: Filtra categorias que podem aparecer no menu (true/false)
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function searchCategories(req, res) {
  try {
    // Parâmetros de Query
    let { limit = 12, page = 1, fields, use_in_menu } = req.query;

    // Converte para número inteiro
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);

    // Validação de parâmetros
    if (isNaN(limit) || isNaN(page) || page < 1 || (limit !== -1 && limit < 1)) {
      return res.status(400).json({ message: 'Parâmetros de paginação (limit, page) inválidos.' });
    }

    // Configurações para a busca no Sequelize
    const findOptions = {
      where: {}, // Condições de filtro
      attributes: {}, // Campos a serem retornados
      order: [['name', 'ASC']] // Ordenação padrão, pode ser ajustada
    };

    // 1. Filtrar por use_in_menu
    if (use_in_menu !== undefined) {
      const useInMenuBoolean = use_in_menu === 'true'; // Converte string 'true'/'false' para booleano
      findOptions.where.use_in_menu = useInMenuBoolean;
    }

    // 2. Seleção de campos (fields)
    if (fields) {
      const selectedFields = fields.split(',').map(field => field.trim());
      // Garante que 'id' sempre seja incluído se não estiver explicitamente excluído
      if (!selectedFields.includes('id')) {
        selectedFields.unshift('id');
      }
      findOptions.attributes = selectedFields;
    } else {
      // Se 'fields' não for especificado, retorna todos os campos relevantes
      findOptions.attributes = ['id', 'name', 'slug', 'use_in_menu'];
    }

    // 3. Paginação (limit e offset)
    if (limit !== -1) {
      findOptions.limit = limit;
      findOptions.offset = (page - 1) * limit;
    }

    // Executa a busca e conta o total de categorias
    const { count, rows } = await Category.findAndCountAll(findOptions);

    // Retorna a resposta no formato especificado
    return res.status(200).json({
      data: rows,
      total: count,
      limit: limit,
      page: page
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Obtém informações de uma categoria pelo ID.
 * GET /v1/category/:id
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function getCategoryById(req, res) {
  try {
    const { id } = req.params; // Obtém o ID da URL

    // Busca a categoria no banco de dados pelo ID
    const category = await Category.findByPk(id, {
      attributes: ['id', 'name', 'slug', 'use_in_menu'] // Seleciona apenas as colunas desejadas
    });

    // Verifica se a categoria foi encontrada
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Retorna as informações da categoria com status 200 OK
    return res.status(200).json(category);

  } catch (error) {
    // Em caso de erro, retorna um erro interno do servidor
    console.error('Erro ao obter categoria por ID:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Cadastra uma nova categoria.
 * POST /v1/category
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function createCategory(req, res) {
  try {
    const { name, slug, use_in_menu } = req.body;

    // 1. Validação de campos obrigatórios
    if (!name || !slug) {
      return res.status(400).json({ message: 'Os campos "name" e "slug" são obrigatórios.' });
    }

    // 2. Validação de slug único
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Este slug já está em uso.' });
    }

    // 3. Criação da categoria no banco de dados
    const newCategory = await Category.create({
      name,
      slug,
      // Se use_in_menu não for fornecido, o valor padrão do modelo (false) será usado
      use_in_menu: use_in_menu !== undefined ? use_in_menu : false,
    });

    // 4. Retorna a resposta de sucesso (201 Created)
    const { id, name: newName, slug: newSlug, use_in_menu: newUseInMenu } = newCategory;
    return res.status(201).json({
      id,
      name: newName,
      slug: newSlug,
      use_in_menu: newUseInMenu
    });

  } catch (error) {
    console.error('Erro ao cadastrar categoria:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Atualiza informações de uma categoria pelo ID.
 * PUT /v1/category/:id
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params; // Obtém o ID da categoria a ser atualizada
    const { name, slug, use_in_menu } = req.body; // Obtém os dados a serem atualizados

    // Validação básica: verificar se há pelo menos um campo para atualizar
    if (!name && !slug && use_in_menu === undefined) {
      return res.status(400).json({ message: 'Pelo menos um campo (name, slug, use_in_menu) deve ser fornecido para atualização.' });
    }

    // Busca a categoria no banco de dados
    const category = await Category.findByPk(id);

    // Se a categoria não for encontrada, retorna 404 Not Found
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Validação de slug único se o slug for alterado
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ where: { slug } });
      if (existingCategory && existingCategory.id !== category.id) { // Garante que não é a própria categoria
        return res.status(400).json({ message: 'Este slug já está em uso por outra categoria.' });
      }
    }

    // Atualiza a categoria com os dados fornecidos
    await category.update({ name, slug, use_in_menu });

    // Retorna 204 No Content para sucesso sem corpo de resposta
    return res.status(204).send();

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

/**
 * Deleta uma categoria pelo ID.
 * DELETE /v1/category/:id
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params; // Obtém o ID da categoria a ser deletada

    // Busca a categoria no banco de dados
    const category = await Category.findByPk(id);

    // Se a categoria não for encontrada, retorna 404 Not Found
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Deleta a categoria
    await category.destroy();

    // Retorna 204 No Content para sucesso sem corpo de resposta
    return res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}


module.exports = {
  searchCategories,
  getCategoryById,
  createCategory,
  updateCategory, 
  deleteCategory, 
};
