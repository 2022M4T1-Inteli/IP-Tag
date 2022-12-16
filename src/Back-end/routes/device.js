// Importando os modules necessários
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

// Nossas rotas estão estruturadas da seguinte forma:
//    - A verificação das propriedas obrigatórias que o body da request deve receber está
//      sendo feito com a biblioteca "express-validator". O erro gerado caso não sejam
//      enviadas essas informações está sendo tratado no respectivo controller.
//    - Assim que a rota recebe um request (as que necessitam de um controle de acesso)
//      executa uma função criada no file auth em middlewares para chegar se um token JWT
//      foi enviado no headers da request, caso contrário, a request não irá prosseguir.
//    - Após a verificação de controle (caso ela exista), é executado uma função para a
//      respectiva rota no file dessas rotas (device) na pasta controllers, o qual é
//      responsável por realizar as tarefas dessa rota.

//Importações de outros arquivos necessárias
const deviceController = require("../controllers/device");
const {
  verifyToken,
  verifyAdmin,
  verifyDevice,
} = require("../middlewares/auth");

//ROTAS com seus respectivos controllers e middlewares
// Rota para adicionar um dispositivo na fila de espera de cadastro
router.post(
  "/cadastro",
  [
    body("nome", "Nome do dispositivo é necessário").exists({
      checkFalsy: true,
    }),
  ],
  [
    body("mac_address", "Mac address do dispositivo é necessário").exists({
      checkFalsy: true,
    }),
  ],
  verifyDevice,
  deviceController.cadastroDevice
);
// Rota para completar o cadastro de um dispositivo caso ele já esteja na fila de espera
router.post(
  "/create",
  [
    body("id_cadastro", "id do dispositivo na fila é necessário").exists({
      checkFalsy: true,
    }),
  ],
  [body("nome", "nome é necessário").exists({ checkFalsy: true })],
  [
    body(
      "dt_instalacao",
      "data de instalação do dispositivo é necessária"
    ).exists({
      checkFalsy: true,
    }),
  ],
  [
    body(
      "origem_predio",
      "prédio de origem do dispositivo é necessário"
    ).exists({ checkFalsy: true }),
  ],
  [
    body("origem_sala", "sala de origem do dispositivo é necessária").exists({
      checkFalsy: true,
    }),
  ],
  [
    body("setor_origem", "setor de origem do dispositivo é necessário").exists({
      checkFalsy: true,
    }),
  ],
  [
    body("responsavel", "responsavel do dispositivo é necessário").exists({
      checkFalsy: true,
    }),
  ],
  [
    body("tipo", "tipo do dispositivo é necessário").exists({
      checkFalsy: true,
    }),
  ],
  verifyAdmin,
  deviceController.createDevice
);
// Rota para atualizar a mudança de localização de um dispositivo
router.post(
  "/move",
  [
    body(
      "mac_address_moved",
      "mac address do dispositivo que se moveu é necessário"
    ).exists({ checkFalsy: true }),
  ],
  [
    body(
      "mac_address_router",
      "mac address do dispositivo que se moveu é necessário"
    ).exists({ checkFalsy: true }),
  ],
  verifyDevice,
  deviceController.moveDevice
);
// Rota para pegar todos os dispositivos na fila de cadastro
router.get("/getCadastro", verifyAdmin, deviceController.getAllDevicesCadastro);
// Rota para pegar um dispositivo que já está cadastrado
router.get("/get", verifyToken, deviceController.getDevice);
// Rota para pegar todos os dispositivos que já estão cadastrados
router.get("/getDevices", verifyToken, deviceController.getDevices);
// Rota para alterar as informações de um dispositivo específico já cadastrado
router.put(
  "/update",
  [body("id", "id é necessário").exists({ checkFalsy: true })],
  verifyAdmin,
  deviceController.updateDevice
);
// Rota para deletar todas as informações de um dispositivo já cadastrado
router.delete(
  "/delete",
  [body("id", "id é necessário").exists({ checkFalsy: true })],
  verifyAdmin,
  deviceController.deleteDevice
);
// Rota para deletar um disposivo que está na fila de cadastro
router.delete(
  "/deleteCadastro",
  [body("id", "id é necessário").exists({ checkFalsy: true })],
  verifyAdmin,
  deviceController.deleteCadastro
);
// Rota para que um buzzer seja tocado em um dispositivo
router.post(
  "/send",
  [body("mac_address", "id é necessário").exists({ checkFalsy: true })],
  verifyDevice,
  deviceController.sendDevice
);
// Rota para atualizar a quantidade de bateria restante
router.post(
  "/batery",
  [
    body("mac_address", "mac_address do dispositivo é necessário").exists({
      checkFalsy: true,
    }),
  ],
  [
    body("batery", "quantia de bateria é necessária").exists({
      checkFalsy: true,
    }),
  ],
  verifyDevice,
  deviceController.bateryDevice
);

//Exporta o ROUTER
module.exports = router;
