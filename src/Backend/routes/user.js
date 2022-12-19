// Importando os modules necessários
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

//Importações de outros arquivos necessárias
const userController = require("../controllers/user");
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

// Nossas rotas estão estruturadas da seguinte forma:
//    - A verificação das propriedas obrigatórias que o body da request deve receber está
//      sendo feito com a biblioteca "express-validator". O erro gerado caso não sejam
//      enviadas essas informações está sendo tratado no respectivo controller.
//    - Assim que a rota recebe um request (as que necessitam de um controle de acesso)
//      executa uma função criada no file auth em middlewares para chegar se um token JWT
//      foi enviado no headers da request, caso contrário, a request não irá prosseguir.
//    - Após a verificação de controle (caso ela exista), é executado uma função para a
//      respectiva rota no file dessas rotas (user) na pasta controllers, o qual é
//      responsável por realizar as tarefas dessa rota.

// ROTAS com seus respectivos controllers e middlewares
// Rota para criar um usuário no nosso sistema
router.post(
  "/create",
  [body("nome", "nome é necessário").exists({ checkFalsy: true })],
  [body("setor", "setor é necessário").exists({ checkFalsy: true })],
  [body("cargo", "cargo é necessário").exists({ checkFalsy: true })],
  [body("email", "email é necessário").exists({ checkFalsy: true })],
  [body("senha", "senha é necessária").exists({ checkFalsy: true })],
  verifyAdmin,
  userController.createUser
);

// Rota para login, responsável por gerar o JWT para controle de acesso das demais rotas
router.post(
  "/login",
  [body("email", "email é necessário").exists({ checkFalsy: true })],
  [body("senha", "senha é necessária").exists({ checkFalsy: true })],
  userController.login
);
// Rota para pegar as informações de um usuário específico
router.get("/get", verifyToken, userController.getUser);
//Rota para pegar as informações de todos os usuários do sistema
router.get("/getUsers", verifyAdmin, userController.getUsers);
// Rota para atualizar as informações de um usuário específico
router.put("/update", verifyToken, userController.updateUser);
// Rota para atualizar se um usuário é administrador ou não
router.put("/updateAdmin", verifyAdmin, userController.updateUserAdmin);
// Rota para deletar todas as informações do próprio usuário que a chamou
router.delete("/delete", verifyToken, userController.deleteUser);
// Rota para deletar todas as informações de qualquer usuário do sistema
router.delete(
  "/deleteAdmin",
  [body("id", "id de usuário é necessário").exists({ checkFalsy: true })],
  verifyAdmin,
  userController.deleteUserAdmin
);

//Exporta o ROUTER
module.exports = router;
