import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, pregnancies, kickCounts, weightRecords, birthPlans, consultations, 
  shoppingItems, photos, diaryEntries, symptoms, medications, communityPosts, 
  communityComments, communityLikes, accessLogs,
  type User, type InsertUser, type Pregnancy, type InsertPregnancy,
  type KickCount, type InsertKickCount, type WeightRecord, type InsertWeightRecord,
  type BirthPlan, type InsertBirthPlan, type Consultation, type InsertConsultation,
  type ShoppingItem, type InsertShoppingItem, type Photo, type InsertPhoto,
  type DiaryEntry, type InsertDiaryEntry, type Symptom, type InsertSymptom,
  type Medication, type InsertMedication, type CommunityPost, type InsertCommunityPost,
  type CommunityComment, type InsertCommunityComment, type AccessLog, type InsertAccessLog
} from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validatePassword(email: string, password: string): Promise<User | null>;

  // Pregnancies
  getActivePregnancy(userId: string): Promise<Pregnancy | undefined>;
  createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy>;
  updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<void>;

  // Kick Counts
  getKickCountsForDate(pregnancyId: string, date: Date): Promise<KickCount[]>;
  createKickCount(kickCount: InsertKickCount): Promise<KickCount>;
  getTodaysKickCount(pregnancyId: string): Promise<number>;

  // Weight Records
  getWeightRecords(pregnancyId: string): Promise<WeightRecord[]>;
  createWeightRecord(weightRecord: InsertWeightRecord): Promise<WeightRecord>;
  getLatestWeight(pregnancyId: string): Promise<WeightRecord | undefined>;

  // Birth Plans
  getBirthPlan(pregnancyId: string): Promise<BirthPlan | undefined>;
  createOrUpdateBirthPlan(birthPlan: InsertBirthPlan): Promise<BirthPlan>;

  // Consultations
  getConsultations(pregnancyId: string): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<void>;
  getUpcomingConsultations(pregnancyId: string): Promise<Consultation[]>;

  // Shopping Items
  getShoppingItems(pregnancyId: string): Promise<ShoppingItem[]>;
  createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem>;
  updateShoppingItem(id: string, updates: Partial<InsertShoppingItem>): Promise<void>;
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

  // Recuperação de senha
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  resetPasswordWithToken(token: string, newPassword: string): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Fazer busca case-insensitive
      const normalizedEmail = email.toLowerCase().trim();
      const result = await db.select().from(users).where(sql`LOWER(${users.email}) = ${normalizedEmail}`).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(users).values({
      ...user,
      password: hashedPassword,
      id: randomUUID(),
    }).returning();
    return newUser;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
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

  async updatePregnancy(id: string, updates: Partial<InsertPregnancy>): Promise<void> {
    await db.update(pregnancies).set(updates).where(eq(pregnancies.id, id));
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

  async createWeightRecord(weightRecord: InsertWeightRecord): Promise<WeightRecord> {
    const [newRecord] = await db.insert(weightRecords).values({
      ...weightRecord,
      id: randomUUID(),
    }).returning();
    return newRecord;
  }

  async getLatestWeight(pregnancyId: string): Promise<WeightRecord | undefined> {
    const result = await db.select().from(weightRecords)
      .where(eq(weightRecords.pregnancyId, pregnancyId))
      .orderBy(desc(weightRecords.date))
      .limit(1);
    return result[0];
  }

  async getBirthPlan(pregnancyId: string): Promise<BirthPlan | undefined> {
    const result = await db.select().from(birthPlans)
      .where(eq(birthPlans.pregnancyId, pregnancyId))
      .limit(1);
    return result[0];
  }

  async createOrUpdateBirthPlan(birthPlan: InsertBirthPlan): Promise<BirthPlan> {
    const existing = await this.getBirthPlan(birthPlan.pregnancyId);
    
    if (existing) {
      const [updated] = await db.update(birthPlans)
        .set({ 
          pregnancyId: birthPlan.pregnancyId,
          location: birthPlan.location,
          painRelief: birthPlan.painRelief as any,
          companions: birthPlan.companions,
          specialRequests: birthPlan.specialRequests,
          preferences: birthPlan.preferences,

        })
        .where(eq(birthPlans.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(birthPlans).values({
        pregnancyId: birthPlan.pregnancyId,
        location: birthPlan.location,
        painRelief: birthPlan.painRelief as any,
        companions: birthPlan.companions,
        specialRequests: birthPlan.specialRequests,
        preferences: birthPlan.preferences,
        id: randomUUID(),
      }).returning();
      return created;
    }
  }

  async getConsultations(pregnancyId: string): Promise<Consultation[]> {
    return await db.select().from(consultations)
      .where(eq(consultations.pregnancyId, pregnancyId))
      .orderBy(desc(consultations.date));
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db.insert(consultations).values({
      ...consultation,
      id: randomUUID(),
    }).returning();
    return newConsultation;
  }

  async updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<void> {
    await db.update(consultations).set(updates).where(eq(consultations.id, id));
  }

  async getUpcomingConsultations(pregnancyId: string): Promise<Consultation[]> {
    const now = new Date();
    return await db.select().from(consultations)
      .where(and(
        eq(consultations.pregnancyId, pregnancyId),
        sql`${consultations.date} > ${now}`,
        eq(consultations.completed, false)
      ))
      .orderBy(consultations.date);
  }

  async getShoppingItems(pregnancyId: string): Promise<ShoppingItem[]> {
    return await db.select().from(shoppingItems)
      .where(eq(shoppingItems.pregnancyId, pregnancyId))
      .orderBy(shoppingItems.purchased, desc(shoppingItems.priority));
  }

  async createShoppingItem(item: InsertShoppingItem): Promise<ShoppingItem> {
    const [newItem] = await db.insert(shoppingItems).values({
      ...item,
      id: randomUUID(),
    }).returning();
    return newItem;
  }

  async updateShoppingItem(id: string, updates: Partial<InsertShoppingItem>): Promise<void> {
    const updateData = { ...updates };
    if (updates.purchased) {
      // Note: purchaseDate is handled at the database level with the purchase timestamp
      await db.update(shoppingItems).set({
        ...updateData,
        purchaseDate: new Date()
      }).where(eq(shoppingItems.id, id));
    } else {
      await db.update(shoppingItems).set(updateData).where(eq(shoppingItems.id, id));
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
    const [newEntry] = await db.insert(diaryEntries).values({
      ...entry,
      id: randomUUID(),
    }).returning();
    return newEntry;
  }

  async updateDiaryEntry(id: string, updates: Partial<InsertDiaryEntry>): Promise<void> {
    await db.update(diaryEntries).set(updates).where(eq(diaryEntries.id, id));
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
  async createAccessLog(log: InsertAccessLog): Promise<AccessLog> {
    try {
      const [newLog] = await db.insert(accessLogs).values({
        ...log,
        id: randomUUID(),
      }).returning();
      return newLog;
    } catch (error: any) {
      console.log("Access log creation failed:", error?.message || "Unknown error");
      // Retornar um objeto vazio ao invés de falhar
      return {} as AccessLog;
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

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    // Usar memória temporariamente até ajustar schema do Supabase
    this.resetTokens.set(token, { token, expires, userId });
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const tokenData = this.resetTokens.get(token);
      if (!tokenData || tokenData.expires <= new Date()) {
        return undefined;
      }

      // Buscar usuário no banco pelo ID
      const result = await db.select().from(users).where(eq(users.id, tokenData.userId)).limit(1);
      const user = result[0];
      
      if (!user) {
        return undefined;
      }

      // Adicionar propriedades de token para compatibilidade
      return {
        ...user,
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
}

export const storage = new DatabaseStorage();
