getUser();

async function getUser() {
  await $.ajax({
    url: "http://localhost:3001/user/get",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      user = resul.message;
      document.getElementById("nome").innerHTML = `${user.nome}`;
      document.getElementById("e-mail").innerHTML = `${user.email}`;
      document.getElementById("cargo").innerHTML = `${user.cargo}`;
      document.getElementById("setor").innerHTML = `${user.setor}`;
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

$("#delete").click(function () {
  $(
    '<div class="modal" id="modal" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Excluir</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" onclick="close_modal()">&times;</span></button></div><div class="modal-body"><p>Você deseja realmente excluir permanentemente sua conta?</p></div><div class="modal-footer"><div class="col-sm-12"><div class="row"><div class="col-sm-6"><button onclick="close_modal()" type="button" class="btn-white-blue">Não</button></div><div class="col-sm-6"><button type="button" class="btn-blue" data-dismiss="modal" onclick="saveDelete()">Sim</button></div></div></div></div></div></div></div>'
  ).insertAfter("#body-pd");
  $("#modal").show();
});

function close_modal() {
  document.getElementById("modal").style.display = "none";
}

function saveDelete() {
  document.getElementById("modal").style.display = "none";
  deleteUser();
}
async function deleteUser() {
  await $.ajax({
    url: "http://localhost:3001/user/delete",
    type: "DELETE",
    headers: { Authorization: `${auth}` },
    data: {
      id: auth,
    },
    success: async function (resul) {
      window.location.href = "/view/login.html";
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

$("#update").click(function () {
  window.location.href = "/view/update-profile.html";
});

function selectNavbar() {
  document.getElementById("dashboard").classList.remove("active");
}
