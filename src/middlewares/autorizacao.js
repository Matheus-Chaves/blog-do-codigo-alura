//middleware para realizar a autorização de acordo com o cargo do user
module.exports = (cargosObrigatorios) => (req, res, next) => {
  /* -- DESCRIÇÃO DOS CARGOS
    ADMIN -> Acesso a qualquer rota
    EDITOR -> Acesso somente a rotas dos posts
    ASSINANTE -> Pode apenas visualizar os posts
  */
  if (cargosObrigatorios.indexOf(req.user.cargo) === -1) {
    res.status(403).end();
    return;
  }
  next();
};
