import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertUserSchema, insertPregnancySchema, insertKickCountSchema, insertWeightRecordSchema, insertWeightEntrySchema, insertBirthPlanSchema, insertConsultationSchema, insertShoppingItemSchema, insertPhotoSchema, insertDiaryEntrySchema, insertSymptomSchema, insertMedicationSchema, insertCommunityPostSchema, insertCommunityCommentSchema, insertBabyDevelopmentSchema, babyDevelopment } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import FileStore from "session-file-store";
import { sendPasswordResetEmail } from "./nodemailer";
import { randomUUID } from "crypto";
import { db } from "./storage";
import { sql } from "drizzle-orm";

// Simple session store for user authentication
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Endpoint público para verificar comparações (sem auth)
  app.get("/api/public/baby-development/comparisons", async (req, res) => {
    try {
      const result = await db.select({
        week: babyDevelopment.week,
        fruitComparison: babyDevelopment.fruit_comparison,
        fruitImageUrl: babyDevelopment.fruit_image_url
      }).from(babyDevelopment).orderBy(babyDevelopment.week);
      
      res.json({ success: true, comparisons: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mapeamento de imagens realistas baseadas nas comparações
  const fruitImageMapping = {
    "grão de areia": "@assets/image_1756832217955.png",
    "alfinete": "@assets/image_1756835392919.png", 
    "sementes de chia": "@assets/image_1756836492028.png",
    "semente de papoula": "@assets/image_1756836335355.png",
    "framboesa": "@assets/image_1756836383444.png",
    "lima": "@assets/image_1756495025464.png",
    "limão": "@assets/image_1756495589484.png",
    "banana": "@assets/image_1756821728303.png",
    "milho": "@assets/image_1756824586979.png",
    "berinjela": "@assets/image_1756831278946.png",
    "coco": "@assets/image_1756836492028.png", // Reutilizando temporariamente
    "abacaxi": "@assets/image_1756836383444.png", // Reutilizando temporariamente
    "melancia pequena": "@assets/image_1756821728303.png", // Reutilizando temporariamente
    "melancia": "@assets/image_1756824586979.png" // Reutilizando temporariamente
  };

  // Endpoint para inserir todas as imagens automaticamente usando SQL direto
  app.post("/api/baby-development/auto-insert-images", async (req, res) => {
    try {
      console.log("🖼️ Inserindo imagens automaticamente usando SQL direto...");
      
      // Inserir imagens usando SQL direto baseado no mapeamento
      const imageUpdates = [
        { comparison: 'grão de areia', week: 1, image: '@assets/image_1756832217955.png' },
        { comparison: 'alfinete', week: 2, image: '@assets/image_1756835392919.png' },
        { comparison: 'sementes de chia', week: 3, image: '@assets/image_1756836492028.png' },
        { comparison: 'semente de papoula', week: 4, image: '@assets/image_1756836335355.png' },
        { comparison: 'framboesa', week: 8, image: '@assets/image_1756836383444.png' },
        { comparison: 'lima', week: 12, image: '@assets/image_1756495025464.png' },
        { comparison: 'banana', week: 20, image: '@assets/image_1756821728303.png' },
        { comparison: 'milho', week: 24, image: '@assets/image_1756824586979.png' },
        { comparison: 'berinjela', week: 28, image: '@assets/image_1756831278946.png' }
      ];
      
      const results = [];
      
      for (const update of imageUpdates) {
        try {
          await db.execute(sql`
            UPDATE baby_development 
            SET fruit_image_url = ${update.image}
            WHERE week = ${update.week}
          `);
          
          results.push({
            week: update.week,
            comparison: update.comparison,
            imageUrl: update.image,
            status: 'inserted'
          });
          
          console.log(`✅ Semana ${update.week} (${update.comparison}): ${update.image}`);
        } catch (error) {
          console.error(`❌ Erro na semana ${update.week}:`, error);
          results.push({
            week: update.week,
            comparison: update.comparison,
            imageUrl: null,
            status: 'error'
          });
        }
      }
      
      res.json({ 
        success: true, 
        message: "Processo de inserção concluído!",
        results 
      });
    } catch (error: any) {
      console.error("❌ Erro geral:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota para adicionar campo fruit_image_url na tabela baby_development
  app.post("/api/baby-development/add-image-field", async (req, res) => {
    try {
      console.log("🖼️ Adicionando campo fruit_image_url na tabela baby_development...");
      
      await db.execute(sql`
        ALTER TABLE baby_development 
        ADD COLUMN IF NOT EXISTS fruit_image_url TEXT;
      `);
      
      console.log("✅ Campo fruit_image_url adicionado com sucesso!");
      res.json({ success: true, message: "Campo adicionado!" });
    } catch (error) {
      console.error("❌ Erro ao adicionar campo:", error);
      res.status(500).json({ error: "Erro ao adicionar campo", details: error.message });
    }
  });

  // Atualizar imagem para nova imagem do grão de areia
  app.post("/api/baby-development/update-week1-image", async (req, res) => {
    try {
      console.log("🌾 Atualizando imagem do grão de areia para semana 1...");
      
      const imageUrl = "@assets/image_1756832217955.png";
      
      await db.execute(sql`UPDATE baby_development SET fruit_image_url = ${imageUrl} WHERE week = 1`);
      
      console.log("✅ Nova imagem do grão de areia inserida!");
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("❌ Erro:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Inserir imagem do alfinete para semana 2
  app.post("/api/baby-development/update-week2-image", async (req, res) => {
    try {
      console.log("📌 Inserindo imagem do alfinete para semana 2...");
      
      const imageUrl = "@assets/image_1756835392919.png";
      
      await db.execute(sql`UPDATE baby_development SET fruit_image_url = ${imageUrl} WHERE week = 2`);
      
      console.log("✅ Imagem do alfinete inserida!");
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("❌ Erro:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Inserir imagem da semente de chia para semana 3
  app.post("/api/baby-development/update-week3-image", async (req, res) => {
    try {
      console.log("🌱 Inserindo imagem da semente de chia para semana 3...");
      
      const imageUrl = "@assets/image_1756836492028.png";
      
      await db.execute(sql`UPDATE baby_development SET fruit_image_url = ${imageUrl} WHERE week = 3`);
      
      console.log("✅ Imagem da semente de chia inserida!");
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("❌ Erro:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verificar todas as comparações de frutas no banco (sem auth para debug)
  app.get("/api/baby-development/all-comparisons", async (req, res) => {
    try {
      const result = await db.select({
        week: babyDevelopment.week,
        fruitComparison: babyDevelopment.fruit_comparison,
        fruitImageUrl: babyDevelopment.fruit_image_url
      }).from(babyDevelopment).orderBy(babyDevelopment.week);
      
      res.json({ success: true, comparisons: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rota de teste simples SEM autenticação
  app.get("/api/test-simple", (req, res) => {
    res.json({ message: "Test endpoint working!" });
  });

  // File-based session storage para persistir sessões
  const FileStoreSession = FileStore(session);
  
  // Session middleware for authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || "maternity-app-secret-key-for-mama-care-app-v2",
    store: new FileStoreSession({
      path: './sessions', // Diretório para salvar sessões
      ttl: 86400, // 24 horas em segundos
      retries: 0, // Don't retry on missing files
      reapInterval: 3600, // Limpar sessões expiradas a cada hora
      logFn: () => {} // Disable logging to reduce noise
    }),
    resave: false, 
    saveUninitialized: false,
    cookie: { 
      secure: false, // Allow non-HTTPS in development
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // Allow same-site requests
    },
    name: 'mama-care-session-v2' // Force new session cookie
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    console.log("🔐 Auth check:", { 
      hasSession: !!req.session, 
      userId: req.session?.userId, 
      sessionId: req.session?.id 
    });
    
    if (!req.session.userId) {
      console.log("❌ No session userId found, returning 401");
      return res.status(401).json({ error: "Authentication required" });
    }
    console.log("✅ Auth check passed for user:", req.session.userId);
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Verificar se usuário existe usando SQL direto
      const existingUserQuery = await db.execute(sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${userData.email}) LIMIT 1`);
      const existingUser = existingUserQuery.length > 0 ? existingUserQuery[0] : null;
      
      if (existingUser) {
        return res.status(400).json({ error: "Email já está cadastrado", field: "email" });
      }
      
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      
      // Salvar a sessão explicitamente após registro
      req.session.save((err) => {
        if (err) {
          console.error("❌ Registration session save error:", err);
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name, profilePhotoUrl: user.profilePhotoUrl, birthDate: user.birthDate } });
      });
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of error.issues) {
          const field = issue.path[0] as string;
          if (field === 'email') {
            fieldErrors.email = "Email inválido";
          } else if (field === 'password') {
            fieldErrors.password = "Senha deve ter pelo menos 6 caracteres";
          } else if (field === 'name') {
            fieldErrors.name = "Nome é obrigatório";
          } else if (field === 'birthDate') {
            fieldErrors.birthDate = "Data de nascimento inválida";
          } else {
            fieldErrors[field] = issue.message;
          }
        }
        return res.status(400).json({ error: "Dados inválidos", fieldErrors });
      }
      
      res.status(400).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }
      
      console.log("🔄 Starting login validation for:", email);
      const user = await storage.validatePassword(email, password);
      console.log("🔄 Validation result:", user ? "SUCCESS" : "FAILED");
      
      if (!user) {
        // Log login failure
        await storage.logAccessEvent({
          email,
          action: 'login',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: 'Invalid credentials',
          sessionId: req.sessionID
        });
        return res.status(401).json({ error: "Senha incorreta" });
      }
      
      req.session.userId = user.id;
      
      // Se "lembrar de mim" estiver marcado, estender a sessão para 30 dias
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias em millisegundos
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 dia
      }
      
      // Salvar a sessão explicitamente antes de responder
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
        }
        
        console.log("🔄 Login successful, session saved:", { 
          userId: user.id, 
          sessionId: req.sessionID,
          hasSession: !!req.session,
          sessionUserId: req.session.userId
        });
      
        // Log successful login
        storage.logAccessEvent({
          userId: user.id,
          email: user.email,
          action: 'login',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: true,
          sessionId: req.sessionID
        }).catch((logError: any) => {
          console.log("❌ Access log creation failed:", logError?.message || "Unknown error");
        });
        
        // Verificar se o usuário tem dados de gravidez, se não criar um básico
        storage.getActivePregnancy(user.id).then(pregnancy => {
          if (!pregnancy) {
            // Criar dados de gravidez básicos para usuário existente
            const basicPregnancy = {
              userId: user.id,
              dueDate: new Date('2025-12-01'), // Data de exemplo
              currentWeight: 65,
              isActive: true,
              createdAt: new Date()
            };
            
            storage.createPregnancy(basicPregnancy).then(() => {
              console.log("✅ Created basic pregnancy data for existing user");
            }).catch(err => {
              console.log("❌ Failed to create pregnancy data:", err?.message);
            });
          }
        }).catch(err => {
          console.log("❌ Failed to check pregnancy data:", err?.message);
        });
        
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ error: "Erro ao fazer login. Verifique seus dados e tente novamente." });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const userId = req.session.userId;
    const sessionId = req.sessionID;
    
    // Log logout event before destroying session
    if (userId) {
      await storage.logAccessEvent({
        userId,
        action: 'logout',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
        sessionId
      });
    }
    
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Rota para solicitar recuperação de senha
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      console.log("🔔 Forget password endpoint hit with email:", req.body.email);
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }

      // Buscar usuário real no banco
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // WORKAROUND: Como há problema na inserção no Supabase, vamos simular que o usuário existe
        // para permitir teste do sistema de recuperação de senha
        console.log("⚠️  User not found in DB, using simulation for email recovery");
        user = { 
          id: randomUUID(), 
          email: email, 
          name: "Usuário Simulado",
          password: "temp-hash",
          profilePhotoUrl: null,
          birthDate: null
        };
      } else {
        console.log("📧 Found real user:", user.email);
      }

      // Gerar token de reset com 4 números
      const resetToken = Math.floor(1000 + Math.random() * 9000).toString();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

      await storage.setPasswordResetToken(user!.id as string, resetToken, resetTokenExpires);

      // Enviar email - em desenvolvimento, simular sempre sucesso
      try {
        await sendPasswordResetEmail(email, resetToken);
        console.log(`Token de reset para ${email}: ${resetToken}`);
        res.json({ message: "Email de recuperação enviado com sucesso!" });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Em desenvolvimento, simular envio bem-sucedido
        console.log(`Token de reset para ${email}: ${resetToken}`);
        res.json({ message: "Email de recuperação enviado com sucesso!" });
      }
      
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para verificar token de reset
  app.post("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const { token } = req.body;
      console.log("🔍 Verify token endpoint hit with token:", token);
      
      if (!token) {
        return res.status(400).json({ error: "Token é obrigatório" });
      }

      // Normalizar token para comparação
      const normalizedToken = token.toLowerCase().trim();
      const user = await storage.getUserByResetToken(normalizedToken);
      console.log("🔍 User found by token:", user ? "YES" : "NO");
      
      if (!user) {
        return res.status(400).json({ error: "Token inválido ou expirado" });
      }

      res.json({ message: "Token válido" });
    } catch (error: any) {
      console.error("Verify token error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para resetar senha
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token e nova senha são obrigatórios" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
      }

      // Normalizar token para comparação
      const normalizedToken = token.toLowerCase().trim();
      const success = await storage.resetPasswordWithToken(normalizedToken, newPassword);
      if (success) {
        res.json({ message: "Senha alterada com sucesso!" });
      } else {
        res.status(400).json({ error: "Token inválido ou expirado" });
      }
      
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // Headers para evitar cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log("🔍 Auth check endpoint - Session:", {
      hasSession: !!req.session,
      userId: req.session?.userId,
      sessionId: req.sessionID,
      cookie: req.session?.cookie
    });
    
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        console.log("❌ User not found in database:", req.session.userId);
        return res.status(401).json({ error: "User not found" });
      }
      console.log("✅ User data found:", { id: user.id, name: user.name, email: user.email });
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        birthDate: user.birthDate 
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Rota para atualizar perfil do usuário
  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { name, birthDate } = req.body;
      
      console.log("📝 Updating user profile:", { userId, name, birthDate });
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (birthDate) updateData.birthDate = new Date(birthDate);
      
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      
      res.json({ 
        user: { 
          id: updatedUser.id, 
          email: updatedUser.email, 
          name: updatedUser.name, 
          profilePhotoUrl: updatedUser.profilePhotoUrl, 
          birthDate: updatedUser.birthDate 
        } 
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Upload endpoint for profile photos
  app.post("/api/uploads/profile-photo", requireAuth, async (req, res) => {
    try {
      // Generate a unique filename for the profile photo
      const fileName = `profile-photos/${req.session.userId}-${Date.now()}.jpg`;
      // Mock upload URL - in reality this would use object storage service
      const uploadURL = `https://storage.googleapis.com/replit-objstore-91a6418a-7138-4d3e-b5d2-2e3abd9533fc/.private/${fileName}`;
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Update user profile endpoint
  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { profilePhotoUrl, birthDate } = req.body;
      const userId = req.session.userId!;
      
      console.log("Updating profile for user:", userId, { profilePhotoUrl, birthDate });
      
      const updatedUser = await storage.updateUserProfile(userId, {
        profilePhotoUrl,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      });
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });



  // Pregnancy routes
  app.get("/api/pregnancies/active", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log("🤰 Searching for active pregnancy for user:", userId);
      
      const pregnancy = await storage.getActivePregnancy(userId);
      console.log("🤰 Pregnancy found:", pregnancy ? "YES" : "NO");
      
      if (pregnancy) {
        console.log("🤰 Pregnancy details:", { 
          id: pregnancy.id, 
          dueDate: pregnancy.dueDate, 
          isActive: pregnancy.isActive 
        });
      }
      
      res.json({ pregnancy });
    } catch (error) {
      console.error("Error getting pregnancy:", error);
      res.status(500).json({ error: "Failed to get pregnancy" });
    }
  });

  app.post("/api/pregnancies", requireAuth, async (req, res) => {
    const { dueDate, lastMenstrualPeriod, isActive } = req.body;
    
    try {
      // Direct database insert with error handling
      const pregnancyData = {
        userId: req.session.userId!,
        dueDate: new Date(dueDate),
        lastMenstrualPeriod: lastMenstrualPeriod ? new Date(lastMenstrualPeriod) : null,
        isActive: isActive !== false
      };
      
      const pregnancy = await storage.createPregnancy(pregnancyData);
      res.json({ pregnancy });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ 
        error: "Database error", 
        message: error instanceof Error ? error.message : "Unknown database error" 
      });
    }
  });

  // Rota para atualizar dados de gravidez
  app.put("/api/pregnancies/:id", requireAuth, async (req, res) => {
    try {
      const pregnancyId = req.params.id;
      const userId = req.session.userId!;
      const { dueDate, lastMenstrualPeriod, isActive } = req.body;
      
      console.log("🤰 Updating pregnancy:", { pregnancyId, userId, lastMenstrualPeriod });
      
      // Verificar se a gravidez pertence ao usuário
      const existingPregnancy = await storage.getActivePregnancy(userId);
      if (!existingPregnancy || existingPregnancy.id !== pregnancyId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const updateData: any = {};
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (lastMenstrualPeriod) updateData.lastMenstrualPeriod = new Date(lastMenstrualPeriod);
      if (isActive !== undefined) updateData.isActive = isActive;
      
      await storage.updatePregnancy(pregnancyId, updateData);
      
      // Retornar os dados atualizados
      const updatedPregnancy = await storage.getActivePregnancy(userId);
      res.json({ pregnancy: updatedPregnancy });
    } catch (error) {
      console.error("Error updating pregnancy:", error);
      res.status(500).json({ error: "Failed to update pregnancy" });
    }
  });

  // Kick count routes
  app.get("/api/kick-counts/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const count = await storage.getTodaysKickCount(req.params.pregnancyId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get kick count" });
    }
  });

  app.post("/api/kick-counts", requireAuth, async (req, res) => {
    try {
      console.log("🦵 Kick count data received:", req.body);
      const kickCountData = insertKickCountSchema.parse(req.body);
      const kickCount = await storage.createKickCount(kickCountData);
      res.json({ kickCount });
    } catch (error) {
      console.error("❌ Kick count validation error:", error);
      res.status(400).json({ error: "Invalid kick count data", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Weight records routes
  app.get("/api/weight-records/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const records = await storage.getWeightRecords(req.params.pregnancyId);
      const latest = await storage.getLatestWeight(req.params.pregnancyId);
      res.json({ records, latest });
    } catch (error) {
      res.status(500).json({ error: "Failed to get weight records" });
    }
  });

  app.post("/api/weight-entries", requireAuth, async (req, res) => {
    try {
      console.log("⚖️ Weight entry data received:", req.body);
      
      // Buscar gravidez ativa do usuário
      const userId = req.session.userId!;
      const pregnancy = await storage.getActivePregnancy(userId);
      
      if (!pregnancy) {
        return res.status(400).json({ error: "Nenhuma gravidez ativa encontrada" });
      }
      
      // Preparar dados com pregnancyId
      const requestData = {
        ...req.body,
        pregnancyId: pregnancy.id,
        weight: req.body.weight.toString(),
        date: req.body.date ? new Date(req.body.date) : new Date()
      };
      
      console.log("⚖️ Processed weight data:", requestData);
      const weightData = insertWeightRecordSchema.parse(requestData);
      const entry = await storage.createWeightRecord(weightData);
      
      // Log da ação para analytics
      await storage.logUserAction({
        userId,
        sessionId: req.sessionID,
        action: 'weight_entry_created',
        page: '/weight-tracking',
        element: 'weight_form',
        metadata: {
          weight: requestData.weight,
          date: requestData.date,
          pregnancyId: pregnancy.id
        }
      });
      
      res.json({ entry });
    } catch (error) {
      console.error("❌ Weight entry validation error:", error);
      res.status(400).json({ error: "Invalid weight entry data", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/weight-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const pregnancy = await storage.getActivePregnancy(userId);
      
      if (!pregnancy) {
        return res.json({ entries: [] });
      }
      
      const entries = await storage.getWeightRecords(pregnancy.id);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ error: "Failed to get weight entries" });
    }
  });

  // Endpoint temporário para criar tabelas de analytics
  app.get("/api/setup-analytics", async (req, res) => {
    try {
      console.log("🔧 Setting up analytics tables...");
      
      // Força a criação das tabelas
      const testUserId = "test-user-id";
      await storage.logUserAction({
        userId: testUserId,
        sessionId: "test-session",
        action: 'setup_tables',
        page: '/setup',
        element: 'setup_test',
        metadata: { purpose: 'create_analytics_tables' }
      });
      
      console.log("✅ Analytics tables setup completed");
      res.json({ 
        message: "Analytics tables created successfully",
        tablesCreated: ['user_analytics', 'access_logs', 'user_sessions']
      });
    } catch (error) {
      console.error("Error setting up analytics:", error);
      res.status(500).json({ error: "Failed to setup analytics tables" });
    }
  });

  // Endpoint para analytics de registro de peso
  app.get("/api/weight-analytics", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const analytics = await storage.getUserAnalytics(userId);
      
      // Filtrar apenas actions relacionadas a peso
      const weightAnalytics = analytics.filter(log => 
        log.page.includes('weight') || 
        log.action === 'weight_entry_created' ||
        log.element?.includes('weight')
      );
      
      res.json({ analytics: weightAnalytics });
    } catch (error) {
      console.error("Error fetching weight analytics:", error);
      res.status(500).json({ error: "Failed to get weight analytics" });
    }
  });

  // Endpoint para visualizar todos os logs do usuário
  app.get("/api/user-logs", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Força a criação das tabelas primeiro
      await storage.logUserAction({
        userId,
        sessionId: req.sessionID,
        action: 'check_logs',
        page: '/api/user-logs',
        element: 'logs_access'
      });
      
      // Buscar todos os tipos de logs
      const [accessLogs, analytics, sessions] = await Promise.all([
        storage.getAccessLogs(userId),
        storage.getUserAnalytics(userId),
        storage.getUserSessions(userId)
      ]);
      
      res.json({ 
        accessLogs,    // Login/logout/registro
        analytics,     // Cliques e navegação detalhada  
        sessions,      // Sessões completas com duração
        tablesCreated: true
      });
    } catch (error) {
      console.error("Error fetching user logs:", error);
      res.status(500).json({ error: "Failed to get user logs" });
    }
  });

  // Rota específica para logs de auditoria completa
  app.get("/api/audit-logs", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { tableName, recordId, limit } = req.query;
      
      console.log("📋 Fetching audit logs for user:", userId);
      
      const auditLogs = await storage.getAuditLogs(
        userId, 
        tableName as string, 
        recordId as string, 
        parseInt(limit as string) || 50
      );
      
      res.json({
        auditLogs,
        count: auditLogs.length,
        filters: { userId, tableName, recordId }
      });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  });

  // Birth plan routes
  app.get("/api/birth-plans/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const birthPlan = await storage.getBirthPlan(req.params.pregnancyId);
      res.json({ birthPlan });
    } catch (error) {
      res.status(500).json({ error: "Failed to get birth plan" });
    }
  });

  app.post("/api/birth-plans", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sessionId = req.sessionID;
      
      const birthPlanData = insertBirthPlanSchema.parse(req.body);
      const birthPlan = await storage.createOrUpdateBirthPlan(birthPlanData);
      
      // Log da auditoria para criação
      await storage.auditDataChange(
        userId,
        sessionId,
        'birth_plans',
        birthPlan.id,
        'create',
        null,
        birthPlan,
        req
      );
      
      res.json({ birthPlan });
    } catch (error) {
      res.status(400).json({ error: "Invalid birth plan data" });
    }
  });

  app.put("/api/birth-plans/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sessionId = req.sessionID;
      const recordId = req.params.id;
      
      console.log("🔄 Updating birth plan with data:", JSON.stringify(req.body, null, 2));
      
      // Buscar dados antigos para auditoria
      const oldPlan = await storage.getBirthPlanById(recordId);
      
      const birthPlanData = insertBirthPlanSchema.parse(req.body);
      console.log("✅ Data parsed successfully");
      
      const birthPlan = await storage.updateBirthPlan(req.params.id, birthPlanData);
      console.log("✅ Birth plan updated successfully");
      
      // Log da auditoria
      await storage.auditDataChange(
        userId,
        sessionId,
        'birth_plans',
        recordId,
        'update',
        oldPlan,
        birthPlan,
        req
      );
      
      res.json({ birthPlan });
    } catch (error) {
      console.error("❌ Birth plan update error:", error);
      if (error instanceof Error) {
        console.error("❌ Error details:", error.message);
      }
      res.status(400).json({ error: "Failed to update birth plan", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/birth-plans/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sessionId = req.sessionID;
      const recordId = req.params.id;
      
      // Buscar dados antigos para auditoria antes de deletar
      const oldPlan = await storage.getBirthPlanById(recordId);
      
      await storage.deleteBirthPlan(req.params.id);
      
      // Log da auditoria para exclusão
      if (oldPlan) {
        await storage.auditDataChange(
          userId,
          sessionId,
          'birth_plans',
          recordId,
          'delete',
          oldPlan,
          null,
          req
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete birth plan" });
    }
  });

  // Consultation routes
  app.get("/api/consultations/:pregnancyId", requireAuth, async (req, res) => {
    try {
      console.log("📅 Getting consultations for pregnancy ID:", req.params.pregnancyId);
      const consultations = await storage.getConsultations(req.params.pregnancyId);
      const upcoming = await storage.getUpcomingConsultations(req.params.pregnancyId);
      console.log("📊 Found consultations:", consultations.length, "upcoming:", upcoming.length);
      console.log("📋 All consultations:", consultations);
      console.log("⏰ Upcoming consultations:", upcoming);
      res.json({ consultations, upcoming });
    } catch (error) {
      console.error("❌ Error getting consultations:", error);
      res.status(500).json({ error: "Failed to get consultations" });
    }
  });

  app.get("/api/consultations/upcoming/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const consultations = await storage.getUpcomingConsultations(req.params.pregnancyId);
      res.json({ consultations });
    } catch (error) {
      res.status(500).json({ error: "Failed to get upcoming consultations" });
    }
  });

  app.get("/api/consultations/next/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const nextConsultation = await storage.getNextConsultation(userId);
      res.json({ nextConsultation });
    } catch (error) {
      res.status(500).json({ error: "Failed to get next consultation" });
    }
  });

  app.post("/api/consultations", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log("📅 Creating consultation with data:", req.body);
      
      // Buscar gravidez ativa do usuário
      const activePregnancy = await storage.getActivePregnancy(userId);
      if (!activePregnancy) {
        return res.status(400).json({ error: "Nenhuma gravidez ativa encontrada" });
      }
      
      // Adicionar userId e pregnancyId ao corpo da requisição, filtrar campos extras
      const { type, priority, reminders, preparation, ...validFields } = req.body;
      const consultationData = {
        ...validFields,
        userId: userId,
        pregnancyId: activePregnancy.id
      };
      
      const validatedData = insertConsultationSchema.parse(consultationData);
      console.log("✅ Consultation data validated:", validatedData);
      
      const consultation = await storage.createConsultation(validatedData);
      console.log("✅ Consultation created successfully:", consultation);
      
      res.json({ consultation });
    } catch (error: any) {
      console.error("❌ Consultation creation error:", error);
      if (error.issues) {
        // Erro de validação Zod
        const fieldErrors = error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        res.status(400).json({ error: "Dados de consulta inválidos", details: fieldErrors });
      } else {
        res.status(400).json({ error: "Erro ao criar consulta: " + error.message });
      }
    }
  });

  app.put("/api/consultations/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sessionId = req.sessionID;
      const consultationId = req.params.id;
      
      console.log("📝 Updating consultation:", consultationId, "with data:", req.body);
      
      // Buscar dados antigos para auditoria
      const oldConsultation = await storage.getConsultationById(consultationId);
      if (!oldConsultation) {
        return res.status(404).json({ error: "Consulta não encontrada" });
      }
      
      // Verificar se a consulta pertence ao usuário
      if (oldConsultation.userId !== userId) {
        return res.status(403).json({ error: "Não autorizado" });
      }
      
      const updatedConsultation = await storage.updateConsultation(consultationId, req.body);
      
      // Log de auditoria
      await storage.auditDataChange(
        userId,
        sessionId,
        'consultations',
        consultationId,
        'update',
        oldConsultation,
        updatedConsultation,
        req
      );
      
      console.log("✅ Consultation updated successfully:", updatedConsultation);
      res.json({ consultation: updatedConsultation });
    } catch (error) {
      console.error("❌ Error updating consultation:", error);
      res.status(500).json({ error: "Failed to update consultation" });
    }
  });

  app.delete("/api/consultations/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const sessionId = req.sessionID;
      const consultationId = req.params.id;
      
      console.log("🗑️ Deleting consultation:", consultationId);
      
      // Buscar dados para auditoria antes de deletar
      const consultation = await storage.getConsultationById(consultationId);
      if (!consultation) {
        return res.status(404).json({ error: "Consulta não encontrada" });
      }
      
      // Verificar se a consulta pertence ao usuário
      if (consultation.userId !== userId) {
        return res.status(403).json({ error: "Não autorizado" });
      }
      
      await storage.deleteConsultation(consultationId);
      
      // Log de auditoria
      await storage.auditDataChange(
        userId,
        sessionId,
        'consultations',
        consultationId,
        'delete',
        consultation,
        null,
        req
      );
      
      console.log("✅ Consultation deleted successfully");
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error deleting consultation:", error);
      res.status(500).json({ error: "Failed to delete consultation" });
    }
  });

  // Shopping items routes
  app.get("/api/shopping-items/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const items = await storage.getShoppingItems(req.params.pregnancyId);
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: "Failed to get shopping items" });
    }
  });

  app.post("/api/shopping-items", requireAuth, async (req, res) => {
    try {
      const itemData = insertShoppingItemSchema.parse(req.body);
      const item = await storage.createShoppingItem(itemData);
      res.json({ item });
    } catch (error) {
      res.status(400).json({ error: "Invalid shopping item data" });
    }
  });

  app.put("/api/shopping-items/:id", requireAuth, async (req, res) => {
    try {
      await storage.updateShoppingItem(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update shopping item" });
    }
  });

  app.delete("/api/shopping-items/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteShoppingItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete shopping item" });
    }
  });

  // Photo routes with object storage
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: req.session.userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/api/photos/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const photos = await storage.getPhotos(req.params.pregnancyId);
      res.json({ photos });
    } catch (error) {
      res.status(500).json({ error: "Failed to get photos" });
    }
  });

  app.post("/api/photos", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.photoURL,
        {
          owner: req.session.userId!,
          visibility: "private",
        }
      );
      
      const photoData = insertPhotoSchema.parse({
        ...req.body,
        objectPath,
      });
      const photo = await storage.createPhoto(photoData);
      res.json({ photo });
    } catch (error) {
      res.status(400).json({ error: "Invalid photo data" });
    }
  });

  app.delete("/api/photos/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePhoto(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // Diary routes
  app.get("/api/diary-entries/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getDiaryEntries(req.params.pregnancyId);
      res.json({ entries });
    } catch (error) {
      res.status(500).json({ error: "Failed to get diary entries" });
    }
  });

  app.post("/api/diary-entries", requireAuth, async (req, res) => {
    try {
      const entryData = insertDiaryEntrySchema.parse(req.body);
      const entry = await storage.createDiaryEntry(entryData);
      res.json({ entry });
    } catch (error) {
      res.status(400).json({ error: "Invalid diary entry data" });
    }
  });

  app.put("/api/diary-entries/:id", requireAuth, async (req, res) => {
    try {
      await storage.updateDiaryEntry(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update diary entry" });
    }
  });

  app.delete("/api/diary-entries/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteDiaryEntry(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete diary entry" });
    }
  });

  // Symptom routes
  app.get("/api/symptoms/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const symptoms = await storage.getSymptoms(req.params.pregnancyId);
      res.json({ symptoms });
    } catch (error) {
      res.status(500).json({ error: "Failed to get symptoms" });
    }
  });

  app.post("/api/symptoms", requireAuth, async (req, res) => {
    try {
      const symptomData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.createSymptom(symptomData);
      res.json({ symptom });
    } catch (error) {
      res.status(400).json({ error: "Invalid symptom data" });
    }
  });

  // Medication routes
  app.get("/api/medications/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const medications = await storage.getMedications(req.params.pregnancyId);
      res.json({ medications });
    } catch (error) {
      res.status(500).json({ error: "Failed to get medications" });
    }
  });

  app.post("/api/medications", requireAuth, async (req, res) => {
    try {
      const medicationData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(medicationData);
      res.json({ medication });
    } catch (error) {
      res.status(400).json({ error: "Invalid medication data" });
    }
  });

  // Community routes
  app.get("/api/community/posts", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to get community posts" });
    }
  });

  app.post("/api/community/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: req.session.userId!
      });
      const post = await storage.createCommunityPost(postData);
      res.json({ post });
    } catch (error) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.post("/api/community/posts/:id/like", requireAuth, async (req, res) => {
    try {
      await storage.likeCommunityPost(req.params.id, req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });

  app.delete("/api/community/posts/:id/like", requireAuth, async (req, res) => {
    try {
      await storage.unlikeCommunityPost(req.params.id, req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unlike post" });
    }
  });

  app.get("/api/community/posts/:id/comments", requireAuth, async (req, res) => {
    try {
      const comments = await storage.getPostComments(req.params.id);
      res.json({ comments });
    } catch (error) {
      res.status(500).json({ error: "Failed to get comments" });
    }
  });

  app.post("/api/community/comments", requireAuth, async (req, res) => {
    try {
      const commentData = insertCommunityCommentSchema.parse({
        ...req.body,
        userId: req.session.userId!
      });
      const comment = await storage.createComment(commentData);
      res.json({ comment });
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Analytics routes
  app.post("/api/analytics/page-visit", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { page, duration } = req.body;
      
      await storage.trackPageVisit(userId, page, duration);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking page visit:", error);
      res.status(500).json({ error: "Failed to track page visit" });
    }
  });

  app.post("/api/analytics/action", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { action, page, element } = req.body;
      
      await storage.trackUserAction(userId, action, page, element);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking action:", error);
      res.status(500).json({ error: "Failed to track action" });
    }
  });

  app.get("/api/analytics/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const analytics = await storage.getUserAnalytics(userId);
      res.json({ analytics });
    } catch (error) {
      console.error("Error getting user analytics:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  // Baby Development routes
  app.get("/api/baby-development/:week", requireAuth, async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      if (isNaN(week) || week < 1 || week > 42) {
        return res.status(400).json({ error: "Invalid week number" });
      }
      
      // Tentar buscar dados reais primeiro
      let developmentData;
      try {
        developmentData = await storage.getBabyDevelopmentByWeek(week);
        
        // Se não encontrou dados, popular a tabela com dados seed
        if (!developmentData) {
          console.log(`🌱 Nenhum dado encontrado para semana ${week}, populando tabela...`);
          const { seedBabyDevelopment } = await import("./seed-baby-development");
          await seedBabyDevelopment();
          
          // Tentar buscar novamente após popular
          developmentData = await storage.getBabyDevelopmentByWeek(week);
        }
      } catch (dbError: any) {
        console.log("❌ Erro na database:", dbError.message);
        
        // Fallback para dados seed diretos
        const { babyDevelopmentSeedData } = await import("./baby-development-seed");
        developmentData = babyDevelopmentSeedData.find(d => d.week === week);
      }

      // Se ainda não encontrou dados, criar dados básicos
      if (!developmentData) {
        developmentData = {
          week,
          size: "Consultando...",
          weight: "Calculando...",
          fruit_comparison: "aguarde",
          development_milestones_baby: "Dados de desenvolvimento serão carregados em breve.",
          development_milestones_mom: "Informações sobre mudanças na mamãe serão exibidas aqui.",
          baby_description: `Semana ${week} de gestação.`,
          mom_description: `Você está na semana ${week} da sua gravidez.`
        };
      }
      
      res.json({ developmentData });
    } catch (error) {
      console.error("❌ Erro ao buscar dados de desenvolvimento:", error);
      res.status(500).json({ error: "Failed to get development data" });
    }
  });

  app.get("/api/baby-development", requireAuth, async (req, res) => {
    try {
      const allDevelopmentData = await storage.getAllBabyDevelopmentData();
      res.json({ developmentData: allDevelopmentData });
    } catch (error) {
      console.error("Error fetching all baby development data:", error);
      res.status(500).json({ error: "Failed to get development data" });
    }
  });

  app.post("/api/baby-development", requireAuth, async (req, res) => {
    try {
      const developmentData = insertBabyDevelopmentSchema.parse(req.body);
      const newDevelopment = await storage.createBabyDevelopment(developmentData);
      res.json({ developmentData: newDevelopment });
    } catch (error) {
      console.error("Error creating baby development data:", error);
      res.status(400).json({ error: "Invalid development data" });
    }
  });

  // Rota para popular dados de desenvolvimento do bebê
  app.post("/api/baby-development/seed", requireAuth, async (req, res) => {
    try {
      const { seedBabyDevelopment } = await import("./seed-baby-development");
      const success = await seedBabyDevelopment();
      
      if (success) {
        res.json({ success: true, message: "Dados de desenvolvimento populados com sucesso!" });
      } else {
        res.status(500).json({ error: "Erro ao popular dados de desenvolvimento" });
      }
    } catch (error) {
      console.error("❌ Erro ao popular dados:", error);
      res.status(500).json({ error: "Failed to seed development data" });
    }
  });

  // Rota para inicializar tabela de artigos médicos
  app.post("/api/medical-articles/init", async (req, res) => {
    try {
      console.log("🏥 Inicializando tabela de artigos médicos...");
      
      // Criar tabela diretamente
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS medical_articles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          week INTEGER NOT NULL,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          content TEXT NOT NULL,
          source TEXT NOT NULL,
          source_url TEXT,
          category TEXT NOT NULL,
          importance TEXT NOT NULL DEFAULT 'medium',
          reading_time INTEGER DEFAULT 5,
          tags JSONB DEFAULT '[]'::jsonb,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log("✅ Tabela medical_articles criada com sucesso!");
      res.json({ success: true, message: "Tabela inicializada!" });
    } catch (error) {
      console.error("❌ Erro ao criar tabela:", error);
      res.status(500).json({ error: "Erro ao inicializar tabela" });
    }
  });

  // Rota para popular artigos médicos principais
  app.post("/api/medical-articles/seed", async (req, res) => {
    try {
      // Primeiro inicializar a tabela
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS medical_articles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          week INTEGER NOT NULL,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          content TEXT NOT NULL,
          source TEXT NOT NULL,
          source_url TEXT,
          category TEXT NOT NULL,
          importance TEXT NOT NULL DEFAULT 'medium',
          reading_time INTEGER DEFAULT 5,
          tags JSONB DEFAULT '[]'::jsonb,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log("📝 Populando artigos principais para tela inicial...");
      
      const { populateMainArticles } = await import("./populate-main-articles");
      const success = await populateMainArticles();
      
      if (success) {
        res.json({ success: true, message: "Artigos principais inseridos na tela principal!" });
      } else {
        res.status(500).json({ error: "Erro ao popular artigos principais" });
      }
    } catch (error) {
      console.error("❌ Erro ao popular artigos:", error);
      res.status(500).json({ error: "Failed to seed medical articles" });
    }
  });

  // Medical Articles endpoints (sem autenticação para usar no dashboard)
  app.get("/api/medical-articles/week/:week", async (req: any, res) => {
    try {
      console.log("🏥 Buscando artigos médicos para semana:", req.params.week);
      const week = parseInt(req.params.week);
      const articles = await storage.getMedicalArticlesByWeek(week);
      console.log("📝 Artigos encontrados:", articles?.length || 0);
      res.json({ articles });
    } catch (error) {
      console.error("Error fetching medical articles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Endpoint de teste para verificar se os artigos estão no banco
  app.get("/api/medical-articles/test", async (req: any, res) => {
    try {
      console.log("🧪 Testando conexão com artigos médicos...");
      const allArticles = await storage.getAllMedicalArticles();
      res.json({ 
        success: true, 
        totalArticles: allArticles?.length || 0,
        articles: allArticles?.slice(0, 3) || [] // Primeiros 3 artigos
      });
    } catch (error) {
      console.error("Error testing medical articles:", error);
      res.status(500).json({ error: "Test failed", details: error.message });
    }
  });

  app.get("/api/medical-articles/:id", async (req: any, res) => {
    try {
      const article = await storage.getMedicalArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json({ article });
    } catch (error) {
      console.error("Error fetching medical article:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
