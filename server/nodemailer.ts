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
  // Verificar se as credenciais do Gmail estão disponíveis
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`🔄 Email simulado para: ${email}`);
    console.log(`🔑 Token de reset: ${resetToken}`);
    console.log(`🌐 Link de reset: http://localhost:5000/reset-password?token=${resetToken}`);
    return true;
  }

  try {
    // Configuração específica para Gmail com as novas variáveis
    console.log('📧 Configurando Gmail SMTP para Mama Care');
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

    // Verificar conexão
    await transporter.verify();

    const resetUrl = `${process.env.NODE_ENV === 'production' ? 'https://yourapp.replit.app' : 'http://localhost:5000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: 'Mama Care',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: '🤱 Recuperação de Senha - Mama Care',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificação - Mama Care</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 40px 20px; text-align: center;">
                      <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 30px;">👶</span>
                      </div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Mama Care</h1>
                      <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Cuidando de você e seu bebê</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fef3c7, #ddd6fe); border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">🔐</span>
                      </div>
                      
                      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: bold;">Código de Verificação</h2>
                      
                      <p style="color: #6b7280; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                        Use o código abaixo para redefinir a senha da sua conta no Mama Care.
                      </p>
                      
                      <!-- Token Box -->
                      <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 25px; border-radius: 12px; margin: 30px 0;">
                        <div style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${resetToken}
                        </div>
                      </div>
                      
                      <!-- Security Info -->
                      <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: left;">
                        <p style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: bold;">🛡️ Por segurança:</p>
                        <ul style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                          <li>Este código expira em <strong>10 minutos</strong></li>
                          <li>Se você não solicitou esta recuperação, pode ignorar este email</li>
                          <li>Nunca compartilhe este código com outras pessoas</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px;">
                        Este email foi enviado automaticamente. Por favor, não responda.
                      </p>
                      <p style="color: #6b7280; font-size: 14px; margin: 0; font-weight: bold;">
                        Mama Care - Sua jornada maternal, nossa prioridade 💕
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
🤱 MAMA CARE - Recuperação de Senha

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no Mama Care.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

🔐 IMPORTANTE:
- Este link expira em 1 hora por motivos de segurança
- Se você não solicitou esta recuperação, pode ignorar este email
- Nunca compartilhe este link com outras pessoas

Obrigado por confiar no Mama Care!

---
Este é um email automático, por favor não responda.
Mama Care - Cuidando de você e seu bebê 💕
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
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('⚠️  Configuração de Gmail não encontrada (GMAIL_USER, GMAIL_APP_PASSWORD)');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    await transporter.verify();
    console.log(`✅ Configuração de Gmail válida para Mama Care`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro na configuração de Gmail:', error.message);
    return false;
  }
}