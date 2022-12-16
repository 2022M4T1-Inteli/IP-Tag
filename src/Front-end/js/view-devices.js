loadDevices();
let Alldevices;
async function loadDevices() {
  await $.ajax({
    url: "http://localhost:3001/device/getDevices",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      devices = resul.message;
      listDevices(devices);
      Alldevices = devices;
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

async function listDevices(devices) {
  for (i = 0; i < devices.length; i++) {
    document.getElementById("list-devices").innerHTML += `
    <div class="col-sm-12 col-md-6 col-lg-3 mt-4">
              <div class="white-card align-items-center">
                <div class="d-flex">
                  <div class="row">
                    <img class="white-card-img-device" src="../images/device.png" alt="Device">
                  </div>
                  <div class="row">
                    <span class="white-card-name-device">${devices[i].nome}</span>
                    <span class="white-card-nickname-device">${devices[i].apelido}</span>
                  </div>
                  <div class="row">
                    <div>
                      <div class="square-green"></div>
                    </div>
                  </div>
                </div>
                <div class="row align-items-center mt-4">
                  <label class="white-card-label-device">${devices[i].origem_predio}</label>
                  <label class="white-card-label-device">${devices[i].origem_sala}</label>
                </div>
                <div class="row justify-content-between mt-4">
                  <span class="white-card-time-device">${devices[i].hr_rastreio}</span>
                  <div class="d-flex align-items-center w-max">
                    <a href="#" class="white-card-see-device" onclick="viewDevice(${devices[i].id})">Ver mais</a>
                    <img class="white-card-see-arrow-device" src="../images/arrow-right.png" alt="Ver mais">
                  </div>
                </div>
              </div>
            </div>

`;
  }
}

function viewDevice(deviceId) {
  window.location.href = `/view/view-device.html?id=${deviceId}`;
}

function searchInput(valToSearch) {
  if (valToSearch == "") {
    document.getElementById("list-devices").innerHTML = "";
    document.getElementById("pagination").innerHTML = "";
    loadDevices();
  } else {
    document.getElementById("list-devices").innerHTML = "";
    Alldevices = Alldevices.filter((val) => {
      return val.nome.toLowerCase().includes(valToSearch.toLowerCase());
    });

    if (Alldevices) {
      document.getElementById("pagination").innerHTML = "";

      listDevices(Alldevices);
    } else {
      document.getElementById("pagination").innerHTML = "";
      document.getElementById("list-devices").innerHTML =
        "<h1> Não dispositivo encontrado</h1>";
    }
  }
}
