const redis = require("redis");
const blocklist = redis.createClient({ prefix: "blocklist-access-token:" });
blocklist.on("connect", () => console.log("Connected to Redis!"));
blocklist.on("error", (err) => console.log("Redis Client Error", err));
blocklist.connect();
const manipulaLista = require("./manipula-lista");
const manipulaBlocklist = manipulaLista(blocklist);

const jwt = require("jsonwebtoken");
const { createHash } = require("crypto");

function geraTokenHash(token) {
  //Faz o hash do token, em hexadecimal, para que seu tamanho
  //não seja fixo e pequeno
  return createHash("sha256").update(token).digest("hex");
}

module.exports = {
  async adiciona(token) {
    const dataExpiracao = jwt.decode(token).exp;
    const tokenHash = geraTokenHash(token);
    //recebe uma chave e um valor, nosso valor é vazio pois apenas é necessário o token
    await manipulaBlocklist.adiciona(tokenHash, "", dataExpiracao);
  },
  async contemToken(token) {
    const tokenHash = geraTokenHash(token);
    return manipulaBlocklist.contemChave(tokenHash);
  },
};
