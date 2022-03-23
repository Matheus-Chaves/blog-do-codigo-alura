const { middlewaresAutenticacao } = require("../usuarios");
//middleware para verificar se a pessoa está tentando acessar a API sem autenticação
module.exports = (req, res, next) => {
  req.estaAutenticado = false; //só ficará 'true' dentro do bearer

  if (req.get("Authorization")) {
    return middlewaresAutenticacao.bearer(req, res, next);
  }

  next();
};
