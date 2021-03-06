const passport = require("passport");
const Usuario = require("./usuarios-modelo");
const tokens = require("./tokens");

module.exports = {
  //middleware para autenticar com senha e nome do user
  local(req, res, next) {
    passport.authenticate(
      "local",
      { session: false },
      (erro, usuario, info) => {
        if (erro) {
          return next(erro);
        }
        req.user = usuario;
        req.estaAutenticado = true;
        return next();
      }
    )(req, res, next);
  },
  //middleware para autenticar via token Bearer
  bearer(req, res, next) {
    //bearer serve para tratar erros do access token e definir o corpo da requisição
    passport.authenticate(
      "bearer",
      { session: false },
      (erro, usuario, info) => {
        if (erro) {
          return next(erro);
        }

        req.token = info.token;
        req.user = usuario;
        req.estaAutenticado = true;
        return next();
      }
    )(req, res, next);
  },
  async refresh(req, res, next) {
    //invalida refresh token e busca o user por ele
    try {
      const { refreshToken } = req.body;
      const id = await tokens.refresh.verifica(refreshToken);
      await tokens.refresh.invalida(refreshToken);
      req.user = await Usuario.buscaPorId(id);
      return next();
    } catch (erro) {
      next(erro);
    }
  },
  async verificacaoEmail(req, res, next) {
    try {
      const { token } = req.params;
      const id = await tokens.verificacaoEmail.verifica(token);
      const usuario = await Usuario.buscaPorId(id);
      req.user = usuario;
      next();
    } catch (erro) {
      next(erro);
    }
  },
};
