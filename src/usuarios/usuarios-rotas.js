const usuariosControlador = require("./usuarios-controlador");
const middlewaresAutenticacao = require("./middlewares-autenticacao");
const autorizacao = require("../middlewares/autorizacao");

module.exports = (app) => {
  app
    .route("/usuario/esqueci-minha-senha")
    .post(usuariosControlador.esqueciMinhaSenha);

  app.route("/usuario/trocar-senha").post(usuariosControlador.trocarSenha);

  app
    .route("/usuario/atualiza_token")
    //como queremos novos tokens, chamamos o método de login - que já faz isso
    .post(middlewaresAutenticacao.refresh, usuariosControlador.login);

  app
    .route("/usuario/login")
    .post(middlewaresAutenticacao.local, usuariosControlador.login);

  app
    .route("/usuario/logout")
    //invalidando access e refresh token
    //refresh -> invalida refresh token; logout -> invalida access token
    .post(
      [middlewaresAutenticacao.refresh, middlewaresAutenticacao.bearer],
      usuariosControlador.logout
    );

  app
    .route("/usuario/verifica_email/:token")
    .get(
      middlewaresAutenticacao.verificacaoEmail,
      usuariosControlador.verificaEmail
    );

  app
    .route("/usuario")
    .post(usuariosControlador.adiciona)
    .get(
      [middlewaresAutenticacao.bearer, autorizacao("usuario", "ler")],
      usuariosControlador.lista
    );

  app.route("/usuario/:id").delete(
    [
      middlewaresAutenticacao.bearer,
      middlewaresAutenticacao.local, //dupla confirmação: necessário inserir login também para deletar
      autorizacao("usuario", "remover"),
    ],
    usuariosControlador.deleta
  );
};
