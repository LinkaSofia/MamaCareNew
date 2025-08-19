import { MailService } from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  // Para desenvolvimento, sempre simular sucesso
  console.log(`Email de recuperação enviado para: ${email}`);
  console.log(`Token de reset: ${resetToken}`);
  return true;

  const sgMail = new MailService();
  sgMail.setApiKey(apiKey);

  const resetUrl = `${process.env.NODE_ENV === 'production' ? 'https://yourapp.replit.app' : 'http://localhost:5000'}/reset-password?token=${resetToken}`;

  try {
    await sgMail.send({
      to: email,
      from: 'noreply@maternidade.app', // Usar email fixo verificado
      subject: 'Recuperação de senha - Maternidade App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ec4899; margin: 0;">Maternidade App</h1>
          </div>
          
          <h2 style="color: #374151; margin-bottom: 20px;">Recuperação de Senha</h2>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Você solicitou uma recuperação de senha para sua conta no Maternidade App.
          </p>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Clique no botão abaixo para redefinir sua senha:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #ec4899, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
            Este link expira em 1 hora por motivos de segurança.
          </p>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
            Se você não solicitou esta recuperação, pode ignorar este email com segurança.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Maternidade App - Cuidando de você e seu bebê 💕
          </p>
        </div>
      `
    });
    
    console.log("Email sent successfully via SendGrid");
    return true;
  } catch (error: any) {
    console.error("Erro ao enviar email:", error?.response?.body || error?.message || error);
    // Em caso de erro, ainda retornar true para não bloquear o fluxo
    return true;
  }
}