const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const allowlistRefreshToken = require("../../redis/allowlist-refresh-token");
const blocklistAcessToken = require("../../redis/blocklist-access-token");
const { InvalidArgumentError } = require("../erros");

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
  const payload = { id };
  const token = jwt.sign(payload, process.env.CHAVE_JWT, {
    expiresIn: tempoQuantidade + tempoUnidade,
  });
  return token;
}

async function verificaTokenJWT(token, nome, blocklist) {
  //O JWT precisa ser verificado se está válido
  await verificaTokenNablocklist(token, nome, blocklist);
  //Caso estiver válido, extrai o ID do payload, senão, erro.
  const { id } = jwt.verify(token, process.env.CHAVE_JWT);
  return id;
}

async function verificaTokenNablocklist(token, nome, blocklist) {
  const tokenNablocklist = await blocklist.contemToken(token);
  if (tokenNablocklist) {
    throw new jwt.JsonWebTokenError(`${nome} inválido por logout.`);
  }
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

async function verificaTokenOpaco(token, nome, allowlist) {
  verificaTokenEnviado(token, nome);
  const id = await allowlist.buscaValor(token);
  verificaTokenValido(id, nome);
  return id;
}

function verificaTokenValido(id, nome) {
  if (!id) {
    //caso não haja id, disparamos um erro
    throw new InvalidArgumentError(`${nome} inválido!`);
  }
}

function verificaTokenEnviado(token, nome) {
  if (!token) {
    //caso não haja token, disparamos um erro
    throw new InvalidArgumentError(`${nome} não enviado!`);
  }
}

module.exports = {
  access: {
    nome: "Access token",
    lista: blocklistAcessToken,
    expiracao: [15, "m"],
    //cria o token definindo id do usuário e tempo de expiração
    cria(id) {
      return criaTokenJWT(id, this.expiracao);
    },
    //verifica o token e devolve od id extraído do payload do token
    verifica(token) {
      return verificaTokenJWT(token, this.nome, this.lista);
    },
  },
  refresh: {
    nome: "Refresh token",
    expiracao: [5],
    lista: allowlistRefreshToken,
    cria(id) {
      return criaTokenOpaco(id, this.expiracao, this.lista);
    },
    verifica(token) {
      return verificaTokenOpaco(token, this.nome, this.lista);
    },
  },
};
