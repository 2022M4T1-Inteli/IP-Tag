// Importando os modules necessários
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
// Classe User que contém todos os métodos que um usuário deva ter em nosso sistema
class User {
  // Constructor que define as propriedas da classe e seus valores
  constructor(nome, setor, cargo, email, senha) {
    this.name = nome;
    this.sector = setor;
    this.role = cargo;
    this.email = email;
    this.password = senha;
    this.db = open({
      filename: "./database/database.db",
      driver: sqlite3.Database,
    });
  }

  // Método para criar um usuário no sistema
  async createUser() {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Pegando todos os usuários que possuem o email que o usuário informou, caso tenha, gerará uma mensagem de erro
    const rowsEmailUser = await db.all(
      `SELECT * \ FROM users \ WHERE email = "${this.email}"`
    );
    if (rowsEmailUser[0]) {
      throw new Error("Usuário já existente com esse email");
    }

    // Encriptando a senha do usuário caso ele tenha passado a senha
    const hashedPassword = await bcrypt.hash(this.password, 8);
    this.password = hashedPassword;

    // Inserindo as informações no db
    const inserction = await db.run(
      "INSERT INTO users (nome, setor, cargo, email, senha) VALUES (?,?,?,?,?)",
      [this.name, this.sector, this.role, this.email, this.password]
    );

    // Checando se todas as informações foram inseridas no db
    if (inserction.changes === 0) {
      throw new Error("Database error");
    }

    // Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "User created with sucess",
    };

    return sucess;
  }

  // Método para gerar um token JWT para dar acesso ao usuário às features do sistema
  async login(emailAuth, passwordAuth) {
    let token;

    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Checando as informações que o usuário passou com as informações que temos no banco de dados
    const user = await db.get(
      `SELECT * \ FROM users \ WHERE email='${emailAuth}'`
    );
    if (!user) {
      throw new Error("User does't exists");
    }
    let passwordMatch = await bcrypt.compare(passwordAuth, user.senha);
    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    // Caso as informações estejam corretas, gerará um JWT que expirará em 1h
    token = await jwt.sign(
      {
        name: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Mensagem de retorno
    const sucess = {
      type: "success",
      token,
      message: "Token created with success",
    };

    return sucess;
  }

  // Método que irá pegar todas as informações de um usuário específico
  async getUser(userId) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Pegando as informações do banco de dados
    const userInfo = await db.get(
      `SELECT * \ FROM users \ WHERE id = "${userId}"`
    );
    // Mensagem de erro caso não não tenha nada no banco de dados
    if (!userInfo) {
      throw new Error("Nothing found for this user");
    }

    // Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: userInfo,
    };

    return sucess;
  }

  // Método que irá pegar todas as informações de todos os usuários do sistema
  async getUsers() {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Pegando todas as informações do banco de dados
    const userInfo = await db.all(`SELECT * \ FROM users \ ORDER BY id DESC`);
    // Mensagem de erro caso não pegue nada no banco de dados
    if (!userInfo) {
      throw new Error("Nothing found for this user");
    }

    // Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: userInfo,
    };

    return sucess;
  }

  // Método para editar algumas informações do usuário no banco de dados
  async editUser(userId, nome, setor, cargo, email) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Variável que irá conter todas as querys respectivas das informações que o usuário deseja atualizar
    let queryComponent = [];

    // Chegando quais informações o usuário passou e armazenando a respectiva query no array
    if (!userId) {
      throw new Error("Invalid user");
    }

    const user = await db.get(`SELECT * \ FROM users \ WHERE id = "${userId}"`);

    if (!user) {
      throw new Error("Nothing in the database from this user");
    }

    if (nome) {
      queryComponent.push(`nome="${nome}"`);
    }
    if (setor) {
      queryComponent.push(`setor="${setor}"`);
    }
    if (cargo) {
      queryComponent.push(`cargo="${cargo}"`);
    }
    if (email) {
      queryComponent.push(`email="${email}"`);
    }

    if (!nome && !setor && !cargo && !email) {
      throw new Error("Nothing to update");
    }

    // Tratando as querys armazenadas
    const queryJoined = queryComponent.join(",");

    const update = await db.run(
      `UPDATE users SET ${queryJoined} WHERE id="${userId}"`
    );
    // Mensagem de erro caso nada seja atualizado no banco de dados
    if (update.changes === 0) {
      throw new Error("Database Error, please try again late");
    }
    //Informa a atualização
    const sucess = {
      type: "sucess",
      message: "Informations Updated",
    };

    return sucess;
  }

  // Método para atualizar a condição administrador no sistema
  async editUserAdmin(is_admin, userId) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Variável para armazenar as querys necessárias para atualizar as informações no banco de dados
    let queryComponent = [];

    // Checando se a informação a ser atualizada para é valida
    if (is_admin !== 0 && is_admin !== 1) {
      throw new Error("Condição não válida para ser atualizada no sistema");
    }

    // Tratando a query
    queryComponent.push(`is_admin=${is_admin}`);
    const queryJoined = queryComponent.join(",");

    // Atualizando as informações no banco de dados
    const update = await db.run(
      `UPDATE users SET ${queryJoined} WHERE id="${userId}"`
    );
    // Erro caso nada seja atualizado no banco de dados
    if (update.changes === 0) {
      throw new Error("Database Error, please try again later");
    }
    //Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Informations Updated",
    };

    return sucess;
  }

  // Método que deleta um usuário específico do sistema
  async deleteUser(userId) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Checando se foi passado um id
    if (!userId) {
      throw new Error("Invalid user");
    }

    // Checando se o usuário a ser deletado do sistema existe, se não existir, gerará um erro
    const rowsId = await db.get(
      `SELECT * \ FROM users \ WHERE id = "${userId}"`
    );
    if (!rowsId) {
      throw new Error("User not found");
    }

    //Efetua a deleção
    const deletedUser = await db.run(`DELETE FROM users WHERE id="${userId}"`);
    //Verifica se a chamada para o DB ocorreu sem problemas
    if (deletedUser.changes == 0) {
      throw new Error("Database Error, please try again later");
    }
    //Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Informations Deleted",
    };

    return sucess;
  }

  // Metódo para deletar um usuário escolhido por um admin do sistema
  async deleteUserAdmin(userId) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Checando se o usuário a ser deletado existe
    const rowsId = await db.get(
      `SELECT * \ FROM users \ WHERE id = "${userId}"`
    );
    if (!rowsId) {
      throw new Error("User not found");
    }

    //Efetua a deleção
    const deletedUser = await db.run(`DELETE FROM users WHERE id="${userId}"`);
    //Verifica se a chamada para o DB ocorreu sem problemas
    if (deletedUser.changes == 0) {
      throw new Error("Database Error, please try again later");
    }
    //Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Informations Deleted",
    };

    return sucess;
  }
}
module.exports = { User };
