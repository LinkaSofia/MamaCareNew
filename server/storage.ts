import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import path from "path";
import fs from "fs";
import { 
  users, pregnancies, kickCounts, weightRecords, weightEntries, birthPlans, consultations, 
  shoppingItems, photos, diaryEntries, symptoms, medications, communityPosts, 
  communityComments, communityLikes, accessLogs, userAnalytics, userSessions,
  babyDevelopment, medicalArticles, auditLogs,
  type User, type InsertUser, type Pregnancy, type InsertPregnancy,
  type KickCount, type InsertKickCount, type WeightRecord, type InsertWeightRecord,
  type WeightEntry, type InsertWeightEntry, type BirthPlan, type InsertBirthPlan, 
  type Consultation, type InsertConsultation, type ShoppingItem, type InsertShoppingItem, 
  type Photo, type InsertPhoto, type DiaryEntry, type InsertDiaryEntry, type Symptom, 
  type InsertSymptom, type Medication, type InsertMedication, type CommunityPost, 
  type InsertCommunityPost, type CommunityComment, type InsertCommunityComment, 
  type AccessLog, type InsertAccessLog, type UserAnalytics, type InsertUserAnalytics, 
  type UserSession, type InsertUserSession, type BabyDevelopment, type InsertBabyDevelopment,
  type AuditLog, type InsertAuditLog, type MedicalArticle, type InsertMedicalArticle
} from "@shared/schema";
import { eq, desc, and, sql, count, gt } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.yrpbjxhtsnaxlfsazall:88L53i36n59ka@@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, data: { profilePhotoUrl?: string; birthDate?: Date }): Promise<User>;
  validatePassword(email: string, password: string): Promise<User | null>;

  // Pregnancies
  getActivePregnancy(userId: string): Promise<Pregnancy | undefined>;
  createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy>;
  updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<Pregnancy>;

  // Kick Counts
  getKickCountsForDate(pregnancyId: string, date: Date): Promise<KickCount[]>;
  createKickCount(kickCount: InsertKickCount): Promise<KickCount>;
  getTodaysKickCount(pregnancyId: string): Promise<number>;

  // Weight Records
  getWeightRecords(pregnancyId: string): Promise<WeightRecord[]>;
  getWeightRecordById(id: string): Promise<WeightRecord | undefined>;
  createWeightRecord(weightRecord: InsertWeightRecord): Promise<WeightRecord>;
  getLatestWeight(pregnancyId: string): Promise<WeightRecord | undefined>;
  
  // Weight Entries
  getWeightEntries(pregnancyId: string): Promise<WeightEntry[]>;
  createWeightEntry(weightEntry: InsertWeightEntry): Promise<WeightEntry>;
  updateWeightEntry(id: string, updates: Partial<InsertWeightEntry>): Promise<WeightEntry>;
  deleteWeightEntry(id: string): Promise<{ id: string }>;
  getLatestWeightEntry(pregnancyId: string): Promise<WeightEntry | undefined>;

  // Birth Plans
  getBirthPlan(pregnancyId: string): Promise<BirthPlan | undefined>;
  getBirthPlanById(planId: string): Promise<BirthPlan | undefined>;
  createOrUpdateBirthPlan(birthPlan: InsertBirthPlan): Promise<BirthPlan>;
  updateBirthPlan(id: string, updates: Partial<InsertBirthPlan>): Promise<BirthPlan>;
  deleteBirthPlan(id: string): Promise<void>;

  // Consultations
  getConsultations(pregnancyId: string): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<Consultation>;
  getUpcomingConsultations(pregnancyId: string): Promise<Consultation[]>;

  // Shopping Items
  getShoppingItems(pregnancyId: string): Promise<ShoppingItem[]>;
  getShoppingItemById(id: string): Promise<ShoppingItem | undefined>;
  createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem>;
  updateShoppingItem(id: string, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem>;
  deleteShoppingItem(id: string): Promise<void>;

  // Photos
  getPhotos(pregnancyId: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: string): Promise<void>;

  // Diary Entries
  getDiaryEntries(pregnancyId: string): Promise<DiaryEntry[]>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: string, updates: Partial<InsertDiaryEntry>): Promise<void>;
  deleteDiaryEntry(id: string): Promise<void>;

  // Symptoms
  getSymptoms(pregnancyId: string): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  updateSymptom(id: string, updates: Partial<InsertSymptom>): Promise<void>;
  deleteSymptom(id: string): Promise<void>;

  // Medications
  getMedications(pregnancyId: string): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, updates: Partial<InsertMedication>): Promise<void>;
  deleteMedication(id: string): Promise<void>;

  // Community
  getCommunityPosts(): Promise<(CommunityPost & { user: User })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(postId: string, userId: string): Promise<void>;
  unlikeCommunityPost(postId: string, userId: string): Promise<void>;
  getPostComments(postId: string): Promise<(CommunityComment & { user: User })[]>;
  createComment(comment: InsertCommunityComment): Promise<CommunityComment>;

  // Logs de auditoria
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(userId?: string, limit?: number): Promise<AccessLog[]>;
  updateUserLoginInfo(userId: string, ipAddress: string, userAgent: string): Promise<void>;

  // Sistema de Analytics
  createUserAnalytics(analytics: InsertUserAnalytics): Promise<UserAnalytics>;
  getUserAnalytics(userId: string, limit?: number): Promise<UserAnalytics[]>;
  startUserSession(sessionData: InsertUserSession): Promise<UserSession>;
  updateUserSession(sessionId: string, updates: Partial<InsertUserSession>): Promise<void>;
  endUserSession(sessionId: string, endTime: Date, totalDuration: number): Promise<void>;

  // Recuperação de senha
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  resetPasswordWithToken(token: string, newPassword: string): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;

  // Baby Development
  getBabyDevelopmentByWeek(week: number): Promise<BabyDevelopment | undefined>;
  getAllBabyDevelopmentData(): Promise<BabyDevelopment[]>;
  createBabyDevelopment(development: InsertBabyDevelopment): Promise<BabyDevelopment>;

  // Sistema de auditoria completa
  createAuditLog(auditData: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId?: string, tableName?: string, recordId?: string, limit?: number): Promise<AuditLog[]>;
  logUserAction(userId: string, action: string, page?: string, element?: string, metadata?: Record<string, any>): Promise<void>;
  trackPageVisit(userId: string, page: string, duration?: number): Promise<void>;
  getUserSessions(userId: string, limit?: number): Promise<UserSession[]>;

  // Medical Articles
  getMedicalArticlesByWeek(week: number): Promise<MedicalArticle[]>;
  getMedicalArticle(id: string): Promise<MedicalArticle | undefined>;
  createMedicalArticle(article: InsertMedicalArticle): Promise<MedicalArticle>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.init();
  }

  private async init() {
    await this.ensureUserTableColumns();
    await this.ensureAnalyticsTablesExist();
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const emailLower = email.toLowerCase().trim();
    console.log(`🔍 Searching for user with email: ${email}`);
    
    try {
      // Usar Drizzle ORM para buscar usuário por email (sem profile_photo_url se não existir)
      let result;
      try {
        result = await db.select().from(users)
          .where(eq(users.email, emailLower))
          .limit(1);
      } catch (error: any) {
        if (error.message?.includes('column "profile_photo_url" does not exist')) {
          // Usar SQL direto sem a coluna profile_photo_url
          result = await db.execute(sql`
            SELECT id, email, password, name, birth_date 
            FROM users 
            WHERE email = ${emailLower}
            LIMIT 1
          `);
        } else {
          throw error;
        }
      }
      
      console.log(`🔍 Query result: ${result.length} users found`);
      
      if (result && result.length > 0) {
        const user = result[0];
        console.log("✅ User found in Supabase:", { id: user.id, email: user.email, name: user.name });
        return user;
      }
      
      // Se não encontrou, tentar com email original (sem normalização)
      const resultOriginal = await db.select().from(users)
        .where(eq(users.email, email))
        .limit(1);
        
      console.log(`🔍 Original email query result: ${resultOriginal.length} users found`);
      
      if (resultOriginal && resultOriginal.length > 0) {
        const user = resultOriginal[0];
        console.log("✅ User found with original email:", { id: user.id, email: user.email, name: user.name });
        return user;
      }
      
      console.log("❌ User not found in Supabase database");
      return undefined;
      
    } catch (error) {
      console.error("❌ Error accessing Supabase:", error);
      throw new Error(`Erro ao acessar banco: ${error}`);
    }
  }

  async createUser(user: InsertUser & { profileImage?: any; pregnancyDate?: string; pregnancyType?: string }): Promise<User> {
    console.log("📝 Creating user:", { email: user.email, name: user.name, hasImage: !!user.profileImage });
    
    try {
      // Garantir que a coluna created_at existe na tabela
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
      `);
      
      // Verificar primeiro se o usuário já existe (sem usar created_at)
      const existingUserResult = await db.execute(sql`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${user.email})
      `);
      
      if (existingUserResult.length > 0) {
        console.log("❌ Email já cadastrado:", user.email);
        throw new Error("Email já está cadastrado");
      }
      
      // Criar usuário com data de criação usando SQL direto
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const userId = randomUUID();
      
      // Converter birthDate para string se existir
      const birthDateStr = user.birthDate ? user.birthDate.toISOString().split('T')[0] : null;
      
      // Processar imagem de perfil se existir
      let profilePhotoUrl = null;
      if (user.profileImage) {
        try {
          // Salvar imagem no diretório de uploads
          const uploadsDir = path.join(process.cwd(), 'client/public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const fileName = `profile_${userId}_${Date.now()}.${user.profileImage.mimetype.split('/')[1]}`;
          const filePath = path.join(uploadsDir, fileName);
          
          fs.writeFileSync(filePath, user.profileImage.buffer);
          profilePhotoUrl = `/uploads/${fileName}`;
          
          console.log("✅ Profile image saved:", profilePhotoUrl);
        } catch (imageError) {
          console.error("❌ Error saving profile image:", imageError);
          // Continuar sem a imagem se houver erro
        }
      }
      
      const result = await db.execute(sql`
        INSERT INTO users (id, email, password, name, birth_date, profile_photo_url, created_at) 
        VALUES (${userId}, ${user.email.toLowerCase().trim()}, ${hashedPassword}, ${user.name}, ${birthDateStr}, ${profilePhotoUrl}, NOW())
        RETURNING id, email, name, birth_date, profile_photo_url, created_at
      `);
      
      if (result.length > 0) {
        const newUser = result[0] as any;
        console.log("✅ User successfully created:", { id: newUser.id, email: newUser.email, hasPhoto: !!newUser.profile_photo_url });
        
        // Criar dados de gravidez se fornecidos
        console.log("🔍 Checking pregnancy data:", { 
          hasPregnancyDate: !!user.pregnancyDate, 
          hasPregnancyType: !!user.pregnancyType,
          pregnancyDate: user.pregnancyDate,
          pregnancyType: user.pregnancyType
        });
        
        if (user.pregnancyDate && user.pregnancyType) {
          try {
            console.log("📝 Creating pregnancy data:", { pregnancyDate: user.pregnancyDate, pregnancyType: user.pregnancyType });
            
            // Calcular datas baseado no tipo
            let lastMenstruationDate: string;
            let dueDate: string;
            
            if (user.pregnancyType === 'lastMenstruation') {
              lastMenstruationDate = user.pregnancyDate;
              // Calcular data prevista (40 semanas depois)
              const lastMenstruation = new Date(user.pregnancyDate);
              const dueDateObj = new Date(lastMenstruation);
              dueDateObj.setDate(dueDateObj.getDate() + (40 * 7)); // 40 semanas
              dueDate = dueDateObj.toISOString().split('T')[0];
            } else {
              dueDate = user.pregnancyDate;
              // Calcular última menstruação (40 semanas antes)
              const dueDateObj = new Date(user.pregnancyDate);
              const lastMenstruationObj = new Date(dueDateObj);
              lastMenstruationObj.setDate(lastMenstruationObj.getDate() - (40 * 7)); // 40 semanas antes
              lastMenstruationDate = lastMenstruationObj.toISOString().split('T')[0];
            }
            
            // Inserir dados de gravidez
            await db.execute(sql`
              INSERT INTO pregnancies (id, user_id, last_menstrual_period, due_date, is_active, created_at)
              VALUES (${randomUUID()}, ${newUser.id}, ${lastMenstruationDate}, ${dueDate}, true, NOW())
            `);
            
            console.log("✅ Pregnancy data created successfully");
          } catch (pregnancyError) {
            console.error("❌ Error creating pregnancy data:", pregnancyError);
            // Continuar mesmo se houver erro na criação dos dados de gravidez
          }
        }
        
        return {
          id: newUser.id,
          email: newUser.email,
          password: hashedPassword,
          name: newUser.name,
          birthDate: newUser.birth_date,
          profilePhotoUrl: newUser.profile_photo_url,
          createdAt: newUser.created_at || new Date()
        } as User;
      } else {
        throw new Error("Falha ao criar usuário");
      }
    } catch (error: any) {
      console.error("❌ Error creating user:", error?.message || error);
      if (error?.message?.includes("já está cadastrado")) {
        throw error; // Re-throw specific errors
      }
      if (error?.message?.includes("time zone displacement") || error?.message?.includes("date")) {
        throw new Error("Data de nascimento inválida");
      }
      throw new Error("Erro ao criar usuário");
    }
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log("❌ User not found for password validation");
      return null;
    }
    
    console.log("🔐 Validating password for user:", user.id);
    console.log("🔐 Stored password hash length:", user.password?.length || 0);
    console.log("🔐 Input password length:", password?.length || 0);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log("🔐 Password validation result:", isValid);
    
    return isValid ? user : null;
  }

  async updateUserProfile(id: string, data: { name?: string; profilePhotoUrl?: string; birthDate?: Date }): Promise<User> {
    console.log("📝 [storage] Updating user profile:", { id });
    console.log("📝 [storage] Data received:", {
      hasName: data.name !== undefined,
      hasPhoto: data.profilePhotoUrl !== undefined,
      photoLength: data.profilePhotoUrl ? data.profilePhotoUrl.length : 0,
      hasBirthDate: data.birthDate !== undefined
    });
    
    try {
      const updateData: any = {};
      
      if (data.name !== undefined && data.name !== null) {
        updateData.name = data.name;
        console.log("📝 [storage] Adding name to update");
      }
      
      if (data.profilePhotoUrl !== undefined && data.profilePhotoUrl !== null) {
        updateData.profilePhotoUrl = data.profilePhotoUrl;
        console.log("📝 [storage] Adding photo to update, size:", (data.profilePhotoUrl.length / 1024).toFixed(2), "KB");
      }
      
      if (data.birthDate !== undefined && data.birthDate !== null) {
        updateData.birthDate = data.birthDate;
        console.log("📝 [storage] Adding birthDate to update");
      }

      console.log("📝 [storage] Final updateData keys:", Object.keys(updateData));

      // Se não há dados para atualizar, apenas retorna o usuário atual
      if (Object.keys(updateData).length === 0) {
        console.log("📝 [storage] No data to update, returning current user");
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }

      console.log("📝 [storage] Executing UPDATE query...");
      // Usar Drizzle ORM para atualizar o perfil
      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      console.log("📝 [storage] UPDATE query executed, result count:", result.length);
      
      if (result.length === 0) {
        throw new Error("User not found");
      }
      
      const updatedUser = result[0];
      console.log("✅ [storage] User profile updated successfully");
      console.log("✅ [storage] Updated user has photo:", !!updatedUser.profilePhotoUrl);
      if (updatedUser.profilePhotoUrl) {
        console.log("✅ [storage] Photo size in DB:", (updatedUser.profilePhotoUrl.length / 1024).toFixed(2), "KB");
      }
      
      return updatedUser;
      
    } catch (error: any) {
      console.error("❌ Error updating user profile:", error?.message || error);
      throw new Error("Erro ao atualizar perfil do usuário");
    }
  }

  async getActivePregnancy(userId: string): Promise<Pregnancy | undefined> {
    const result = await db.select().from(pregnancies)
      .where(and(eq(pregnancies.userId, userId), eq(pregnancies.isActive, true)))
      .limit(1);
    return result[0];
  }

  async createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy> {
    const [newPregnancy] = await db.insert(pregnancies).values({
      ...pregnancy,
      id: randomUUID(),
    }).returning();
    return newPregnancy;
  }

  async updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<Pregnancy> {
    const [updated] = await db.update(pregnancies)
      .set(updates)
      .where(eq(pregnancies.id, id))
      .returning();
    if (!updated) {
      throw new Error("Pregnancy not found");
    }
    return updated;
  }

  async getKickCountsForDate(pregnancyId: string, date: Date): Promise<KickCount[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(kickCounts)
      .where(and(
        eq(kickCounts.pregnancyId, pregnancyId),
        sql`${kickCounts.date} >= ${startOfDay}`,
        sql`${kickCounts.date} <= ${endOfDay}`
      ));
  }

  async createKickCount(kickCount: InsertKickCount): Promise<KickCount> {
    const [newKickCount] = await db.insert(kickCounts).values({
      pregnancyId: kickCount.pregnancyId,
      date: kickCount.date,
      count: kickCount.count,
      times: kickCount.times,
      id: randomUUID(),
    }).returning();
    return newKickCount;
  }

  async getTodaysKickCount(pregnancyId: string): Promise<number> {
    const today = new Date();
    const counts = await this.getKickCountsForDate(pregnancyId, today);
    return counts.reduce((total, count) => total + count.count, 0);
  }

  async getWeightRecords(pregnancyId: string): Promise<WeightRecord[]> {
    return await db.select().from(weightRecords)
      .where(eq(weightRecords.pregnancyId, pregnancyId))
      .orderBy(desc(weightRecords.date));
  }

  async getWeightRecordById(id: string): Promise<WeightRecord | undefined> {
    const [record] = await db.select().from(weightRecords)
      .where(eq(weightRecords.id, id))
      .limit(1);
    return record;
  }

  async createWeightRecord(weightRecord: InsertWeightRecord): Promise<WeightRecord> {
    console.log("⚖️ Creating weight record with data:", JSON.stringify(weightRecord, null, 2));
    
    const recordData = {
      ...weightRecord,
      id: randomUUID(),
    };
    
    console.log("⚖️ Final record data for INSERT:", JSON.stringify(recordData, null, 2));
    
    const [newRecord] = await db.insert(weightRecords).values(recordData).returning();
    console.log("⚖️ Weight record created successfully:", newRecord);
    return newRecord;
  }

  async getLatestWeight(pregnancyId: string): Promise<WeightRecord | undefined> {
    const result = await db.select().from(weightRecords)
      .where(eq(weightRecords.pregnancyId, pregnancyId))
      .orderBy(desc(weightRecords.date))
      .limit(1);
    return result[0];
  }

  async getWeightEntries(pregnancyId: string): Promise<WeightEntry[]> {
    return await db.select().from(weightEntries)
      .where(eq(weightEntries.pregnancyId, pregnancyId))
      .orderBy(desc(weightEntries.date));
  }

  async createWeightEntry(weightEntry: InsertWeightEntry): Promise<WeightEntry> {
    console.log("📊 Creating weight entry:", weightEntry);
    try {
      const entryData = {
        pregnancyId: weightEntry.pregnancyId,
        weight: weightEntry.weight,
        date: weightEntry.date,
        notes: weightEntry.notes,
        // Não incluir ID - o serial vai gerar automaticamente
      };
      console.log("📊 Entry data to insert:", entryData);
      
      const [newEntry] = await db.insert(weightEntries).values(entryData).returning();
      console.log("✅ Weight entry created successfully:", newEntry);
      return newEntry;
    } catch (error) {
      console.error("❌ Error creating weight entry:", error);
      throw error;
    }
  }

  async getLatestWeightEntry(pregnancyId: string): Promise<WeightEntry | undefined> {
    const result = await db.select().from(weightEntries)
      .where(eq(weightEntries.pregnancyId, pregnancyId))
      .orderBy(desc(weightEntries.date))
      .limit(1);
    return result[0];
  }

  async updateWeightEntry(id: string, updates: Partial<InsertWeightEntry>): Promise<WeightEntry> {
    console.log("📊 Updating weight entry:", id, updates);
    
    // Atualizar a entrada e retornar o objeto atualizado diretamente
    const [updated] = await db.update(weightRecords)
      .set(updates)
      .where(eq(weightRecords.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Weight entry not found after update");
    }
    
    console.log("✅ Weight entry updated successfully:", updated);
    return updated;
  }

  async deleteWeightEntry(id: string): Promise<{ id: string }> {
    console.log("🗑️ Deleting weight entry:", id);
    
    // Buscar a entrada antes de deletar para retornar o ID
    const result = await db.select().from(weightRecords).where(eq(weightRecords.id, id));
    if (result.length === 0) {
      throw new Error("Weight entry not found");
    }
    
    // Deletar a entrada
    await db.delete(weightRecords).where(eq(weightRecords.id, id));
    
    console.log("✅ Weight entry deleted successfully:", id);
    return { id };
  }

  async getBirthPlan(pregnancyId: string): Promise<BirthPlan | undefined> {
    const result = await db.select().from(birthPlans)
      .where(eq(birthPlans.pregnancyId, pregnancyId))
      .limit(1);
    return result[0];
  }

  async getBirthPlanById(planId: string): Promise<BirthPlan | undefined> {
    const result = await db.select().from(birthPlans)
      .where(eq(birthPlans.id, planId))
      .limit(1);
    return result[0];
  }

  async createOrUpdateBirthPlan(birthPlan: InsertBirthPlan): Promise<BirthPlan> {
    const existing = await this.getBirthPlan(birthPlan.pregnancyId);
    
    console.log("💾 createOrUpdateBirthPlan - Dados recebidos:", JSON.stringify(birthPlan, null, 2));
    
    // Preparar todos os campos do schema - garantir que undefined vire null
    const updateData: any = {
      pregnancyId: birthPlan.pregnancyId,
      location: birthPlan.location ?? null,
      companions: birthPlan.companions ?? null,
      doctorPreference: birthPlan.doctorPreference ?? null,
      lighting: birthPlan.lighting ?? null,
      music: birthPlan.music ?? null,
      movement: birthPlan.movement ?? null,
      painReliefNatural: birthPlan.painReliefNatural ?? null,
      painReliefEpidural: birthPlan.painReliefEpidural ?? null,
      painReliefOther: birthPlan.painReliefOther ?? null,
      laborPosition: birthPlan.laborPosition ?? null,
      monitoring: birthPlan.monitoring ?? null,
      hydrationFood: birthPlan.hydrationFood ?? null,
      deliveryType: birthPlan.deliveryType ?? null,
      episiotomy: birthPlan.episiotomy ?? null,
      umbilicalCord: birthPlan.umbilicalCord ?? null,
      skinToSkin: birthPlan.skinToSkin ?? null,
      breastfeeding: birthPlan.breastfeeding ?? null,
      babyBath: birthPlan.babyBath ?? null,
      companionPresence: birthPlan.companionPresence ?? null,
      photos: birthPlan.photos ?? null,
      religiousCultural: birthPlan.religiousCultural ?? null,
      specialRequests: birthPlan.specialRequests ?? null,
      updatedAt: new Date(),
    };
    
    console.log("💾 Dados preparados para inserção/atualização:", JSON.stringify(updateData, null, 2));
    
    if (existing) {
      const [updated] = await db.update(birthPlans)
        .set(updateData)
        .where(eq(birthPlans.id, existing.id))
        .returning();
      console.log("✅ Birth plan atualizado:", updated.id);
      return updated;
    } else {
      const [created] = await db.insert(birthPlans).values({
        ...updateData,
        id: randomUUID(),
        createdAt: new Date(),
      }).returning();
      console.log("✅ Birth plan criado:", created.id);
      return created;
    }
  }

  async updateBirthPlan(id: string, birthPlan: InsertBirthPlan): Promise<BirthPlan> {
    console.log("💾 updateBirthPlan - Dados recebidos:", JSON.stringify(birthPlan, null, 2));
    
    // Preparar todos os campos - garantir que undefined vire null
    const updateData: any = {
      pregnancyId: birthPlan.pregnancyId,
      location: birthPlan.location ?? null,
      companions: birthPlan.companions ?? null,
      doctorPreference: birthPlan.doctorPreference ?? null,
      lighting: birthPlan.lighting ?? null,
      music: birthPlan.music ?? null,
      movement: birthPlan.movement ?? null,
      painReliefNatural: birthPlan.painReliefNatural ?? null,
      painReliefEpidural: birthPlan.painReliefEpidural ?? null,
      painReliefOther: birthPlan.painReliefOther ?? null,
      laborPosition: birthPlan.laborPosition ?? null,
      monitoring: birthPlan.monitoring ?? null,
      hydrationFood: birthPlan.hydrationFood ?? null,
      deliveryType: birthPlan.deliveryType ?? null,
      episiotomy: birthPlan.episiotomy ?? null,
      umbilicalCord: birthPlan.umbilicalCord ?? null,
      skinToSkin: birthPlan.skinToSkin ?? null,
      breastfeeding: birthPlan.breastfeeding ?? null,
      babyBath: birthPlan.babyBath ?? null,
      companionPresence: birthPlan.companionPresence ?? null,
      photos: birthPlan.photos ?? null,
      religiousCultural: birthPlan.religiousCultural ?? null,
      specialRequests: birthPlan.specialRequests ?? null,
      updatedAt: new Date(),
    };
    
    console.log("💾 Dados preparados para atualização:", JSON.stringify(updateData, null, 2));
    
    const [updated] = await db.update(birthPlans)
      .set(updateData)
      .where(eq(birthPlans.id, id))
      .returning();
    console.log("✅ Birth plan atualizado (por ID):", updated.id);
    console.log("✅ Dados após atualização:", {
      doctorPreference: updated.doctorPreference,
      lighting: updated.lighting,
      music: updated.music,
      location: updated.location,
    });
    return updated;
  }

  async deleteBirthPlan(id: string): Promise<void> {
    await db.delete(birthPlans).where(eq(birthPlans.id, id));
  }

  async getConsultations(pregnancyId: string): Promise<Consultation[]> {
    return await db.select().from(consultations)
      .where(eq(consultations.pregnancyId, pregnancyId))
      .orderBy(desc(consultations.date));
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    // Usar SQL direto para garantir que date é interpretado como timestamp local
    const [newConsultation] = await db.execute(sql`
      INSERT INTO consultations (
        id, user_id, pregnancy_id, title, date, location, doctor_name, notes, completed
      ) VALUES (
        ${randomUUID()},
        ${consultation.userId},
        ${consultation.pregnancyId},
        ${consultation.title},
        ${consultation.date}::timestamp,
        ${consultation.location || null},
        ${consultation.doctorName || null},
        ${consultation.notes || null},
        ${consultation.completed || false}
      )
      RETURNING *
    `);
    return newConsultation as Consultation;
  }

  async updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<Consultation> {
    // Se há atualização de date, usar SQL direto para garantir timestamp local
    if (updates.date) {
      const fields = [];
      const values = [];
      
      if (updates.title) { fields.push('title = $' + (fields.length + 1)); values.push(updates.title); }
      if (updates.date) { fields.push('date = $' + (fields.length + 1) + '::timestamp'); values.push(updates.date); }
      if (updates.location !== undefined) { fields.push('location = $' + (fields.length + 1)); values.push(updates.location); }
      if (updates.doctorName !== undefined) { fields.push('doctor_name = $' + (fields.length + 1)); values.push(updates.doctorName); }
      if (updates.notes !== undefined) { fields.push('notes = $' + (fields.length + 1)); values.push(updates.notes); }
      if (updates.completed !== undefined) { fields.push('completed = $' + (fields.length + 1)); values.push(updates.completed); }
      
      const [updated] = await db.execute(sql.unsafe(`
        UPDATE consultations 
        SET ${fields.join(', ')}
        WHERE id = $${fields.length + 1}
        RETURNING *
      `, [...values, id]));
      
      return updated as Consultation;
    }
    
    // Se não há date, usar update normal
    const [updated] = await db.update(consultations)
      .set(updates)
      .where(eq(consultations.id, id))
      .returning();
    return updated;
  }

  async getUpcomingConsultations(pregnancyId: string): Promise<Consultation[]> {
    const now = new Date();
    return await db.select().from(consultations)
      .where(and(
        eq(consultations.pregnancyId, pregnancyId),
        gt(consultations.date, now),
        eq(consultations.completed, false)
      ))
      .orderBy(consultations.date);
  }

  async getNextConsultation(userId: string): Promise<Consultation | null> {
    try {
      const now = new Date();
      const results = await db.select().from(consultations)
        .where(and(
          eq(consultations.userId, userId),
          gt(consultations.date, now),
          eq(consultations.completed, false)
        ))
        .orderBy(consultations.date)
        .limit(1);
      
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error getting next consultation:", error);
      return null;
    }
  }

  async getConsultationById(id: string): Promise<Consultation | null> {
    const results = await db.select().from(consultations)
      .where(eq(consultations.id, id))
      .limit(1);
    return results.length > 0 ? results[0] : null;
  }

  async deleteConsultation(id: string): Promise<void> {
    await db.delete(consultations)
      .where(eq(consultations.id, id));
  }

  async getShoppingItems(pregnancyId: string): Promise<ShoppingItem[]> {
    return await db.select().from(shoppingItems)
      .where(eq(shoppingItems.pregnancyId, pregnancyId))
      .orderBy(shoppingItems.purchased, desc(shoppingItems.priority));
  }

  async getShoppingItemById(id: string): Promise<ShoppingItem | undefined> {
    const [item] = await db.select().from(shoppingItems)
      .where(eq(shoppingItems.id, id))
      .limit(1);
    return item;
  }

  async createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem> {
    const [newItem] = await db.insert(shoppingItems).values({
      ...item,
      id: randomUUID(),
    }).returning();
    return newItem;
  }

  async updateShoppingItem(id: string, updates: Partial<InsertShoppingItem>): Promise<ShoppingItem> {
    const updateData = { ...updates };
    if (updates.purchased) {
      // Note: purchaseDate is handled at the database level with the purchase timestamp
      const [updated] = await db.update(shoppingItems).set({
        ...updateData,
        purchaseDate: new Date()
      }).where(eq(shoppingItems.id, id))
      .returning();
      return updated;
    } else {
      const [updated] = await db.update(shoppingItems).set(updateData).where(eq(shoppingItems.id, id))
      .returning();
      return updated;
    }
  }

  async deleteShoppingItem(id: string): Promise<void> {
    await db.delete(shoppingItems).where(eq(shoppingItems.id, id));
  }

  async getPhotos(pregnancyId: string): Promise<Photo[]> {
    return await db.select().from(photos)
      .where(eq(photos.pregnancyId, pregnancyId))
      .orderBy(desc(photos.date));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values({
      ...photo,
      id: randomUUID(),
    }).returning();
    return newPhoto;
  }

  async deletePhoto(id: string): Promise<void> {
    await db.delete(photos).where(eq(photos.id, id));
  }

  async getDiaryEntries(pregnancyId: string): Promise<DiaryEntry[]> {
    return await db.select().from(diaryEntries)
      .where(eq(diaryEntries.pregnancyId, pregnancyId))
      .orderBy(desc(diaryEntries.date));
  }

  async createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry> {
    console.log("📝 Creating diary entry with data:", JSON.stringify(entry, null, 2));
    
    const entryData = {
      ...entry,
      id: randomUUID(),
    };
    
    console.log("📝 Final entry data for INSERT:", JSON.stringify(entryData, null, 2));
    
    const [newEntry] = await db.insert(diaryEntries).values(entryData).returning();
    console.log("📝 Entry created successfully:", newEntry);
    return newEntry;
  }

  async updateDiaryEntry(id: string, updates: Partial<InsertDiaryEntry>): Promise<DiaryEntry> {
    await db.update(diaryEntries).set(updates).where(eq(diaryEntries.id, id));
    
    // Buscar e retornar a entrada atualizada
    const result = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    if (result.length === 0) {
      throw new Error("Diary entry not found after update");
    }
    return result[0];
  }

  async deleteDiaryEntry(id: string): Promise<void> {
    await db.delete(diaryEntries).where(eq(diaryEntries.id, id));
  }

  async getSymptoms(pregnancyId: string): Promise<Symptom[]> {
    return await db.select().from(symptoms)
      .where(eq(symptoms.pregnancyId, pregnancyId))
      .orderBy(desc(symptoms.date));
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const [newSymptom] = await db.insert(symptoms).values({
      ...symptom,
      id: randomUUID(),
    }).returning();
    return newSymptom;
  }

  async updateSymptom(id: string, updates: Partial<InsertSymptom>): Promise<void> {
    await db.update(symptoms).set(updates).where(eq(symptoms.id, id));
  }

  async deleteSymptom(id: string): Promise<void> {
    await db.delete(symptoms).where(eq(symptoms.id, id));
  }

  async getMedications(pregnancyId: string): Promise<Medication[]> {
    return await db.select().from(medications)
      .where(eq(medications.pregnancyId, pregnancyId))
      .orderBy(medications.isActive, desc(medications.startDate));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(medications).values({
      ...medication,
      id: randomUUID(),
    }).returning();
    return newMedication;
  }

  async updateMedication(id: string, updates: Partial<InsertMedication>): Promise<void> {
    await db.update(medications).set(updates).where(eq(medications.id, id));
  }

  async deleteMedication(id: string): Promise<void> {
    await db.delete(medications).where(eq(medications.id, id));
  }

  async getCommunityPosts(): Promise<(CommunityPost & { user: User })[]> {
    const result = await db.select({
      post: communityPosts,
      user: users,
    }).from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .orderBy(desc(communityPosts.createdAt));

    return result.map(({ post, user }) => ({ ...post, user }));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values({
      ...post,
      id: randomUUID(),
    }).returning();
    return newPost;
  }

  async likeCommunityPost(postId: string, userId: string): Promise<void> {
    // Check if already liked
    const existing = await db.select().from(communityLikes)
      .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
      .limit(1);
    
    if (existing.length === 0) {
      await db.insert(communityLikes).values({
        id: randomUUID(),
        postId,
        userId,
      });
      
      // Update likes count
      await db.update(communityPosts)
        .set({ likes: sql`${communityPosts.likes} + 1` })
        .where(eq(communityPosts.id, postId));
    }
  }

  async unlikeCommunityPost(postId: string, userId: string): Promise<void> {
    const deleted = await db.delete(communityLikes)
      .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
      .returning();
    
    if (deleted.length > 0) {
      // Update likes count
      await db.update(communityPosts)
        .set({ likes: sql`${communityPosts.likes} - 1` })
        .where(eq(communityPosts.id, postId));
    }
  }

  async getPostComments(postId: string): Promise<(CommunityComment & { user: User })[]> {
    const result = await db.select({
      comment: communityComments,
      user: users,
    }).from(communityComments)
      .innerJoin(users, eq(communityComments.userId, users.id))
      .where(eq(communityComments.postId, postId))
      .orderBy(communityComments.createdAt);

    return result.map(({ comment, user }) => ({ ...comment, user }));
  }

  async createComment(comment: InsertCommunityComment): Promise<CommunityComment> {
    const [newComment] = await db.insert(communityComments).values({
      ...comment,
      id: randomUUID(),
    }).returning();
    
    // Update comments count
    await db.update(communityPosts)
      .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    return newComment;
  }

  // Implementação dos logs de auditoria
  // Sistema Completo de Logs de Usuário
  async createAccessLog(log: InsertAccessLog): Promise<AccessLog> {
    try {
      const [newLog] = await db.insert(accessLogs).values({
        ...log,
        id: randomUUID(),
      }).returning();
      return newLog;
    } catch (error: any) {
      console.log("Access log creation failed:", error?.message || "Unknown error");
      return {} as AccessLog;
    }
  }

  async trackPageVisit(userId: string, page: string, duration?: number): Promise<void> {
    try {
      await db.insert(userAnalytics).values({
        id: randomUUID(),
        userId,
        sessionId: 'temp-session',
        action: 'page_view',
        page,
        duration: duration || 0,
        timestamp: new Date()
      });
    } catch (error) {
      console.log("Page visit tracking failed:", error);
    }
  }

  async trackUserAction(userId: string, action: string, page: string, element?: string): Promise<void> {
    try {
      await db.insert(userAnalytics).values({
        id: randomUUID(),
        userId,
        sessionId: 'temp-session',
        action,
        page,
        element,
        timestamp: new Date()
      });
    } catch (error) {
      console.log("User action tracking failed:", error);
    }
  }

  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<UserAnalytics[]> {
    try {
      return await db.select().from(userAnalytics)
        .where(eq(userAnalytics.userId, userId))
        .orderBy(desc(userAnalytics.timestamp));
    } catch (error) {
      console.error("Error getting user analytics:", error);
      return [];
    }
  }

  async getAccessLogs(userId?: string, limit = 50): Promise<AccessLog[]> {
    if (userId) {
      return await db.select().from(accessLogs)
        .where(eq(accessLogs.userId, userId))
        .orderBy(desc(accessLogs.createdAt))
        .limit(limit);
    }
    
    return await db.select().from(accessLogs)
      .orderBy(desc(accessLogs.createdAt))
      .limit(limit);
  }

  async updateUserLoginInfo(userId: string, ipAddress: string, userAgent: string): Promise<void> {
    // Desabilitado temporariamente devido a problemas com colunas da base de dados
    console.log("Login info update skipped - database schema issues");
  }

  // Recuperação de senha - usando tabela separada temporariamente
  private resetTokens = new Map<string, { token: string; expires: Date; userId: string }>();
  
  // Removido armazenamento em memória - usando apenas Supabase

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    // Usar memória temporariamente até ajustar schema do Supabase - normalizar token para lowercase
    const normalizedToken = token.toLowerCase();
    this.resetTokens.set(normalizedToken, { token: normalizedToken, expires, userId });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const tokenData = this.resetTokens.get(token);
      if (!tokenData || tokenData.expires <= new Date()) {
        console.log("Token not found or expired:", token, tokenData?.expires);
        return undefined;
      }

      // Primeiro tentar buscar usuário real no banco
      try {
        const result = await db.execute(sql`SELECT id, email, password, name FROM users WHERE id = ${tokenData.userId} LIMIT 1`);
        if (result.rows && result.rows.length > 0) {
          const row = result.rows[0];
          return {
            id: row.id as string,
            email: row.email as string,
            password: row.password as string,
            name: row.name as string,
            createdAt: null,
            resetToken: token,
            resetTokenExpiry: tokenData.expires
          } as User & { resetToken: string; resetTokenExpiry: Date };
        }
      } catch (dbError) {
        console.log("DB user not found, using token data for simulation");
      }

      // Se não encontrar no banco, retornar dados do token (para simulação)
      return {
        id: tokenData.userId,
        email: `user-${tokenData.userId}@temp.com`, // Email temporário
        password: "temp-hash",
        name: "Usuario Temporario",
        createdAt: null,
        resetToken: token,
        resetTokenExpiry: tokenData.expires
      } as User & { resetToken: string; resetTokenExpiry: Date };
    } catch (error) {
      console.error("Error getting user by reset token:", error);
      return undefined;
    }
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    try {
      const tokenData = this.resetTokens.get(token);
      if (!tokenData || tokenData.expires <= new Date()) {
        return false;
      }

      // Atualizar senha no banco
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, tokenData.userId));

      // Remover token da memória
      this.resetTokens.delete(token);
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  async endUserSession(sessionId: string, endTime: Date, totalDuration: number): Promise<void> {
    try {
      await db.update(userSessions)
        .set({ 
          endTime: endTime,
          totalDuration: totalDuration 
        })
        .where(eq(userSessions.sessionId, sessionId));
    } catch (error) {
      console.log("Session end failed:", error);
    }
  }

  // Baby Development methods
  async getBabyDevelopmentByWeek(week: number): Promise<BabyDevelopment | undefined> {
    try {
      // Ensure table exists with correct structure
      await this.ensureBabyDevelopmentTable();

      const result = await db.select().from(babyDevelopment)
        .where(eq(babyDevelopment.week, week))
        .limit(1);
      
      // Se encontrou dados mas não tem length_cm e weight_grams, atualiza
      if (result[0] && (!result[0].length_cm || result[0].length_cm === 0)) {
        console.log(`🔄 Atualizando dados da semana ${week} com medidas...`);
        await this.updateWeekMeasurements(week);
        
        // Busca novamente após atualização
        const updatedResult = await db.select().from(babyDevelopment)
          .where(eq(babyDevelopment.week, week))
          .limit(1);
        return updatedResult[0];
      }
      
      return result[0];
    } catch (error) {
      console.error("Error fetching baby development data:", error);
      return undefined;
    }
  }

  private async updateWeekMeasurements(week: number): Promise<void> {
    const measurements: Record<number, { length_cm: number; weight_grams: number }> = {
      1: { length_cm: 0.1, weight_grams: 0.1 },
      4: { length_cm: 0.2, weight_grams: 0.1 },
      8: { length_cm: 1.6, weight_grams: 1 },
      12: { length_cm: 5.4, weight_grams: 14 },
      16: { length_cm: 11.6, weight_grams: 100 },
      20: { length_cm: 16.4, weight_grams: 300 },
      24: { length_cm: 21, weight_grams: 630 },
      28: { length_cm: 25, weight_grams: 1000 },
      32: { length_cm: 28, weight_grams: 1700 },
      36: { length_cm: 32.2, weight_grams: 2600 },
      40: { length_cm: 36.2, weight_grams: 3400 }
    };

    const data = measurements[week];
    if (data) {
      try {
        await db.update(babyDevelopment)
          .set({
            length_cm: data.length_cm,
            weight_grams: data.weight_grams
          })
          .where(eq(babyDevelopment.week, week));
        
        console.log(`✅ Dados da semana ${week} atualizados: ${data.length_cm}cm, ${data.weight_grams}g`);
      } catch (error) {
        console.log(`❌ Erro ao atualizar semana ${week}:`, error);
      }
    }
  }

  private async ensureBabyDevelopmentTable(): Promise<void> {
    try {
      // Create table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS baby_development (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          week INTEGER NOT NULL UNIQUE,
          development_milestones_baby TEXT NOT NULL,
          development_milestones_mom TEXT NOT NULL,
          baby_description TEXT,
          mom_description TEXT
        )
      `);

      // Add missing columns if they don't exist
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS size TEXT DEFAULT ''`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS weight TEXT DEFAULT ''`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS fruit_comparison TEXT DEFAULT ''`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS baby_description TEXT DEFAULT ''`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS mom_description TEXT DEFAULT ''`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS length_cm NUMERIC DEFAULT 0`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS weight_grams NUMERIC DEFAULT 0`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS fruit_image_url TEXT`);
      } catch (e) {}
      
      try {
        await db.execute(sql`ALTER TABLE baby_development ADD COLUMN IF NOT EXISTS baby_image_url TEXT`);
      } catch (e) {}
    } catch (error) {
      console.log("Table structure update error:", error);
    }
  }

  async getAllBabyDevelopmentData(): Promise<BabyDevelopment[]> {
    try {
      // Ensure table exists with correct structure
      await this.ensureBabyDevelopmentTable();

      const result = await db.select().from(babyDevelopment)
        .orderBy(babyDevelopment.week);
      
      return result;
    } catch (error) {
      console.error("Error fetching all baby development data:", error);
      return [];
    }
  }

  async createBabyDevelopment(development: InsertBabyDevelopment): Promise<BabyDevelopment> {
    try {
      // Ensure table exists with correct structure
      await this.ensureBabyDevelopmentTable();

      const [newDevelopment] = await db.insert(babyDevelopment).values({
        ...development,
        id: randomUUID(),
      }).returning();
      
      return newDevelopment;
    } catch (error) {
      console.error("Error creating baby development data:", error);
      throw error;
    }
  }

  // Analytics and logging methods
  private async ensureUserTableColumns(): Promise<void> {
    try {
      // Adicionar colunas que podem estar faltando na tabela users
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT`);
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date TIMESTAMP`);
      console.log("✅ User table columns verified");
    } catch (error) {
      console.error("Error ensuring user table columns:", error);
    }
  }

  private async ensureConsultationsTableColumns(): Promise<void> {
    try {
      // Adicionar coluna user_id à tabela consultations se não existir
      await db.execute(sql`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS user_id VARCHAR REFERENCES users(id)`);
      console.log("✅ Consultations table user_id column verified");
    } catch (error) {
      console.error("Error ensuring consultations table columns:", error);
    }
  }

  private async ensureAnalyticsTablesExist(): Promise<void> {
    try {
      // Criar tabela user_analytics
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_analytics (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL,
          session_id TEXT NOT NULL,
          action TEXT NOT NULL,
          page TEXT NOT NULL,
          element TEXT,
          duration INTEGER,
          metadata JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
        )
      `);

      // Criar tabela access_logs
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS access_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR,
          email TEXT,
          action TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          success BOOLEAN DEFAULT true,
          error_message TEXT,
          session_id TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Criar tabela user_sessions
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL,
          session_id TEXT NOT NULL UNIQUE,
          start_time TIMESTAMP DEFAULT NOW(),
          end_time TIMESTAMP,
          total_duration INTEGER,
          pages_visited JSONB DEFAULT '[]',
          actions_count INTEGER DEFAULT 0,
          user_agent TEXT,
          ip_address TEXT
        )
      `);

      // Criar tabela de auditoria completa
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL,
          session_id TEXT,
          table_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          action TEXT NOT NULL,
          old_values JSONB,
          new_values JSONB,
          changed_fields JSONB,
          ip_address TEXT,
          user_agent TEXT,
          timestamp TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log("✅ Analytics tables created/verified");
    } catch (error) {
      console.error("Error creating analytics tables:", error);
    }
    
    // Também garantir que a coluna user_id existe na tabela consultations
    await this.ensureConsultationsTableColumns();
  }

  async logUserAction(actionData: {
    userId: string;
    sessionId: string;
    action: string;
    page: string;
    element?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.ensureAnalyticsTablesExist();
      
      await db.execute(sql`
        INSERT INTO user_analytics (id, user_id, session_id, action, page, element, metadata)
        VALUES (${randomUUID()}, ${actionData.userId}, ${actionData.sessionId}, ${actionData.action}, ${actionData.page}, ${actionData.element || null}, ${JSON.stringify(actionData.metadata || {})})
      `);
      
      console.log("📊 User action logged:", actionData.action);
    } catch (error) {
      console.error("Error logging user action:", error);
    }
  }


  async getUserSessions(userId: string): Promise<any[]> {
    try {
      await this.ensureAnalyticsTablesExist();
      
      const result = await db.execute(sql`
        SELECT * FROM user_sessions 
        WHERE user_id = ${userId} 
        ORDER BY start_time DESC 
        LIMIT 50
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        startTime: row.start_time,
        endTime: row.end_time,
        totalDuration: row.total_duration,
        pagesVisited: row.pages_visited,
        actionsCount: row.actions_count,
        userAgent: row.user_agent,
        ipAddress: row.ip_address
      }));
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }

  async logAccessEvent(eventData: {
    userId?: string;
    email?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      await this.ensureAnalyticsTablesExist();
      
      await db.execute(sql`
        INSERT INTO access_logs (id, user_id, email, action, ip_address, user_agent, success, error_message, session_id)
        VALUES (${randomUUID()}, ${eventData.userId || null}, ${eventData.email || null}, ${eventData.action}, ${eventData.ipAddress || null}, ${eventData.userAgent || null}, ${eventData.success}, ${eventData.errorMessage || null}, ${eventData.sessionId || null})
      `);
      
      console.log("🔐 Access event logged:", eventData.action);
    } catch (error) {
      console.error("Error logging access event:", error);
    }
  }


  // Sistema de auditoria completa - métodos principais
  async createAuditLog(auditData: InsertAuditLog): Promise<AuditLog> {
    await this.ensureAnalyticsTablesExist();
    
    console.log(`📝 Creating audit log:`, { 
      action: auditData.action, 
      tableName: auditData.tableName, 
      recordId: auditData.recordId 
    });
    
    const auditId = randomUUID();
    await db.execute(sql`
      INSERT INTO audit_logs (id, user_id, session_id, table_name, record_id, action, old_values, new_values, changed_fields, ip_address, user_agent)
      VALUES (${auditId}, ${auditData.userId}, ${auditData.sessionId || null}, ${auditData.tableName}, ${auditData.recordId}, ${auditData.action}, ${JSON.stringify(auditData.oldValues || {})}, ${JSON.stringify(auditData.newValues || {})}, ${JSON.stringify(auditData.changedFields || [])}, ${auditData.ipAddress || null}, ${auditData.userAgent || null})
    `);
    
    return { ...auditData, id: auditId, timestamp: new Date() } as AuditLog;
  }

  async getAuditLogs(userId?: string, tableName?: string, recordId?: string, limit = 100): Promise<AuditLog[]> {
    await this.ensureAnalyticsTablesExist();
    
    let whereClause = '';
    const conditions = [];
    
    if (userId) conditions.push(`user_id = '${userId}'`);
    if (tableName) conditions.push(`table_name = '${tableName}'`);
    if (recordId) conditions.push(`record_id = '${recordId}'`);
    
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    
    const result = await db.execute(sql.raw(`
      SELECT * FROM audit_logs 
      ${whereClause}
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `));
    
    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      tableName: row.table_name,
      recordId: row.record_id,
      action: row.action,
      oldValues: row.old_values,
      newValues: row.new_values,
      changedFields: row.changed_fields,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      timestamp: row.timestamp
    })) as AuditLog[];
  }

  // Método auxiliar para automatizar auditoria
  async auditDataChange(
    userId: string, 
    sessionId: string, 
    tableName: string, 
    recordId: string, 
    action: 'create' | 'update' | 'delete',
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    request?: any
  ) {
    try {
      const changedFields = [];
      
      if (action === 'update' && oldValues && newValues) {
        for (const key in newValues) {
          if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
            changedFields.push(key);
          }
        }
      }

      await this.createAuditLog({
        userId,
        sessionId,
        tableName,
        recordId,
        action,
        oldValues: oldValues || null,
        newValues: newValues || null,
        changedFields,
        ipAddress: request?.ip || request?.connection?.remoteAddress,
        userAgent: request?.get?.('User-Agent'),
      });

      console.log(`🔍 Audit logged: ${action} on ${tableName} record ${recordId} by user ${userId}`);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  // Medical Articles methods
  async getMedicalArticlesByWeek(week: number): Promise<MedicalArticle[]> {
    return await db.select().from(medicalArticles)
      .where(and(
        eq(medicalArticles.week, week),
        eq(medicalArticles.isActive, true)
      ))
      .orderBy(medicalArticles.importance, medicalArticles.createdAt);
  }

  async getMedicalArticle(id: string): Promise<MedicalArticle | undefined> {
    const result = await db.select().from(medicalArticles)
      .where(eq(medicalArticles.id, id))
      .limit(1);
    return result[0];
  }

  async createMedicalArticle(article: InsertMedicalArticle): Promise<MedicalArticle> {
    const result = await db.insert(medicalArticles)
      .values({
        ...article,
        tags: Array.isArray(article.tags) ? article.tags : []
      })
      .returning();
    return result[0];
  }

  async getAllMedicalArticles(): Promise<MedicalArticle[]> {
    return await db.select().from(medicalArticles).where(eq(medicalArticles.isActive, true));
  }

  // Garantir que a tabela de artigos médicos existe
  async ensureMedicalArticlesTableExists() {
    try {
      console.log("🏥 Creating medical articles table...");
      
      await client.query(`
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
      
      console.log("✅ Medical articles table created/verified");
      return true;
    } catch (error) {
      console.log("⚠️ Medical articles table error:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
export { db };
