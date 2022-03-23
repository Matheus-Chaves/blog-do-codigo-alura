const autorizacao = require("./autorizacao");

module.exports = (entidade, acao) => (req, res, next) => {
  if (req.estaAutenticado === true) {
    return autorizacao(entidade, acao)(req, res, next);
  }

  next();
};
