const controle = require("../controleDeAcesso");
//definindo os métodos para utilizar com a biblioteca accesscontrol
const metodos = {
  ler: {
    todos: "readAny",
    apenasSeu: "readOwn",
  },
  criar: {
    todos: "createAny",
    apenasSeu: "createOwn",
  },
  remover: {
    todos: "deleteAny",
    apenasSeu: "deleteOwn",
  },
};

//middleware para realizar a autorização de acordo com o cargo do user
module.exports = (entidade, acao) => (req, res, next) => {
  const permissoesDoCargo = controle.can(req.user.cargo);
  const acoes = metodos[acao];
  //de acordo com a ação que está sendo feita (read, delete, etc.) verificamos a permissão
  const permissaoTodos = permissoesDoCargo[acoes.todos](entidade);
  const permissaoApenasSeu = permissoesDoCargo[acoes.apenasSeu](entidade);

  if (
    permissaoTodos.granted === false &&
    permissaoApenasSeu.granted === false
  ) {
    res.status(403).end();
    return;
  }

  req.acesso = {
    todos: {
      permitido: permissaoTodos.granted,
      atributos: permissaoTodos.attributes,
    },
    apenasSeu: {
      permitido: permissaoApenasSeu.granted,
      atributos: permissaoApenasSeu.attributes,
    },
  };

  next();
};
