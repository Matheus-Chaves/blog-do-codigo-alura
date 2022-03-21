const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;

const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const blocklist = require("../../redis/blocklist-access-token");

function verificaUsuario(usuario) {
  if (!usuario) {
    throw new InvalidArgumentError("Não existe usuário com esse e-mail.");
  }
}

async function verificaTokenNablocklist(token) {
  const tokenNablocklist = await blocklist.contemToken(token);
  if (tokenNablocklist) {
    throw new jwt.JsonWebTokenError("Token inválido por logout.");
  }
}

async function verificaSenha(senha, senhaHash) {
  const senhaValida = await bcrypt.compare(senha, senhaHash);
  if (!senhaValida) {
    throw new InvalidArgumentError("Senha inválida.");
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "senha",
      session: false,
    },
    async (email, senha, done) => {
      try {
        const usuario = await Usuario.buscaPorEmail(email);
        verificaUsuario(usuario);
        await verificaSenha(senha, usuario.senhaHash);

        done(null, usuario);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new BearerStrategy(async (token, done) => {
    try {
      await verificaTokenNablocklist(token);
      //O JWT precisa ser verificado se está válido
      const payload = jwt.verify(token, process.env.CHAVE_JWT);
      //Caso estiver válido, retorna o payload, senão, erro.
      const usuario = await Usuario.buscaPorId(payload.id);
      done(null, usuario, { token: token });
    } catch (error) {
      done(error);
    }
  })
);
