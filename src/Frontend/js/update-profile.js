getUser();

async function getUser() {
  await $.ajax({
    url: "http://localhost:3001/user/get",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      user = resul.message;
      document.getElementById("nome").value = `${user.nome}`;
      document.getElementById("e-mail").value = `${user.email}`;
      document.getElementById("cargo").value = `${user.cargo}`;
      document.getElementById("setor").value = `${user.setor}`;
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

$("#back").click(function () {
  window.location.href = "/view/user-profile.html";
});

$("#save").click(function () {
  updateUser();
});

function updateUser() {
  document.getElementById("body-pd").style.display = "none";
  document
    .getElementById("body-pd")
    .insertAdjacentHTML(
      "beforebegin",
      '<div class="container-background" id="loader"><div class="loader"><div></div>'
    );
  startTimer(3);
  $.ajax({
    url: "http://localhost:3001/user/update",
    type: "PUT",
    headers: { Authorization: ` ${auth}` },
    data: {
      nome: $("#nome").val(),
      setor: $("#setor").val(),
      cargo: $("#cargo").val(),
      email: $("#e-mail").val(),
    },
    success: async function (resul) {
      window.location.href = "/view/user-profile.html";
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function selectNavbar() {
  document.getElementById("dashboard").classList.remove("active");
}
