var pressEnter = document.getElementById('senha')
pressEnter.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        verifyLogin()
    }
});

function verifyLogin() {    
    if ($("#email").val() && $("#senha").val()) {
        $.post("http://localhost:3001/user/login",
            {
                "email": $("#email").val(),
                "senha": $("#senha").val()
            }
            , function (msg) {
                if (msg.token) {
                    window.localStorage.setItem('auth', msg.token)
                }
                console.log(msg);
                window.location.href = '/view/dashboard.html'
            }).fail(function (err) {
                
                $("#error").html(`<div class="alert alert-danger" role="alert">${err.statusText}</div>`);
                console.log(err);
            })
    }
}
activateSenha = false;
$( "#see" ).click(function() {
    activateSenha = !activateSenha;
    if(activateSenha == true){
        $("#senha").attr("type", "text");
        $( "#see" ).removeClass( "fa fa-eye" ).addClass( "fa fa-eye-slash" );
    }else{
        $("#senha").attr("type", "password");
        $( "#see" ).removeClass( "fa fa-eye-slash" ).addClass( "fa fa-eye" );
    }
  });