// Importando os modules necessários
const service = require("../services/user");
const { validationResult } = require("express-validator");
require("express-async-errors");

// Função para criar no banco de dados um usuário
const createUser = (req, res) => {
  // Pegando as informações passadas no body da request
  const { nome, setor, cargo, email, senha } = req.body;

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User(nome, setor, cargo, email, senha);

  // Executando as função da classe e tratando os erros
  user
    .createUser()
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Função para gerar o JWT para o usuário de acordo com as suas permissões
const login = (req, res) => {
  // Pegando as informações passadas no body da request
  const { email, senha } = req.body;

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .login(email, senha)
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
        token: resul.token,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err.message,
      });
    });
};

// Função para pegar todas as informações do banco de dados de um usuário específico
const getUser = (req, res) => {
  // Pegando as informações que a request possuí
  const { userId } = req;

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .getUser(userId)
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Pegando todas as informações do bando de dados de todos os usuários
const getUsers = (req, res) => {
  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .getUsers()
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Função para alterar as informações de um usuário em campos específicos no banco de dados
const updateUser = (req, res) => {
  // Pegando as informações passadas no body da request
  const { nome, setor, cargo, email } = req.body;
  // Pegando as informações que a request possuí
  const { userId } = req;

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .editUser(userId, nome, setor, cargo, email)
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Função para alterar no banco de dados o campo de is_admin
const updateUserAdmin = (req, res) => {
  // Pegando as informações passadas no body da request
  const { is_admin, userId } = req.body;

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .editUserAdmin(is_admin, userId)
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Função para deletar todas as informações do banco de dados do próprio usuário que fez a chamada da rota
const deleteUser = (req, res) => {
  // Pegando as informações que a request possuí
  const { userId } = req;

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .deleteUser(userId)
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Função para deletar todas as informações do banco de dados de um determinado usuário
const deleteUserAdmin = (req, res) => {
  // Pegando as informações passadas no body da request
  const { id } = req.body;

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase User que contém todas as funções para cada rota
  const user = new service.User();

  // Executando as função da classe e tratando os erros
  user
    .deleteUserAdmin(id)
    .then((resul) => {
      res.status(200).json({
        message: resul.message,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

module.exports = {
  createUser,
  login,
  getUser,
  getUsers,
  updateUser,
  updateUserAdmin,
  deleteUser,
  deleteUserAdmin,
};
