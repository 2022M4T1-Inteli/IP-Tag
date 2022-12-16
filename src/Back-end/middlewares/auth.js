// Importando os modules necessários
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");

// Função que verifica se o token passado no headers da request é valido no sistema
const verifyToken = async (req, res, next) => {
  // Pegando o token enviado no headres da request
  const token = req.headers.authorization;

  // Response da request caso o token não tenha sido passado
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const { name } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = name;
    return next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

// Função que verifica se o id do usuário, que esta fazendo a resquest, possui no banco de dados a permissão de administrador do sistema
const verifyAdmin = async (req, res, next) => {
  // Pegando o token enviado no headres da request
  const token = req.headers.authorization;

  // Response da request caso o token não tenha sido passado
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const { name } = jwt.verify(token, process.env.JWT_SECRET);
    const db = await sqlite.open({
      filename: "./database/database.db",
      driver: sqlite3.Database,
    });

    const user = await db.get(`SELECT * \ FROM users \ WHERE id=${name}`);

    if (user.is_admin === 0) {
      throw new Error("Não possui permissão para essa atividade");
    }
    req.userId = name;

    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).send("Invalid Token");
  }
};

// Função que verifica se o token de dispositivo passado no headers da request é valido 
const verifyDevice = async (req, res, next) => {
  // Pegando o token enviado no headres da request
  const token = req.headers.authorization;

  // Response da request caso o token não tenha sido passado
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    if (jwt.verify(token, process.env.JWT_DEVICE)) {
      return next();
    }

    throw new Error("Dispositivo sem permissão");
  } catch (err) {
    console.log(err);
    return res.status(401).send("Invalid Token");
  }
};

module.exports = { verifyToken, verifyAdmin, verifyDevice };
