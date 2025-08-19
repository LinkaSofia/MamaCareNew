import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY não configurada');
    return false;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: params.from || 'noreply@maternidade.app', // Email padrão
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8bbd9 0%, #87ceeb 100%); padding: 20px; border-radius: 10px;">
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #6b7280; margin-bottom: 20px;">Recuperação de Senha</h2>
        <p style="color: #6b7280; margin-bottom: 30px;">
          Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:
        </p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #f8bbd9 0%, #87ceeb 100%); 
                  color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; 
                  font-weight: bold; margin-bottom: 20px;">
          Redefinir Senha
        </a>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
          Se você não solicitou esta redefinição, pode ignorar este email.
          <br>
          Este link expira em 1 hora.
        </p>
      </div>
    </div>
  `;

  const text = `
    Recuperação de Senha
    
    Você solicitou a redefinição da sua senha.
    
    Acesse o link abaixo para criar uma nova senha:
    ${resetUrl}
    
    Se você não solicitou esta redefinição, pode ignorar este email.
    Este link expira em 1 hora.
  `;

  return await sendEmail({
    to: email,
    subject: '🤱 Recuperação de Senha - Maternidade App',
    text,
    html,
  });
}