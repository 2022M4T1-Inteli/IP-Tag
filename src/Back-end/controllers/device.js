// Importando os modules necessários
const service = require("../services/device");
const { validationResult } = require("express-validator");
require("express-async-errors");

//Função para adicionar um dispositivo na fila de cadastro
const cadastroDevice = (req, res) => {
  // Pegando as informações passadas no body da request
  const { nome, mac_address } = req.body;

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .cadastroDevice(nome, mac_address)
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

// Função para completar o cadastro de um dispositivo que já esteja na fila de cadastro
const createDevice = (req, res) => {
  // Pegando as informações passadas no body da request
  const {
    id_cadastro,
    nome,
    apelido,
    dt_instalacao,
    origem_predio,
    origem_sala,
    setor_origem,
    responsavel,
    tipo,
  } = req.body;
  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device(
    nome,
    apelido,
    dt_instalacao,
    origem_predio,
    origem_sala,
    setor_origem,
    responsavel,
    tipo
  );

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Executando as função da classe e tratando os erros
  device
    .createDevice(id_cadastro)
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

// Função para pegar todos os dados dos dispositivos na fila de cadastro no banco de dados
const getAllDevicesCadastro = (req, res) => {
  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .getAllDevicesCadastro()
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

// Função que pega todas as informações do banco de dados de um dispositivo específico
const getDevice = (req, res) => {
  // Pegando os dados passados no headers da request
  const { nome, apelido, id } = req.headers;

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .getDevice(nome, apelido, id)
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

// Função que pega todos os dados de todos os dispositivos que temos no banco de dados
const getDevices = (req, res) => {
  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .getDevices()
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

// Função que atualiza campos de informações de um dispositvo em específico
const updateDevice = (req, res) => {
  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }
  // Pegando as informações passadas no body da request
  const {
    id,
    nome,
    apelido,
    mac_address,
    dt_instalacao,
    origem_predio,
    origem_sala,
    setor_origem,
    responsavel,
    tipo,
    status,
    atual_predio,
    atual_sala,
    dt_rastreio,
    hr_rastreio,
    dt_atualizacao,
  } = req.body;

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .editDevice(
      id,
      nome,
      apelido,
      mac_address,
      dt_instalacao,
      origem_predio,
      origem_sala,
      setor_origem,
      responsavel,
      tipo,
      status,
      atual_predio,
      atual_sala,
      dt_rastreio,
      hr_rastreio,
      dt_atualizacao
    )
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

// Função que vai atualizar no banco de dados o campo que armazena a localização de um dispositivo específico
const moveDevice = (req, res) => {
  // Pegando as informações passadas no body da request
  const { mac_address_router, mac_address_moved } = req.body;

  console.log(req.body);

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .moveDevice(mac_address_router, mac_address_moved)
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

// Função para deletar todas as informações do banco de dados de um dispositivo
const deleteDevice = (req, res) => {
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

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .deleteDevice(id)
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

// Função para deletar todas as informações do banco de dados de um dispostivo que esteja na fila de cadastro
const deleteCadastro = (req, res) => {
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

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .deleteCadastro(id)
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

// Função para tocar um buzzer em um dispositivo específico
const sendDevice = (req, res) => {
  // Pegando as informações passadas no body da request
  const { mac_address } = req.body;

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .sendDevice(mac_address)
    .then((resul) => {
      res.status(200).json({
        message: resul,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

// Função para atualizar no banco de dados o campo que armazena a informação da quantidade de bateria de um dispositivo específico
const bateryDevice = (req, res) => {
  // Pegando as informações passadas no body da request
  const { mac_address, batery } = req.body;

  // Verificando se todos os body obrigatórios foram enviados
  const errors = validationResult(req);
  // Response caso não seja enviado as informações obrigatórias
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.errors[0].msg,
    });
  }

  // Instanciando um objeto advindo da clase Device que contém todas as funções para cada rota
  const device = new service.Device();

  // Executando as função da classe e tratando os erros
  device
    .bateryDevice(mac_address, batery)
    .then((resul) => {
      res.status(200).json({
        message: resul,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
      });
    });
};

module.exports = {
  cadastroDevice,
  createDevice,
  getAllDevicesCadastro,
  getDevice,
  getDevices,
  updateDevice,
  deleteDevice,
  deleteCadastro,
  moveDevice,
  sendDevice,
  bateryDevice,
};
