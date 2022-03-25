const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError, NaoEncontrado } = require("../erros");
const tokens = require("./tokens");
const { EmailVerificacao, EmailRedefinicaoSenha } = require("./emails");
const { ConversorUsuario } = require("../conversores");

function geraEndereco(rota, token) {
  const baseURL = process.env.BASE_URL;
  return `${baseURL}${rota}${token}`;
}

module.exports = {
  async adiciona(req, res, next) {
    const { nome, email, senha, cargo } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false,
        cargo,
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      const token = tokens.verificacaoEmail.cria(usuario.id);
      const endereco = geraEndereco("/usuario/verifica_email/", token);
      const emailVerificacao = new EmailVerificacao(usuario, endereco);
      /*o envio é lento, então executamos assincronamente o método enviaEmail
      Então precisamos do catch para capturar futuros erros*/
      emailVerificacao.enviaEmail().catch(console.log);

      res.status(201).json();
    } catch (erro) {
      next(erro);
    }
  },

  async login(req, res, next) {
    try {
      //'user' é recebido pelo passport-local.strategy, criado nas estratégias de autenticação
      const accessToken = tokens.access.cria(req.user.id);
      const refreshToken = await tokens.refresh.cria(req.user.id);
      res.set("Authorization", accessToken);
      res.status(200).json({ refreshToken });
    } catch (erro) {
      next(erro);
    }
  },

  async logout(req, res, next) {
    try {
      const token = req.token;
      await tokens.access.invalida(token);
      res.status(204).json();
    } catch (erro) {
      next(erro);
    }
  },

  async lista(req, res, next) {
    try {
      const usuarios = await Usuario.lista();
      const conversor = new ConversorUsuario(
        "json",
        req.acesso.todos.permitido //verifica se o usuário tem acesso a visualizar todos os usuários ou apenas o dele
          ? req.acesso.todos.atributos //mostra os atributos que ele pode ver de todos os usuários
          : req.acesso.apenasSeu.atributos //mostra os atributos que ele pode ver do seu usuário
      );
      res.send(conversor.converter(usuarios));
    } catch (erro) {
      next(erro);
    }
  },

  async verificaEmail(req, res, next) {
    try {
      const usuario = req.user;
      await usuario.verificaEmail();
      res.status(200).json();
    } catch (erro) {
      next(erro);
    }
  },

  async deleta(req, res, next) {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id);
      await usuario.deleta();
      res.status(200).json();
    } catch (erro) {
      next(erro);
    }
  },

  async esqueciMinhaSenha(req, res, next) {
    const respostaPadrao = {
      mensagem:
        "Se encontrarmos um usuário com este e-mail, vamos enviar uma mensagem com as instruções para redefinir a senha.",
    };
    try {
      const email = req.body.email;
      const usuario = await Usuario.buscaPorEmail(email);
      const token = await tokens.redefinicaoDeSenha.criarToken(usuario.id);
      const emailVerificacao = new EmailRedefinicaoSenha(usuario, token);
      await emailVerificacao.enviaEmail();

      res.send(respostaPadrao);
    } catch (erro) {
      //Segurança para evitar que fiquem colocando qualquer e-mail na API para descobrir quais existem.
      if (erro instanceof NaoEncontrado) {
        res.send(respostaPadrao);
        return;
      }
      next(erro);
    }
  },

  async trocarSenha(req, res, next) {
    try {
      if (typeof req.body.token !== "string" && req.body.token.length === 0) {
        throw new InvalidArgumentError("O token está inválido");
      }

      const id = await tokens.redefinicaoDeSenha.verifica(req.body.token);
      const usuario = await Usuario.buscaPorId(id);
      await usuario.adicionaSenha(req.body.senha);
      await usuario.atualizaSenha();
      res.send({ mensagem: "Sua senha foi atualizada com sucesso." });
    } catch (erro) {
      next(erro);
    }
  },
};
