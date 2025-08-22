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
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #fdf2f8 0%, #ede9fe 50%, #dbeafe 100%); padding: 40px 20px; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #ec4899); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(236, 72, 153, 0.3);">
              <span style="color: white; font-size: 36px;">👶</span>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 36px; font-weight: 800;">
              Mama <span style="background: linear-gradient(135deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Care</span>
            </h1>
            <p style="color: #6b7280; margin: 15px 0 0; font-size: 18px; font-weight: 500;">Cuidando de você e seu bebê</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); padding: 50px 40px; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); text-align: center; border: 1px solid rgba(255,255,255,0.3);">
            <div style="background: linear-gradient(135deg, #fef3c7, #ddd6fe); width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
              <div style="position: absolute; inset: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%); animation: shine 2s infinite;"></div>
              <span style="font-size: 48px; z-index: 1;">🔐</span>
            </div>
            
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 32px; font-weight: 700;">Código de Verificação</h2>
            
            <p style="color: #6b7280; margin: 0 0 30px; font-size: 18px; line-height: 1.6;">
              Use o código abaixo para redefinir a senha da sua conta no <span style="color: #f59e0b; font-weight: 700;">Mama</span> Care.
            </p>
            
            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 20px; margin: 40px 0; position: relative; overflow: hidden; box-shadow: 0 15px 35px rgba(236, 72, 153, 0.4);">
              <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent); transform: rotate(45deg); animation: shimmer 3s ease-in-out infinite;"></div>
              <div style="color: white; font-size: 40px; font-weight: 900; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 4px 8px rgba(0,0,0,0.3); position: relative; z-index: 1;">
                ${resetToken.toUpperCase()}
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7, #fed7aa); padding: 30px; border-radius: 20px; margin: 40px 0; text-align: left; border-left: 6px solid #f59e0b; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2);">
              <p style="margin: 0 0 20px; color: #92400e; font-size: 18px; font-weight: 700; display: flex; align-items: center;">
                <span style="margin-right: 12px; font-size: 24px;">🛡️</span> Por segurança:
              </p>
              <ul style="margin: 0; color: #92400e; font-size: 16px; line-height: 2; padding-left: 25px; list-style: none;">
                <li style="position: relative; padding-left: 20px;">
                  <span style="position: absolute; left: 0; color: #f59e0b;">•</span>
                  Este código expira em <strong>10 minutos</strong>
                </li>
                <li style="position: relative; padding-left: 20px;">
                  <span style="position: absolute; left: 0; color: #f59e0b;">•</span>
                  Se você não solicitou esta recuperação, pode ignorar este email
                </li>
                <li style="position: relative; padding-left: 20px;">
                  <span style="position: absolute; left: 0; color: #f59e0b;">•</span>
                  Nunca compartilhe este código com outras pessoas
                </li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0; line-height: 1.5;">
              Este email foi enviado automaticamente. Por favor, não responda.
            </p>
            <p style="color: #6b7280; font-size: 16px; margin: 20px 0 0; font-weight: 700;">
              <span style="color: #f59e0b;">Mama</span> Care - Sua jornada maternal, nossa prioridade 💕
            </p>
          </div>
        </div>
        
        <style>
          @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
          @keyframes shine {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
        </style>
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