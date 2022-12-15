require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");

const mqtt = require("mqtt");

const options = {
  host: "602ff603e70c4e1b9a8888b7ee2c2402.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "gabcarneiro",
  password: "MR.mZ_Y8v46xxJE",
};

class Device {
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

  async cadastroDevice(nome, mac_address) {
    const db = await this.db;

    const device = await db.get(
      `SELECT * \ FROM cadastro_device \ WHERE mac_address="${mac_address}"`
    );

    if (device) {
      throw new Error("Dispositivo já na fila de cadastro");
    }

    const deviceMainTable = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address="${mac_address}"`
    );

    if (deviceMainTable) {
      throw new Error("Dispositivo já cadastrado");
    }

    const insertion = await db.run(
      `INSERT INTO cadastro_device (nome, mac_address) VALUES (?, ?)`,
      [nome, mac_address]
    );

    if (!insertion.changes) {
      throw new Error("Database error, try later");
    }

    const success = {
      type: "success",
      message: "Dispositivo inserido na fila de cadastro com sucesso",
    };

    return success;
  }

  async createDevice(id_cadastro) {
    // Pegando a instancia do db
    const db = await this.db;

    const device_cadastro = await db.get(
      `SELECT * \ FROM cadastro_device \ WHERE id="${id_cadastro}"`
    );

    if (!device_cadastro) {
      throw new Error("Disposivo não existente na fila de cadastro");
    }

    if (!device_cadastro.mac_address) {
      throw new Error("Disposivo não possui um mac_address válido");
    }

    // Pegando todos os dispositivos que possuem o nome que o usuário informou
    const rowsNamesDevices = await db.all(
      `SELECT * \ FROM device \ WHERE nome = "${this.nome}"`
    );

    if (rowsNamesDevices[0]) {
      throw new Error("Dispositivo já existente");
    }

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

    const removal = await db.run(
      `DELETE \ FROM cadastro_device \ WHERE id="${id_cadastro}"`
    );

    if (!removal.changes) {
      throw new Error(
        "Dispositivos cadastrado com sucesso, mas não foi possível de remover o dispositivo da fila de cadastro, favor remové-lo novamente"
      );
    }

    const sucess = {
      type: "sucess",
      message: "Device created with sucess",
    };

    return sucess;
  }

  async getAllDevicesCadastro() {
    const db = await this.db;

    const devices = await db.all(
      `SELECT * \ FROM cadastro_device \ ORDER BY id DESC`
    );

    if (!devices[0]) {
      throw new Error("Nenhum dispositivo na fila de cadastro");
    }

    const success = {
      type: "success",
      message: devices,
    };

    return success;
  }

  async getDevice(nome, apelido, id, mac_address) {
    if (!nome && !apelido && !id && !mac_address) {
      throw new Error("Nothing passed to search");
    }
    // Pegando a instancia do db
    const db = await this.db;

    if (nome) {
      const deviceInfo = await db.all(
        `SELECT * \ FROM device \ WHERE nome = "${nome}"`
      );
      if (!deviceInfo[0]) {
        throw new Error("Nothing found for this device");
      }
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
      const sucess = {
        type: "sucess",
        message: deviceInfo,
      };

      return sucess;
    }
  }

  async getDevices() {
    // Pegando a instancia do db
    const db = await this.db;

    const devicesInfo = await db.all(
      `SELECT * \ FROM device \ ORDER BY id DESC`
    );

    if (!devicesInfo) {
      throw new Error("Nothing found");
    }

    const sucess = {
      type: "sucess",
      message: devicesInfo,
    };

    return sucess;
  }

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
    // Pegando a instancia do db
    const db = await this.db;

    let queryComponent = [];

    const device = await db.get(`SELECT * \ FROM device \ WHERE id = "${id}"`);

    if (!device) {
      throw new Error("Nothing in the database from this device");
    }

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

    const queryJoined = queryComponent.join(",");

    const update = await db.run(
      `UPDATE device \ SET ${queryJoined}, dt_atualizacao = Date('now', 'localtime') \ WHERE id="${id}"`
    );
    if (update.changes === 0) {
      throw new Error("Database Error, please try again later");
    }
    //Informa a atualização
    const sucess = {
      type: "sucess",
      message: "Informations Updated",
    };

    return sucess;
  }

  async moveDevice(mac_address_router, mac_address_moved) {
    // Pegando a instancia do db
    const db = await this.db;

    const routerDevice = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address = "${mac_address_router}"`
    );

    const movedDevice = await db.get(
      `SELECT * \ FROM device \ WHERE mac_address="${mac_address_moved}"`
    );

    if (!routerDevice || !movedDevice) {
      throw new Error("Incorrect mac address");
    }

    let querryComponents = [];

    querryComponents.push(
      `origem_predio="${movedDevice.atual_predio || movedDevice.origem_predio}"`
    );
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

    const queryJoined = querryComponents.join(",");

    const insertions = await db.run(
      `UPDATE device \ SET ${queryJoined}, dt_rastreio = Date('now', 'localtime') , hr_rastreio = Time('now','localtime') \ WHERE mac_address = "${mac_address_moved}"`
    );

    if (insertions.changes === 0) {
      throw new Error("Database error, try later");
    }

    const sucess = {
      type: "sucess",
      message: "Device moved with sucess",
    };

    return sucess;
  }

  async deleteDevice(id) {
    // Pegando a instancia do db
    const db = await this.db;
    if (!id) {
      throw new Error("Any id provided");
    }

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
    //Mostra a validação de que o usuário foi deletado
    const sucess = {
      type: "sucess",
      message: "Informations Deleted",
    };

    return sucess;
  }

  async deleteCadastro(id) {
    const db = await this.db;

    const device = await db.get(
      `SELECT * \ FROM cadastro_device \ WHERE id="${id}"`
    );

    if (!device) {
      throw new Error("Dispositivo não se encontra na fila");
    }

    const insertions = await db.run(
      `DELETE \ FROM cadastro_device \ WHERE id="${id}"`
    );

    if (!insertions.changes) {
      throw new Error("Database error, try later");
    }
  }

  async sendDevice(mac_address) {
    var client = mqtt.connect(options);

    client.on("connect", () => {
      console.log("Foi");
    });

    if (client) {
      client.publish("BUZZER", `{ "mac_address": "${mac_address}" }`);
    }
    if (!client) {
      throw new Error("Error");
    }
  }
  async bateryDevice(mac_address, batery) {
    const update = await db.run(
      `UPDATE device \ SET  bateria = ${batery} \ WHERE mac_address="${mac_address}"`
    );
    if (update.changes === 0) {
      throw new Error("Database Error, please try again later");
    }
    //Informa a atualização
    const sucess = {
      type: "sucess",
      message: "Informations Updated",
    };

    return sucess;
  }
}
module.exports = { Device };
