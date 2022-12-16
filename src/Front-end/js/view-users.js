loadUsers();
let Allusers;
async function loadUsers() {
  await $.ajax({
    url: "http://localhost:3001/user/getUsers",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      users = resul.message;
      Allusers = users;
      listUsers(users);
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

async function listUsers(users) {
  for (i = 0; i < users.length; i++) {
    if (!users[i].img) {
      users[i].img = "../images/avatar.png";
    }
    document.getElementById("list-users").innerHTML += `
      <div class="col-sm-12 col-md-6 col-lg-3 mt-3">
      <div class="white-card align-items-center">

        <div class="row">
          <img class="white-card-img-avatar" src="${users[i].img}" alt="avatar">
        </div>
        <div class="row mt-2">
          <span class="white-card-name-avatar d-flex justify-content-center">${users[i].nome}</span>
        </div>


        <div class="row align-items-center mt-2">
          <label class="white-card-label-device">${users[i].cargo}</label>
          <label class="white-card-label-device">${users[i].setor}</label>
        </div>
        <div class="row justify-content-between align-items-center mt-4">
          <span class="white-card-time-device">2 min atrás</span>
          <div class="d-flex align-items-center w-max">
            <a class="white-card-see-device" onclick="viewUser(${users[i].id})">Ver mais</a>
            <img class="white-card-see-arrow-device" src="../images/arrow-right.png" alt="Ver mais">
            <a onclick="deleteUserModal(${users[i].id})" class="trash"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    </div>

  `;
  }
}

userDelete = 0;

function deleteUserModal(userId) {
  $(
    '<div class="modal" id="modal" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Excluir</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" onclick="close_modal()">&times;</span></button></div><div class="modal-body"><p>Você deseja realmente excluir permanentemente este usuário?</p></div><div class="modal-footer"><div class="col-sm-12"><div class="row"><div class="col-sm-6"><button onclick="close_modal()" type="button" class="btn-white-blue">Não</button></div><div class="col-sm-6"><button type="button" class="btn-blue" data-dismiss="modal" onclick="save()">Sim</button></div></div></div></div></div></div></div>'
  ).insertAfter("#body-pd");
  $("#modal").show();
  userDelete = userId;
}

function close_modal() {
  document.getElementById("modal").style.display = "none";
}

function save() {
  document.getElementById("modal").style.display = "none";
  deleteUser(userDelete);
}

function viewUser(userId) {
  getUser(userId);
}

async function getUser(userId) {
  await $.ajax({
    url: "http://localhost:3001/user/getUser",
    headers: { Authorization: ` ${auth}` },
    body: { userId: userId },
    success: function (resul) {
      user = resul.message;
      console.log(user);
      // window
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}
async function deleteUser(userDelete) {
  await $.ajax({
    url: "http://localhost:3001/user/deleteAdmin",
    type: "DELETE",
    headers: { Authorization: `${auth}` },
    data: {
      id: userDelete,
    },
    success: async function (resul) {
      loadUsers();
      console.log(resul);
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

function searchInput(valToSearch) {
  if (valToSearch == "") {
    document.getElementById("list-users").innerHTML = "";
    document.getElementById("pagination").innerHTML = "";
    loadUsers();
  } else {
    document.getElementById("list-users").innerHTML = "";
    Allusers = Allusers.filter((val) => {
      return val.nome.toLowerCase().includes(valToSearch.toLowerCase());
    });

    if (Allusers) {
      document.getElementById("pagination").innerHTML = "";

      listUsers(Allusers);
    } else {
      document.getElementById("pagination").innerHTML = "";
      document.getElementById("list-users").innerHTML =
        "<h1> Não dispositivo encontrado</h1>";
    }
  }
}

function selectNavbar(){
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("users").classList.add("active");

}
