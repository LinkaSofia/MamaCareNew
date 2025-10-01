require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 GMAIL_USER:', process.env.GMAIL_USER);
console.log('📧 GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '***configurado***' : 'não configurado');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('📧 Verificando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');

    const mailOptions = {
      from: {
        name: 'Mama Care Test',
        address: process.env.GMAIL_USER
      },
      to: 'linkasofialunkes@gmail.com',
      subject: 'Teste de Email - Mama Care',
      text: 'Este é um teste de envio de email do Mama Care.'
    };

    console.log('📧 Enviando email de teste...');
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de teste enviado com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('❌ Código:', error.code);
    console.error('❌ Response:', error.response);
  }
}

testEmail();
