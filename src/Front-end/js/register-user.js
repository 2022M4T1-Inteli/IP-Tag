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
      data: {
        nome: $("#nome").val(),
        setor: $("#setor").val(),
        cargo: $("#cargo").val(),
        email: $("#email").val(),
        senha: $("#senha").val(),
      },
      success: async function (resul) {
        console.log(resul.message);
      },
      error: function (err) {
        window.location.href = "/view/register-user.html";
        console.log(msg);
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
