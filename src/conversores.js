//Classe para centralizar a conversão dos posts, alterando a quantidade de campos que o usuário poderá visualizar de acordo com seu cargo
class ConversorPost {
  constructor(tipoDeConteudo, camposExtras = []) {
    this.tipoDeConteudo = tipoDeConteudo;
    this.camposPublicos = ["titulo", "conteudo"].concat(camposExtras);
  }

  converter(dados) {
    //caso tenha "*" na nossa lista, isso representa que todos os campos da tabela Posts podem ser acessados e NÃO precisamos filtrar os dados
    if (this.camposPublicos.indexOf("*") === -1) {
      dados = this.filtrar(dados);
    }

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
