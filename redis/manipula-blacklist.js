const blacklist = require("./blacklist");
const jwt = require("jsonwebtoken");
const { createHash } = require("crypto");

function geraTokenHash(token) {
  //Faz o hash do token, em hexadecimal, para que seu tamanho
  //não seja fixo e pequeno
  return createHash("sha256").update(token).digest("hex");
}

module.exports = {
  adiciona: async (token) => {
    const dataExpiracao = jwt.decode(token).exp;
    const tokenHash = geraTokenHash(token);
    //recebe uma chave e um valor, nosso valor é vazio pois apenas é necessário o token
    await blacklist.set(tokenHash, "");
    blacklist.expireAt(tokenHash, dataExpiracao);
  },
  contemToken: async (token) => {
    const tokenHash = geraTokenHash(token);
    const resultado = await blacklist.exists(tokenHash); //retorno é 0 ou 1
    return resultado === 1;
  },
};
