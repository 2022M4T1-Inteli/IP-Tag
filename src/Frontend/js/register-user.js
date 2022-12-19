var pressEnter = document.getElementById("senha");
pressEnter.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    verifyCreate();
  }
});

function verifyCreate() {
  document.getElementById("body-pd").style.display = "none";
  document
    .getElementById("body-pd")
    .insertAdjacentHTML(
      "beforebegin",
      '<div class="container-background" id="loader"><div class="loader"><div></div>'
    );
  startTimer(3);
  if (
    $("#nome").val() &&
    $("#cargo").val() &&
    $("#setor").val() &&
    $("#email").val() &&
    $("#senha").val()
  ) {
    $.ajax({
      url: "http://localhost:3001/user/create",
      type: "POST",
      headers: { Authorization: ` ${auth}` },
      data: {
        nome: $("#nome").val(),
        setor: $("#setor").val(),
        cargo: $("#cargo").val(),
        email: $("#email").val(),
        senha: $("#senha").val(),
      },
      success: async function (resul) {
        console.log(resul.message);
        window.location.href = "/view/view-users.html";
      },
      error: function (err) {
        console.log(err);
      },
    });
  } else {
    document.getElementById(
      "erros"
    ).innerHTML += `<div class="alert alert-danger" role="alert">
        Campos obrigatórios vazios!
      </div>`;
  }
}

function selectNavbar() {
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("users").classList.add("active");
}
activateSenha = false;
$("#see").click(function () {
  activateSenha = !activateSenha;
  if (activateSenha == true) {
    $("#senha").attr("type", "text");
    $("#see").removeClass("fa fa-eye").addClass("fa fa-eye-slash");
  } else {
    $("#senha").attr("type", "password");
    $("#see").removeClass("fa fa-eye-slash").addClass("fa fa-eye");
  }
});
