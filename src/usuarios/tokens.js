const jwt = require("jsonwebtoken");
const allowlistRefreshToken = require("../../redis/allowlist-refresh-token");
const crypto = require("crypto");

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
  const payload = { id };
  const token = jwt.sign(payload, process.env.CHAVE_JWT, {
    expiresIn: tempoQuantidade + tempoUnidade,
  });
  return token;
}
//Token Opaco também leva o nome de Refresh Token
async function criaTokenOpaco(id, [tempoQuantidade], allowlist) {
  const tokenOpaco = crypto.randomBytes(24).toString("hex");
  const qtdDeDiasEmMilissegundos = 60 * 60 * 24 * tempoQuantidade * 1000;
  const dataExpiracaoEmUnix = Math.round(
    (Date.now() + qtdDeDiasEmMilissegundos) / 1000
  );
  await allowlist.adiciona(tokenOpaco, id, dataExpiracaoEmUnix);
  return tokenOpaco;
}

module.exports = {
  access: {
    expiracao: [15, "m"],
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
  },
  refresh: {
    expiracao: [5],
    lista: allowlistRefreshToken,
    cria(id) {
      return criaTokenOpaco(id, this.expiracao, this.lista);
    },
  },
};
