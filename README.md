# GeracaoTech_Projeto-BackEnd

Este é o projeto de backend desenvolvido como parte do curso de Desenvolvimento Web da **Geração Tech**. Ele implementa uma API RESTful para gerenciar usuários, categorias e produtos, incluindo funcionalidades de autenticação JWT e operações CRUD completas com filtros avançados.

---

## Sobre o Projeto

O objetivo deste projeto é construir uma base de backend robusta e escalável, utilizando Node.js, Express e Sequelize (ORM para MySQL), para simular um sistema de e-commerce. A API permite a gestão de dados de produtos com suas imagens e opções, categorias de produtos e autenticação de usuários.

---

## Funcionalidades Implementadas

A API oferece os seguintes endpoints:

### Autenticação e Usuários

* `POST /v1/user`: Registra um novo usuário.
* `POST /v1/user/token`: Gera um token JWT para autenticação do usuário (login).

### Categorias

* `POST /v1/category`: Cria uma nova categoria (**requer autenticação JWT**).
* `GET /v1/category/search`: Lista categorias com opções de paginação e busca por nome.
* `GET /v1/category/:id`: Obtém detalhes de uma categoria específica por ID.
* `PUT /v1/category/:id`: Atualiza uma categoria existente (**requer autenticação JWT**).
* `DELETE /v1/category/:id`: Deleta uma categoria (**requer autenticação JWT**).

### Produtos

* `POST /v1/product`: Cria um novo produto, incluindo suas imagens e opções (**requer autenticação JWT**).
* `GET /v1/product/search`: Lista produtos com opções avançadas de busca (match, category\_ids, price-range, options), paginação e seleção de campos.
* `GET /v1/product/:id`: Obtém detalhes de um produto específico por ID, incluindo todas as suas imagens e opções.
* `PUT /v1/product/:id`: Atualiza um produto existente, permitindo adicionar, atualizar e deletar imagens e opções aninhadas (**requer autenticação JWT**).
* `DELETE /v1/product/:id`: Deleta um produto (**requer autenticação JWT**).

**Validação de Token:** Todos os endpoints `POST`, `PUT` e `DELETE` exigem um token JWT válido no cabeçalho `Authorization: Bearer <jwt>`. Caso o token esteja ausente ou inválido, a requisição será rejeitada com o status `400 Bad Request`.

---

## Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express.js**: Framework web para Node.js.
* **Sequelize**: ORM (Object-Relational Mapper) para Node.js, facilitando a interação com o banco de dados MySQL.
* **MySQL**: Sistema de gerenciamento de banco de dados relacional.
* **JWT (JSON Web Tokens)**: Para autenticação de usuários.
* **Bcrypt.js**: Para hashing de senhas.
* **Dotenv**: Para carregar variáveis de ambiente.
* **Sequelize CLI**: Ferramenta de linha de comando para gerenciar migrações e modelos do Sequelize.
