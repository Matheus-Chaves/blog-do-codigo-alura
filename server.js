require("dotenv").config();

const { response } = require("./app");
const app = require("./app");
const port = 3000;
//const db = require("./database");
require("./redis/blocklist-access-token");
require("./redis/allowlist-refresh-token");
const {
  InvalidArgumentError,
  NaoEncontrado,
  NaoAutorizado,
} = require("./src/erros");
const jwt = require("jsonwebtoken");

//Middleware para
app.use((req, res, next) => {
  const accept = req.get("Accept");

  if (accept !== "application/json" && accept !== "*/*") {
    res.status(406).end();
    return;
  }

  res.set({
    "Content-Type": "application/json",
  });

  next();
});

const routes = require("./rotas");
routes(app);

//Middleware para tratamento de erros centralizado
app.use((err, req, res, next) => {
  let status = 500;
  const corpo = {
    mensagem: err.message,
  };

  if (err instanceof InvalidArgumentError) {
    status = 400;
  } else if (err instanceof jwt.JsonWebTokenError) {
    status = 401;
  } else if (err instanceof jwt.TokenExpiredError) {
    status = 401;
    corpo.expiradoEm = err.expiredAt;
  } else if (err instanceof NaoEncontrado) {
    status = 404;
  } else if (err instanceof NaoAutorizado) {
    status = 401;
  }

  res.status(status).json(corpo);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
