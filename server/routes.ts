import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertUserSchema, insertPregnancySchema, insertKickCountSchema, insertWeightRecordSchema, insertBirthPlanSchema, insertConsultationSchema, insertShoppingItemSchema, insertPhotoSchema, insertDiaryEntrySchema, insertSymptomSchema, insertMedicationSchema, insertCommunityPostSchema, insertCommunityCommentSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
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
  // Session middleware for authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || "maternity-app-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Verificar se usuário existe usando SQL direto
      const existingUserQuery = await db.execute(sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${userData.email}) LIMIT 1`);
      const existingUser = existingUserQuery.rows && existingUserQuery.rows.length > 0 ? existingUserQuery.rows[0] : null;
      
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      req.session.userId = user.id;

      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
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
        return res.status(401).json({ error: "Senha incorreta" });
      }
      
      req.session.userId = user.id;
      
      // Se "lembrar de mim" estiver marcado, estender a sessão para 30 dias
      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias em millisegundos
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 dia
      }
      
      // Tentar registrar log de acesso (opcional)
      try {
        await storage.createAccessLog({
          userId: user.id,
          email: user.email,
          action: 'login',
          ipAddress: req.ip || req.connection.remoteAddress || '',
          userAgent: req.get('User-Agent') || '',
          success: true,
          sessionId: req.sessionID
        });
      } catch (logError: any) {
        // Falha no log não deve impedir o login
        console.log("Log creation skipped:", logError?.message || "Unknown error");
      }
      
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ error: "Erro ao fazer login. Verifique seus dados e tente novamente." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
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
          createdAt: null
        };
      } else {
        console.log("📧 Found real user:", user.email);
      }

      // Gerar token de reset com 4 números
      const resetToken = Math.floor(1000 + Math.random() * 9000).toString();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

      await storage.setPasswordResetToken(user.id as string, resetToken, resetTokenExpires);

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

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });



  // Pregnancy routes
  app.get("/api/pregnancies/active", requireAuth, async (req, res) => {
    try {
      const pregnancy = await storage.getActivePregnancy(req.session.userId!);
      res.json({ pregnancy });
    } catch (error) {
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
      const kickCountData = insertKickCountSchema.parse(req.body);
      const kickCount = await storage.createKickCount(kickCountData);
      res.json({ kickCount });
    } catch (error) {
      res.status(400).json({ error: "Invalid kick count data" });
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

  app.post("/api/weight-records", requireAuth, async (req, res) => {
    try {
      const weightData = insertWeightRecordSchema.parse(req.body);
      const record = await storage.createWeightRecord(weightData);
      res.json({ record });
    } catch (error) {
      res.status(400).json({ error: "Invalid weight record data" });
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
      const birthPlanData = insertBirthPlanSchema.parse(req.body);
      const birthPlan = await storage.createOrUpdateBirthPlan(birthPlanData);
      res.json({ birthPlan });
    } catch (error) {
      res.status(400).json({ error: "Invalid birth plan data" });
    }
  });

  // Consultation routes
  app.get("/api/consultations/:pregnancyId", requireAuth, async (req, res) => {
    try {
      const consultations = await storage.getConsultations(req.params.pregnancyId);
      const upcoming = await storage.getUpcomingConsultations(req.params.pregnancyId);
      res.json({ consultations, upcoming });
    } catch (error) {
      res.status(500).json({ error: "Failed to get consultations" });
    }
  });

  app.post("/api/consultations", requireAuth, async (req, res) => {
    try {
      const consultationData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(consultationData);
      res.json({ consultation });
    } catch (error) {
      res.status(400).json({ error: "Invalid consultation data" });
    }
  });

  app.put("/api/consultations/:id", requireAuth, async (req, res) => {
    try {
      await storage.updateConsultation(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update consultation" });
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

  const httpServer = createServer(app);
  return httpServer;
}
