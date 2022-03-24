class InvalidArgumentError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "InvalidArgumentError";
  }
}

class InternalServerError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "InternalServerError";
  }
}

class NaoEncontrado extends Error {
  constructor(entidade) {
    const mensagem = `Não foi possível encontrar o ${entidade}.`;
    super(mensagem);
    this.name = "NaoEncontrado";
  }
}

class NaoAutorizado extends Error {
  constructor() {
    const mensagem = "Credenciais inválidas!";
    super(mensagem);
    this.name = "NaoAutorizado";
  }
}

module.exports = {
  InvalidArgumentError,
  InternalServerError,
  NaoEncontrado,
  NaoAutorizado,
};
