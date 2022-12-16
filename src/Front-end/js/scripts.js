let auth = window.localStorage.getItem("auth");
window.onload = function () {
  var duration = 2; // Converter para segundos
  document.getElementById("body-pd").style.display = "none";
  document
    .getElementById("body-pd")
    .insertAdjacentHTML(
      "beforebegin",
      '<div class="container-background" id="loader"><div class="loader"><div></div>'
    );

  startTimer(duration); // iniciando o timer
};

function startTimer(duration) {
  var timer = duration,
    seconds;
  var setIntervalo = setInterval(function () {
    seconds = parseInt(timer % 60, 10);
    if (--timer <= 0) {
      clearInterval(setIntervalo);
      document.getElementById("loader").remove();
      document.getElementById("body-pd").style.display = "flex";
      createNavbar();
    }
  }, 1000);
}

var $input = document.getElementById("image"),
  $fileName = document.getElementById("image-name");

if ($fileName) {
  $input.addEventListener("change", function () {
    $fileName.textContent = this.value;
  });
}

function Logout() {
  window.localStorage.removeItem("auth");
  window.location.href = "/view/login.html";
}

async function createNavbar() {
  await $.ajax({
    url: "http://localhost:3001/user/get",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      user = resul.message;
      GerenciarUsers = "";
      GerenciarDevices = "";
      if (!user.img) {
        user.img = "../images/avatar.png";
      }
      if (document.getElementById("nome")) {
        document.getElementById("nome").innerHTML = user.nome + "!";
      }
      // user.is_admin = false;
      if (user.is_admin == true) {
        GerenciarUsers =
          '<a href="view-users.html" class="nav_link" id="users"><i class="bx bxs-user nav_icon"></i><span class="nav_name">Usuários</span></a>';
        GerenciarDevices = "view-devices-adm.html";
      } else {
        GerenciarDevices = "view-devices.html";
      }
      $(`<header class="header" id="header">
              
              <div class="header_toggle" onclick="showNavbar()"> <i class='bx bx-menu' id="header-toggle"></i> </div>
              <div class="d-flex align-items-center"> <img class="img-navbar" src="${user.img}">
              <div class="dropdown">
                <a class="dropdown-navbar dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  ${user.nome}
                </a>
                <div class="dropdown-menu dropdown-right" aria-labelledby="dropdownMenuButton">
                  <a class="dropdown-item" href="user-profile.html"> Meu perfil</a>
                  <a class="dropdown-item" onclick="Logout()">Sair <i class="fa fa-sign-out" aria-hidden="true"></i></a>
                </div>
              </div>
            </div>
            </header>
            <div class="l-navbar" id="nav-bar">
              <nav class="nav">
                <div>
                  
                  <a href="dashboard.html" class="nav_logo">
                    <img class="logo-white" src="../images/logo-ipt-white.png">
                    <span class="nav-logo-name">IPTag</span>
                  </a>
                  <div class="nav_list">
                    <a href="dashboard.html" class="nav_link" id="dashboard">
                      <i class='bx bx-grid-alt nav_icon'></i>
                      <span class="nav_name">Dashboard</span>
                    </a>
          
                    <a href="notification.html" class="nav_link" id="notification">
                      <i id="bell" class='bx bx-bell nav_icon'></i>
                      <div class="number" id="number"></div>
                      <span class="nav_name">Notificações</span>
                    </a>
                    <a href="${GerenciarDevices}" class="nav_link" id="devices">
                      <i class='bx bx-search nav_icon'></i>
                      <span class="nav_name">Buscar</span>
                    </a>
                    ${GerenciarUsers}
          
                  </div>
                </div>
              </nav>
            </div>`).insertAfter("#body-pd");

      selectNavbar();
    },
  }).fail(function (err) {
    document.getElementById("body-pd").innerHTML =
      '<div class="row content-error"><div class="col-sm-12 justify-content-center"><h2 class="text-align-center">Erro de autenticação!</h2><img class="img-erro" src="../images/erro-404.jpg"><a class="btn-blue" href="login.html">Realizar login</a></div>';
    document.getElementById("body-pd").style.paddingLeft = 0;
  });
  await $.ajax({
    url: "http://localhost:3001/device/getCadastro",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      cadastro = resul.message;
      if (cadastro.length > 0) {
        document.getElementById("number").style.display = "flex";
        document.getElementById("number").innerHTML = cadastro.length;

      }
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

function showNavbar() {
  const toggle = document.getElementById("header-toggle"),
    nav = document.getElementById("nav-bar"),
    bodypd = document.getElementById("body-pd"),
    headerpd = document.getElementById("header");
  if (toggle && nav && bodypd && headerpd) {
    nav.classList.toggle("showw");
    toggle.classList.toggle("bx-x");
    bodypd.classList.toggle("body-pd");
    headerpd.classList.toggle("body-pd");
  }
}
