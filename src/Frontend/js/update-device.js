const params = new URLSearchParams(window.location.search);
deviceId = params.get("id");
loadDevice(deviceId);
async function loadDevice(deviceId) {
  await $.ajax({
    url: "http://localhost:3001/device/get",
    headers: { Authorization: ` ${auth}`, id: deviceId },
    success: function (resul) {
      device = resul.message[0];
      console.log(device);

      $("#nome").val(device.nome);
      $("#apelido").val(device.apelido);
      $("#data_instalação").val(device.dt_instalacao);
      $("#predio_origem").val(device.origem_predio);
      $("#sala_origem").val(device.origem_sala);
      $("#setor").val(device.origem_sala);
      $("#responsavel").val(device.responsavel);
      $("#mac_address").val(device.mac_address);
      $("#tipo").val(device.tipo);
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}
$("#back").click(function () {
  window.location.href = "/view/view-device-adm.html?id=" + deviceId;
});

$("#save").click(function () {
  updateDevice();
});

function updateDevice() {
  document.getElementById("body-pd").style.display = "none";
  document
    .getElementById("body-pd")
    .insertAdjacentHTML(
      "beforebegin",
      '<div class="container-background" id="loader"><div class="loader"><div></div>'
    );
  startTimer(3);
  $.ajax({
    url: "http://localhost:3001/device/update",
    type: "PUT",
    headers: { Authorization: ` ${auth}` },
    data: {
      id: deviceId,
      nome: $("#nome").val(),
      apelido: $("#apelido").val(),
      dt_instalacao: $("#data_instalação").val(),
      predio_origem: $("#predio_origem").val(),
      sala_origem: $("#sala_origem").val(),
      setor: $("#setor").val(),
      responsavel: $("#responsavel").val(),
      mac_address: $("#mac_address").val(),
      tipo: $("#tipo").val(),
    },
    success: async function (resul) {
      window.location.href = "/view/view-device-adm.html?id=" + deviceId;
    },
    error: function (err) {
      console.log(err);
    },
  });
}
function selectNavbar() {
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("devices").classList.add("active");
}
