const AccessControl = require("accesscontrol");
const controle = new AccessControl();
/*--    DESCRIÇÃO DOS CARGOS     --
  ADMIN     -> Acesso a qualquer rota, com todos os dados
  ASSINANTE -> Pode apenas visualizar qualquer post e apenas o nome dos usuários
  EDITOR    -> Tem tudo que o assinante tem, mas pode criar e deletar os próprios posts
*/
controle
  .grant("assinante")
  .readAny("post", ["id", "titulo", "conteudo", "autor"])
  .readAny("usuario", ["nome"]);

controle
  .grant("editor")
  //editor tem acesso a tudo que o assinante tem
  .extend("assinante")
  //pode criar e deletar apenas os próprios posts
  .createOwn("post")
  .deleteOwn("post");

controle
  .grant("admin")
  .createAny("post")
  .deleteAny("post")
  .readAny("post")
  .readAny("usuario")
  .deleteAny("usuario");

module.exports = controle;
