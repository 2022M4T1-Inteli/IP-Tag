// Importando os modules necessários
require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
const mqtt = require("mqtt");
// Objeto contendo as informações necessárias para a conexão com o MQTT
const options = {
  host: "602ff603e70c4e1b9a8888b7ee2c2402.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "gabcarneiro",
  password: "MR.mZ_Y8v46xxJE",
};

// Classe Device que contém todos os métodos que um dispositivo deve ter em nosso sistema
class Device {
  // Constructor que define todas as propriedades que um device tem
  constructor(
    nome,
    apelido,
    dt_instalacao,
    origem_predio,
    origem_sala,
    setor_origem,
    responsavel,
    tipo
  ) {
    (this.nome = nome),
      (this.apelido = apelido),
      (this.dtInstalacao = dt_instalacao),
      (this.origemPredio = origem_predio),
      (this.origemSala = origem_sala),
      (this.setorOrigem = setor_origem),
      (this.responsavel = responsavel),
      (this.tipo = tipo),
      (this.db = sqlite.open({
        filename: "./database/database.db",
        driver: sqlite3.Database,
      }));
  }

  // Método que adiciona no banco de dados os dados de um dispositivo na fila de cadastro
  async cadastroDevice(nome, mac_address) {
    // Instanciando a conexão com o banco de dados
    const db = await this.db;

    // Verificando se há algum dispositivo com o mesmo mac address que está sendo adicionado na fila e gerando um erro caso já exista na fila
    const device = await db.get(
      `SELECT * \ FROM cadastro_device \ WHERE mac_address="${mac_address}"`
    );
    if (device) {
      throw new Error("Dispositivo já na fila de cadastro");
    }

    // Verificando se há algum dispositivo com o mesmo mac address que está sendo adicionando na fila já registrado no banco de dados, caso exista, gerará um erro
    const deviceMainTable = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address="${mac_address}"`
    );
    if (deviceMainTable) {
      throw new Error("Dispositivo já cadastrado");
    }

    // Caso passe por todas as verificações, inserir na fila de cadastro o novo dispositivo
    const insertion = await db.run(
      `INSERT INTO cadastro_device (nome, mac_address) VALUES (?, ?)`,
      [nome, mac_address]
    );

    // Verificando se os dados foram inseridos com sucesso
    if (!insertion.changes) {
      throw new Error("Database error, try later");
    }

    // Mensagem de retorno
    const success = {
      type: "success",
      message: "Dispositivo inserido na fila de cadastro com sucesso",
    };

    return success;
  }

  // Método que completa o cadastro de um dispositivo que já estava na fila de cadastro
  async createDevice(id_cadastro) {
    // Realizando a conexão com o db
    const db = await this.db;

    // Verifica se o dispositivo que está terminando o cadastro esta na fila de cadastro, caso não esteja gera um erro
    const device_cadastro = await db.get(
      `SELECT * \ FROM cadastro_device \ WHERE id="${id_cadastro}"`
    );
    if (!device_cadastro) {
      throw new Error("Disposivo não existente na fila de cadastro");
    }

    // Erro gerado caso um mac address não tenha sido passado
    if (!device_cadastro.mac_address) {
      throw new Error("Disposivo não possui um mac_address válido");
    }

    // Pegando todos os dispositivos que possuem o nome que o usuário informou, caso exista, gera um erro
    const rowsNamesDevices = await db.all(
      `SELECT * \ FROM device \ WHERE nome = "${this.nome}"`
    );
    if (rowsNamesDevices[0]) {
      throw new Error("Dispositivo já existente");
    }

    // Verifica se já existe um dispositivo com o mesmo mac address já no banco de dados
    const rowsMacAddressDevices = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address = "${device_cadastro.mac_address}"`
    );
    if (rowsMacAddressDevices) {
      throw new Error("Dispositivo com esse mac_address já existente");
    }

