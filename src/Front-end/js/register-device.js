const params = new URLSearchParams(window.location.search);
deviceId = params.get("id");

function saveDispositivo() {
  document.getElementById("body-pd").style.display = "none";
  document
    .getElementById("body-pd")
    .insertAdjacentHTML(
      "beforebegin",
      '<div class="container-background" id="loader"><div class="loader"><div></div>'
    );
  startTimer(3);
  campos = [
    "nome",
    "data_instalação",
    "apelido",
    "predio_origem",
    "sala_origem",
    "setor",
    "responsavel",
    "setor_responsavel",
    "tipo",
  ];
  data = {
    nome: $("#nome").val(),
    apelido: $("#apelido").val(),
    data_instalação: $("#data_instalação").val(),
    predio_origem: $("#predio_origem").val(),
    sala_origem: $("#sala_origem").val(),
    setor: $("#setor").val(),
    responsavel: $("#responsavel").val(),
    tipo: $("#tipo").val(),
  };
  console.log(data);
  campos_nomenclatura = [
    "Nome do dispositivo",
    "Data de instalação",
    "Apelido",
    "Prédio de origem",
    "Sala de origem",
    "Setor",
    "Responsável",
  ];
  var erros = [];
  for (i = 0; i < campos.length; i++) {
    if (!data[campos[i]]) {
      erros.push(campos_nomenclatura[i]);
    }
  }
  if (!erros.length) {
    $.ajax({
      url: "http://localhost:3001/device/create",
      type: "POST",
      headers: { Authorization: ` ${auth}` },
      data: {
        id_cadastro: deviceId,
        nome: $("#nome").val(),
        apelido: $("#apelido").val(),
        dt_instalacao: $("#data_instalação").val(),
        origem_predio: $("#predio_origem").val(),
        origem_sala: $("#sala_origem").val(),
        setor_origem: $("#setor").val(),
        responsavel: $("#responsavel").val(),
        tipo: $("#tipo").val(),
      },
      success: async function (resul) {
        console.log(resul.message);
        window.location.href = '/view/view-devices-adm.html';
      },
      error: function (err) {
        console.log(err);
        $("#error").html(
          `<div class="alert alert-danger" role="alert">${err.responseJSON.error}</div>`
        );
      },
    });
  } else {
    var error = "Campo ";
    for (i = 0; i < erros.length; i++) {
      if (erros.length != 0) {
        error = error + erros[i] + ", ";
      }
    }
    document.getElementById("erros").innerHTML = "";
    document.getElementById(
      "erros"
    ).innerHTML += `<div class="alert alert-danger" role="alert">
         ${error} estão vazio!
      </div>`;
  }
}
function selectNavbar() {
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("devices").classList.add("active");
}