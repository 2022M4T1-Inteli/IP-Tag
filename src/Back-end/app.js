// Importando os modules que precisamos 
const express = require("express");
require("express-async-errors");
require("dotenv").config();
var bodyParser = require("body-parser");
const cors = require("cors");

// Instanciando o express para que as rotas sejam criadas
const app = express();
app.use(cors());

app.use(express.json()); //Irá suportar JSON
app.use(
  bodyParser.urlencoded({
    // Irá suportar urlenconded
    extended: true,
  })
);

// Definindo as portas para o servidor
const PORT = process.env.PORT || 3001;

//Importando as rotas dos arquivos em que foram esquematizadas
const userRouter = require("./routes/user");
const deviceRouter = require("./routes/device");

//Consumindo as rotas importadas
app.use("/user", userRouter);
app.use("/device", deviceRouter);
//Definindo a localização dos files do frontend
app.use(express.static("../Front-end"));

app.use((err, req, res, next) => {
  if (err instanceof Error) {
    res.status(500).json({
      error: err.message,
    });
  } else {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

//Rodando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
