require("dotenv").config();

const { response } = require("./app");
const app = require("./app");
const port = 3000;
//const db = require("./database");
require("./redis/blocklist-access-token");
require("./redis/allowlist-refresh-token");
const { InvalidArgumentError } = require("./src/erros");
const jwt = require("jsonwebtoken");

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
  }

  res.status(status).json(corpo);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
