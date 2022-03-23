const AccessControl = require("accesscontrol");
const controle = new AccessControl();
/*--    DESCRIÇÃO DOS CARGOS     --
  ADMIN     -> Acesso a qualquer rota
  EDITOR    -> Pode visualizar qualquer post, apenas criar e deletar os próprios posts
  ASSINANTE -> Pode apenas visualizar qualquer posts
*/
controle
  .grant("assinante")
  .readAny("post", ["id", "titulo", "conteudo", "autor"]);

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
