import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Configurações para diferentes provedores
const emailConfigs: Record<string, EmailConfig> = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  }
};

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  // Se não há configuração de email, simular sucesso para desenvolvimento
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`🔄 Email simulado para: ${email}`);
    console.log(`🔑 Token de reset: ${resetToken}`);
    console.log(`🌐 Link de reset: http://localhost:5000/reset-password?token=${resetToken}`);
    return true;
  }

  try {
    // Detectar provedor baseado no email do remetente
    let provider = 'gmail';
    if (process.env.EMAIL_USER.includes('outlook') || process.env.EMAIL_USER.includes('hotmail')) {
      provider = 'outlook';
    } else if (process.env.EMAIL_USER.includes('yahoo')) {
      provider = 'yahoo';
    }

    const config = emailConfigs[provider];
    const transporter = nodemailer.createTransport(config);

    // Verificar conexão
    await transporter.verify();

    const resetUrl = `${process.env.NODE_ENV === 'production' ? 'https://yourapp.replit.app' : 'http://localhost:5000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: 'Maternidade App',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🤱 Recuperação de Senha - Maternidade App',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fdf2f8 0%, #e0f2fe 100%);">
          <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ec4899; margin: 0; font-size: 28px; font-weight: 600;">
                🤱 Maternidade App
              </h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">
                Cuidando de você e seu bebê
              </p>
            </div>

            <!-- Content -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fef3c7, #dbeafe); border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🔒</span>
              </div>
              
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                Recuperação de Senha
              </h2>
              
              <p style="color: #6b7280; line-height: 1.6; font-size: 16px; margin: 0 0 25px 0;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Maternidade App.
              </p>
            </div>

            <!-- Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ec4899, #3b82f6); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3); transition: transform 0.2s;">
                ✨ Redefinir Minha Senha
              </a>
            </div>

            <!-- Info -->
            <div style="background: #f9fafb; border-radius: 15px; padding: 20px; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>🔐 Por segurança:</strong><br>
                • Este link expira em <strong>1 hora</strong><br>
                • Se você não solicitou esta recuperação, pode ignorar este email<br>
                • Nunca compartilhe este link com outras pessoas
              </p>
            </div>

            <!-- Footer -->
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <div style="text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Este email foi enviado automaticamente. Por favor, não responda.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
                <strong>Maternidade App</strong> - Sua jornada maternal, nossa prioridade 💕
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
🤱 MATERNIDADE APP - Recuperação de Senha

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no Maternidade App.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

🔐 IMPORTANTE:
- Este link expira em 1 hora por motivos de segurança
- Se você não solicitou esta recuperação, pode ignorar este email
- Nunca compartilhe este link com outras pessoas

Obrigado por confiar no Maternidade App!

---
Este é um email automático, por favor não responda.
Maternidade App - Cuidando de você e seu bebê 💕
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado com sucesso para: ${email}`);
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error.message);
    
    // Para desenvolvimento, simular sucesso mesmo com erro
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Simulando envio para: ${email}`);
      console.log(`🔑 Token de reset: ${resetToken}`);
      return true;
    }
    
    return false;
  }
}

// Função para testar configuração de email
export async function testEmailConfig(): Promise<boolean> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Configuração de email não encontrada (EMAIL_USER, EMAIL_PASS)');
    return false;
  }

  try {
    let provider = 'gmail';
    if (process.env.EMAIL_USER.includes('outlook') || process.env.EMAIL_USER.includes('hotmail')) {
      provider = 'outlook';
    } else if (process.env.EMAIL_USER.includes('yahoo')) {
      provider = 'yahoo';
    }

    const config = emailConfigs[provider];
    const transporter = nodemailer.createTransport(config);
    
    await transporter.verify();
    console.log(`✅ Configuração de email válida (${provider})`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro na configuração de email:', error.message);
    return false;
  }
}