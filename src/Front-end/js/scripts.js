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
  debugger
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
      if(document.getElementById("nome")){        
        document.getElementById("nome").innerHTML = user.nome + "!";
      }
      // user.is_admin = false;
      if (user.is_admin == true) {
        GerenciarUsers =
          '<a href="view-users.html" class="nav_link" id"users"><i class="bx bxs-user nav_icon"></i><span class="nav_name">Usuários</span></a>';
          GerenciarDevices = "view-devices-adm.html";
      }else{
        GerenciarDevices = "view-devices.html";
      }
      $(`<header class="header" id="header">
              
              <div class="header_toggle" onclick="showNav()"> <i class='bx bx-menu' id="header-toggle"></i> </div>
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
                  
                  <a href="#" class="nav_logo">
                    <img class="logo-white" src="../images/logo-ipt-white.png">
                    <span class="nav-logo-name">IPTag</span>
                  </a>
                  <div class="nav_list">
                    <a href="dashboard.html" class="nav_link active" id="dashboard">
                      <i class='bx bx-grid-alt nav_icon'></i>
                      <span class="nav_name">Dashboard</span>
                    </a>
          
                    <a href="notification.html" class="nav_link" id="notification">
                      <i class='bx bx-bell nav_icon'></i>
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
    },
  }).fail(function (err) {
    document.getElementById("body-pd").innerHTML =
      '<div class="row content-error"><div class="col-sm-12 justify-content-center"><h2 class="text-align-center">Erro de autenticação!</h2><img class="img-erro" src="../images/erro-404.jpg"><a class="btn-blue" href="login.html">Realizar login</a></div>';
    document.getElementById("body-pd").style.paddingLeft = 0;
  });
}

const showNavbar = (toggleId, navId, bodyId, headerId) => {
  const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId),
    bodypd = document.getElementById(bodyId),
    headerpd = document.getElementById(headerId);

  // Validate that all variables exist
  if (toggle && nav && bodypd && headerpd) {
    toggle.addEventListener("click", () => {
      // show navbar
      nav.classList.toggle("showw");
      // change icon
      toggle.classList.toggle("bx-x");
      // add padding to body
      bodypd.classList.toggle("body-pd");
      // add padding to header
      headerpd.classList.toggle("body-pd");
    });
  }
};

/*===== LINK ACTIVE =====*/
const linkColor = document.querySelectorAll(".nav_link");

function colorLink() {
  if (linkColor) {
    linkColor.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  }
}
linkColor.forEach((l) => l.addEventListener("click", colorLink));

// Your code to run since DOM is loaded and ready

function showNav() {
  showNavbar("header-toggle", "nav-bar", "body-pd", "header");
}
