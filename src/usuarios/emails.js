const nodemailer = require("nodemailer");

async function enviaEmail(usuario) {
  const contaTeste = await nodemailer.createTestAccount();
  const transportador = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    auth: contaTeste,
  });
  //para recuperar o e-mail de teste, guardamos numa variável
  const info = await transportador.sendMail({
    from: "Blog do Código <noreply@blogdocodigo.com.br>",
    to: usuario.email,
    subject: "Teste de e-mail",
    text: "Olá! Este é um e-mail de teste.",
    html: "<h1>Oi!</h1> <p>Este é um e-mail de <b>teste</b>.</p>",
  });
  console.log("URL: " + nodemailer.getTestMessageUrl(info)); //URL para visualizar o e-mail
}

module.exports = { enviaEmail };
