const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros");

const jwt = require("jsonwebtoken");
const blocklist = require("../../redis/manipula-blocklist");

const crypto = require("crypto");

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id,
  };

  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: "15m" });
  return token;
}
//Token Opaco também leva o nome de Refresh Token
function criaTokenOpaco(usuario) {
  const tokenOpaco = crypto.randomBytes(24).toString("hex");
  const qtdDeDias = 5;
  const qtdDeDiasEmMilissegundos = 60 * 60 * 24 * qtdDeDias * 1000;
  const dataExpiracaoEmUnix = Math.round(
    (Date.now() + qtdDeDiasEmMilissegundos) / 1000
  );

  return tokenOpaco;
}

module.exports = {
  async adiciona(req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(400).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
    }
  },

  async login(req, res) {
    try {
      //'user' é recebido pelo passport-local.strategy, criado nas estratégias de autenticação
      const accessToken = criaTokenJWT(req.user);
      const refreshToken = criaTokenOpaco(req.user);
      res.set("Authorization", accessToken);
      res.status(200).json({ refreshToken });
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async logout(req, res) {
    try {
      const token = req.token;
      await blocklist.adiciona(token);
      res.status(204).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async lista(req, res) {
    try {
      const usuarios = await Usuario.lista();
      res.json(usuarios);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async deleta(req, res) {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id);
      await usuario.deleta();
      res.status(200).json();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  },
};
