google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ["Dias", "Rastreios"],
    ["Outubro", 111],
    ["Novembro", 120],
    ["Dezembro", 100],
  ]);

  var options = {
    curveType: "function",
    legend: { position: "bottom" },
    width:500,
    heigh:500,
  };

  var chart = new google.visualization.LineChart(
    document.getElementById("graphic-white-card")
  );

  chart.draw(data, options);
}

loadDevices();
async function loadDevices() {
  await $.ajax({
    url: "http://localhost:3001/device/getDevices",
    headers: { Authorization: ` ${auth}` },
    success: function (resul) {
      devices = resul.message;
      createGraphics(devices);
    },
  }).fail(function (err) {
    console.log(err.responseJSON.message);
  });
}

function createGraphics(devices) {
  $("#total").html(devices.length);
  $("#novos").html(devices.length);

  totalPorcentagemOn = 0;
  totalPorcentagemOff = 0;
  totalOff = 0;
  for (i = 0; i < devices.length; i++) {
    if (devices[i].status == "true") {
      totalPorcentagemOn += 1;
    } else {
      totalOff += 1;
    }
  }
  totalPorcentagemOn = (100 / devices.length) * totalPorcentagemOn;
  $("#total-porcentagem").html("100%");
  $("#novos-porcentagem").html(totalPorcentagemOn.toFixed(2) + "%");

  totalPorcentagemOff = (100 / devices.length) * totalOff;
  $("#bateria-porcentagem").html(totalPorcentagemOff.toFixed(2) + "%");
  $("#defeitos-porcentagem").html(totalPorcentagemOff.toFixed(2) + "%");
  $("#bateria").html(totalOff);
  $("#defeitos").html(totalOff);
}
function selectNavbar() {
  document.getElementById("dashboard").classList.add("active");
}
