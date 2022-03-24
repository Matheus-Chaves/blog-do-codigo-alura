class ConversorPost {
  constructor(tipoDeConteudo) {
    this.tipoDeConteudo = tipoDeConteudo;
    this.camposPublicos = ["titulo", "conteudo"];
  }

  converter(dados) {
    dados = this.filtrar(dados);

    if (this.tipoDeConteudo === "json") {
      return this.json(dados);
    }
  }

  json(dados) {
    return JSON.stringify(dados);
  }

  filtrar(dados) {
    dados = Array.isArray(dados)
      ? dados.map((post) => this.filtrarObjeto(post))
      : this.filtrarObjeto(dados);
    return dados;
  }

  filtrarObjeto(objeto) {
    const objetoFiltrado = {};

    this.camposPublicos.forEach((campo) => {
      if (Reflect.has(objeto, campo)) {
        objetoFiltrado[campo] = objeto[campo];
      }
    });

    return objetoFiltrado;
  }
}

module.exports = ConversorPost;
