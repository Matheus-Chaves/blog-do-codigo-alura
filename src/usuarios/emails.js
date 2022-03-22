const nodemailer = require("nodemailer");

class Email {
  async enviaEmail() {
    const contaTeste = await nodemailer.createTestAccount();
    const transportador = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      auth: contaTeste,
    });
    //para recuperar o e-mail de teste, guardamos numa variável
    const info = await transportador.sendMail(this);
    console.log("URL: " + nodemailer.getTestMessageUrl(info)); //URL para visualizar o e-mail
  }
}
class EmailVerificacao extends Email {
  constructor(usuario, endereco) {
    super();
    this.from = '"Blog do Código" <noreply@blogdocodigo.com.br>';
    this.to = usuario.email;
    this.subject = "Verificação de e-mail";
    this.text = `Olá! Verifique seu e-mail aqui: ${endereco}`;
    this.html = `<h1>Olá!</h1> Verifique seu e-mail aqui: <a href="${endereco}">${endereco}</a>`;
  }
}

module.exports = { EmailVerificacao };
