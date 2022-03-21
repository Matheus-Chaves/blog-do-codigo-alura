module.exports = (lista) => {
  return {
    async adiciona(chave, valor, dataExpiracao) {
      await lista.set(chave, valor);
      lista.expireAt(chave, dataExpiracao);
    },

    async buscaValor(chave) {
      return lista.get(chave);
    },

    async contemChave(chave) {
      const resultado = await lista.exists(chave);
      return resultado === 1;
    },

    async deleta(chave) {
      await lista.del(chave);
    },
  };
};
