loadNotifications();
async function loadNotifications() {
  await $.ajax({
    url: "http://localhost:3001/device/getCadastro",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      devices = resul.message;
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
  listNotification(devices);
}
async function listNotification(devices) {
  console.log(devices);
  for (i = 0; i < devices.length; i++) {
    document.getElementById("notifications").innerHTML += `
        <a href="register-device.html?id=${devices[i].id}" class="notification">
        <div class="content-notification mt-2 mb-2 align-items-center">
          <div class="row">
            <img
              class="white-notification-img-device"
              src="../images/device.png"
              alt="Device"
            />
          </div>
          <div class="row">
            <div class="d-flex">
              <span class="white-notification-name">${devices[i].nome} </span
              ><span class="white-notification-description">
                disponível para finalizar configuração no
                sistema</span
              >
            </div>
          </div>
        </div>
      </a>
            `;
  }
}
function selectNavbar() {
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("notification").classList.add("active");
}