    // Inserindo as informações no db
    const inserction = await db.run(
      "INSERT INTO device (nome, apelido, mac_address, dt_instalacao, origem_predio, origem_sala, setor_origem, responsavel, tipo) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        this.nome,
        this.apelido,
        device_cadastro.mac_address,
        this.dtInstalacao,
        this.origemPredio,
        this.origemSala,
        this.setorOrigem,
        this.responsavel,
        this.tipo,
      ]
    );

    // Checando se todas as informações foram inseridas no db
    if (inserction.changes === 0) {
      throw new Error("Database error");
    }

    // Removendo as informações do dispositivo que acabou de ser cadastrado da fila de cadastro
    const removal = await db.run(
      `DELETE \ FROM cadastro_device \ WHERE id="${id_cadastro}"`
    );
    if (!removal.changes) {
      throw new Error(
        "Dispositivos cadastrado com sucesso, mas não foi possível de remover o dispositivo da fila de cadastro, favor remové-lo novamente"
      );
    }

    // Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Device created with sucess",
    };

    return sucess;
  }

  // Método para pegar todos os dispositivos que estão na fila de cadastro
  async getAllDevicesCadastro() {
    // Realizando a conexão com o db
    const db = await this.db;

    // Pegando todos os dispositivos do banco de dados
    const devices = await db.all(
      `SELECT * \ FROM cadastro_device \ ORDER BY id DESC`
    );

    // Mensagem de erro caso não tenha nenhum dispositivo na fila de cadastro
    if (!devices[0]) {
      throw new Error("Nenhum dispositivo na fila de cadastro");
    }

    // Mensagem de retorno
    const success = {
      type: "success",
      message: devices,
    };

    return success;
  }

  // Método que pega um dispositivo específico do banco de dados
  async getDevice(nome, apelido, id, mac_address) {
    // Checando se algum dos parâmetros foram passados
    if (!nome && !apelido && !id && !mac_address) {
      throw new Error("Nothing passed to search");
    }
    // Realizando a conexão com o db
    const db = await this.db;

    // Pegando as informações do banco de dados de acordo com os parâmetros passados
    if (nome) {
      const deviceInfo = await db.all(
        `SELECT * \ FROM device \ WHERE nome = "${nome}"`
      );
      if (!deviceInfo[0]) {
        throw new Error("Nothing found for this device");
      }
      // Mensagem de retorno
      const sucess = {
        type: "sucess",
        message: deviceInfo,
      };

      return sucess;
    } else if (apelido) {
      const deviceInfo = await db.all(
        `SELECT * \ FROM device \ WHERE apelido = "${apelido}"`
      );
      if (!deviceInfo[0]) {
        throw new Error("Nothing found for this device");
      }
      // Mensagem de retorno
      const sucess = {
        type: "sucess",
        message: deviceInfo,
      };

      return sucess;
    } else if (id) {
      const deviceInfo = await db.all(
        `SELECT * \ FROM device \ WHERE id = "${id}"`
      );
      if (!deviceInfo[0]) {
        throw new Error("Nothing found for this device");
      }
      // Mensagem de retorno
      const sucess = {
        type: "sucess",
        message: deviceInfo,
      };

      return sucess;
    }
  }

  // Método que pega todos os dispositivos cadastrados no sistema
  async getDevices() {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Pegando todas as informações de todos os dispositivos que temos no banco de dados
    const devicesInfo = await db.all(
      `SELECT * \ FROM device \ ORDER BY id DESC`
    );

    // Mensagem de erro caso não tenha nada no banco de dados
    if (!devicesInfo) {
      throw new Error("Nothing found");
    }

    // Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: devicesInfo,
    };

    return sucess;
  }

  // Método para editar as informações de um dispositvo no banco de dados
  async editDevice(
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
  ) {
    // Chegando se alguma informação para ser editada foi passada, caso contrário gera um erro
    if (
      !nome &&
      !apelido &&
      !mac_address &&
      !dt_instalacao &&
      !origem_predio &&
      !origem_sala &&
      !setor_origem &&
      !responsavel &&
      !tipo &&
      !status &&
      !atual_predio &&
      !atual_sala &&
      !dt_rastreio &&
      !hr_rastreio &&
      !dt_atualizacao
    ) {
      throw new Error("Nothing to update");
    }
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Variável que armazenar todas querys necessárias para atualizar as informações necessárias
    let queryComponent = [];

    // Checando se existe o dispositivo no banco de dados que esta tentando atualizar os dados
    const device = await db.get(`SELECT * \ FROM device \ WHERE id = "${id}"`);
    if (!device) {
      throw new Error("Nothing in the database from this device");
    }

    // Checando quais informações foram passadas e adicionando ao array de query as respectivas querys para atualizar os respectivos campos no banco de dados

    if (nome) {
      const device = await db.all(
        `SELECT * \ FROM device \ WHERE nome = "${nome}" AND id != "${id}"`
      );
      if (device[0]) {
        throw new Error("This name already exist");
      } else {
        queryComponent.push(`nome="${nome}"`);
      }
    }
    if (apelido) {
      queryComponent.push(`apelido="${apelido}"`);
    }
    if (mac_address) {
      queryComponent.push(`mac_address="${mac_address}"`);
    }
    if (dt_instalacao) {
      queryComponent.push(`dt_instalacao="${dt_instalacao}"`);
    }
    if (origem_predio) {
      queryComponent.push(`origem_predio="${origem_predio}"`);
    }
    if (origem_sala) {
      queryComponent.push(`origem_sala="${origem_sala}"`);
    }
    if (setor_origem) {
      queryComponent.push(`setor_origem="${setor_origem}"`);
    }
    if (responsavel) {
      queryComponent.push(`responsavel="${responsavel}"`);
    }
    if (tipo) {
      queryComponent.push(`tipo="${tipo}"`);
    }
    if (status) {
      queryComponent.push(`status="${status}"`);
    }
    if (atual_predio) {
      queryComponent.push(`atual_predio="${atual_predio}"`);
    }
    if (atual_sala) {
      queryComponent.push(`atual_sala="${atual_sala}"`);
    }
    if (dt_rastreio) {
      queryComponent.push(`dt_rastreio="${dt_rastreio}"`);
    }
    if (hr_rastreio) {
      queryComponent.push(`hr_rastreio="${hr_rastreio}"`);
    }
    if (dt_atualizacao) {
      queryComponent.push(`dt_atualizacao="${dt_atualizacao}"`);
    }

    // Tratando as querys
    const queryJoined = queryComponent.join(",");

    // Atualizando as informações que foram passadas
    const update = await db.run(
      `UPDATE device \ SET ${queryJoined}, dt_atualizacao = Date('now', 'localtime') \ WHERE id="${id}"`
    );
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

  // Método que atualiza no banco de dados a localização de um dispositivo
  async moveDevice(mac_address_router, mac_address_moved) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Checando se os dispositivos que estão envolvidos la mudança existem no sistema, caso contrário geram um erro
    const routerDevice = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address = "${mac_address_router}"`
    );
    const movedDevice = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address="${mac_address_moved}"`
    );
    if (!routerDevice || !movedDevice) {
      throw new Error("Incorrect mac address");
    }

    // Variável que armazenar todas querys necessárias para atualizar as informações necessárias
    let querryComponents = [];

    // Armazenando no array as informações necessárias para a atualização no banco de dados
    querryComponents.push(
      `origem_predio="${movedDevice.atual_predio || movedDevice.origem_predio}"`
    );
    // Checagem dos dados para a adaquada alteração no banco de dados
    if (
      movedDevice.atual_sala === routerDevice.origem_sala &&
      movedDevice.atual_predio === routerDevice.origem_predio
    ) {
      movedDevice.atual_sala = null;
      movedDevice.atual_predio = null;
    }
    querryComponents.push(
      `origem_sala="${movedDevice.atual_sala || movedDevice.origem_sala}"`
    );
    querryComponents.push(`atual_predio="${routerDevice.origem_predio}"`);
    querryComponents.push(`atual_sala="${routerDevice.origem_sala}"`);

    // Tratando as querys
    const queryJoined = querryComponents.join(",");

    // Atualizando no banco de dados a localização dos dispositivos
    const insertions = await db.run(
      `UPDATE device \ SET ${queryJoined}, dt_rastreio = Date('now', 'localtime') , hr_rastreio = Time('now','localtime') \ WHERE mac_address = "${mac_address_moved}"`
    );

    // Mensagem de erro casa nada seja alterado no banco de dados
    if (insertions.changes === 0) {
      throw new Error("Database error, try later");
    }

    // Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Device moved with sucess",
    };

    return sucess;
  }

  // Método para deletar um dispositivo no sistema
  async deleteDevice(id) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;
    // Checando se foi passado um id, caso contrário, gerará um erro
    if (!id) {
      throw new Error("Any id provided");
    }

    // Checando se existe o dispositivo no sistema que está tentando ser deletado, caso contrário, gerará um erro
    const rowsId = await db.get(`SELECT * \ FROM device \ WHERE id = "${id}"`);
    if (!rowsId) {
      throw new Error("Device not found");
    }

    //Efetua a deleção
    const deletedDevice = await db.run(`DELETE FROM device WHERE id="${id}"`);
    //Verifica se a chamada para o DB ocorreu sem problemas
    if (deletedDevice.changes == 0) {
      throw new Error("Database Error, please try again later");
    }
    //Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Informations Deleted",
    };

    return sucess;
  }

  // Método para deletar um dispositivo da fila de cadastro
  async deleteCadastro(id) {
    // Realizando a conexão com o banco de dados
    const db = await this.db;

    // Checando se o dispositivo existe na fila de cadastro, caso contrário gerará um erro
    const device = await db.get(
      `SELECT * \ FROM cadastro_device \ WHERE id="${id}"`
    );
    if (!device) {
      throw new Error("Dispositivo não se encontra na fila");
    }

    // Deletando as informações do dispositivo da fila de cadastro, caso não aconteça, gerará um erro
    const insertions = await db.run(
      `DELETE \ FROM cadastro_device \ WHERE id="${id}"`
    );
    if (!insertions.changes) {
      throw new Error("Database error, try later");
    }

    //Mensagem de retorno
    const sucess = {
      type: "sucess",
      message: "Informations Deleted",
    };

    return sucess;
  }

  // Método para tocar um buzzer em um dispositivo específico
  async sendDevice(mac_address) {
    // Realizando a conexão com o mqtt
    var client = mqtt.connect(options);

    // Evento para checar se a conexão foi bem sucedida
    client.on("connect", () => {
      console.log("Foi");
    });

    // Enviando informações para o mqtt para que o dispositivo ative o buzzer
    if (client) {
      client.publish("BUZZER", `{ "mac_address": "${mac_address}" }`);
    }
    if (!client) {
      throw new Error("Error");
    }
  }

  // Método para atualizar a informação da quantidade de bateria do banco de dados
  async bateryDevice(mac_address, batery) {
    // Atualizando o banco de dados, caso não aconteça, gerará uma mensagem de erro
    const update = await db.run(
      `UPDATE device \ SET  bateria = ${batery} \ WHERE mac_address="${mac_address}"`
    );
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
}
module.exports = { Device };
