const passport = require("passport");
const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros");
const allowlistRefreshToken = require("../../redis/allowlist-refresh-token");

async function verificaRefreshToken(refreshToken) {
  if (!refreshToken) {
    //caso não haja refreshToken, disparamos um erro
    throw new InvalidArgumentError("Refresh token não enviado!");
  }
  const id = await allowlistRefreshToken.buscaValor(refreshToken);
  if (!id) {
    //caso não haja id, disparamos um erro
    throw new InvalidArgumentError("Refresh token inválido!");
  }
  return id;
}

async function invalidaRefreshToken(refreshToken) {
  await allowlistRefreshToken.deleta(refreshToken);
}

module.exports = {
  local(req, res, next) {
    passport.authenticate(
      "local",
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === "InvalidArgumentError") {
          return res.status(401).json({ erro: erro.message });
        }

        if (erro) {
          return res.status(500).json({ erro: erro.message });
        }

        if (!usuario) {
          return res.status(401).json();
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },
  bearer(req, res, next) {
    //bearer serve para tratar erros do access token e definir o corpo da requisição
    passport.authenticate(
      "bearer",
      { session: false },
      (erro, usuario, info) => {
        if (erro && erro.name === "JsonWebTokenError") {
          return res.status(401).json({ erro: erro.message });
        }

        if (erro && erro.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ erro: erro.message, expiradoEm: erro.expiredAt });
        }

        if (erro) {
          return res.status(500).json({ erro: erro.message });
        }

        if (!usuario) {
          return res.status(401).json();
        }

        req.token = info.token;
        req.user = usuario;
        return next();
      }
    )(req, res, next);
  },
  async refresh(req, res, next) {
    //invalida refresh token e busca o user por ele
    try {
      const { refreshToken } = req.body;
      const id = await verificaRefreshToken(refreshToken);
      await invalidaRefreshToken(refreshToken);
      req.user = await Usuario.buscaPorId(id);
      return next();
    } catch (erro) {
      if (erro.name === "InvalidArgumentError") {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: erro.message });
    }
  },
};
