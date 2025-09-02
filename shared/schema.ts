import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb, numeric, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  profilePhotoUrl: text("profile_photo_url"), // URL da foto de perfil no object storage
  birthDate: timestamp("birth_date"), // Data de nascimento (coletada no setup)
  // createdAt: timestamp("created_at").defaultNow(), // Will add back after migration
});

// Tabela de logs de acesso para auditoria completa
export const accessLogs = pgTable("access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email"),
  action: text("action").notNull(), // 'login', 'logout', 'register', 'password_reset'
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de analytics e comportamento do usuário
export const userAnalytics = pgTable("user_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").notNull(),
  action: text("action").notNull(), // 'page_view', 'click', 'scroll', 'focus', 'blur'
  page: text("page").notNull(), // '/dashboard', '/kick-counter', etc.
  element: text("element"), // button id, link, etc.
  duration: integer("duration"), // tempo em milissegundos para page_view
  metadata: jsonb("metadata").$type<Record<string, any>>(), // dados adicionais específicos da ação
  timestamp: timestamp("timestamp").defaultNow(),
});

// Tabela para sessões de usuário com tempo total
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id").notNull().unique(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalDuration: integer("total_duration"), // em segundos
  pagesVisited: jsonb("pages_visited").$type<string[]>().default([]),
  actionsCount: integer("actions_count").default(0),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

export const pregnancies = pgTable("pregnancies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  dueDate: timestamp("due_date").notNull(),
  lastMenstrualPeriod: timestamp("last_menstrual_period"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kickCounts = pgTable("kick_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  date: timestamp("date").notNull(),
  count: integer("count").notNull(),
  times: jsonb("times").$type<string[]>().default([]),
});

export const weightRecords = pgTable("weight_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const birthPlans = pgTable("birth_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  location: text("location"),
  painRelief: jsonb("pain_relief").$type<{natural: boolean, epidural: boolean, other?: string}>(),
  companions: text("companions"),
  specialRequests: text("special_requests"),
  preferences: jsonb("preferences").$type<Record<string, any>>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  doctorName: text("doctor_name"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
});

export const shoppingItems = pgTable("shopping_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  purchased: boolean("purchased").default(false),
  category: text("category"),
  priority: text("priority"),
  purchaseDate: timestamp("purchase_date"),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  objectPath: text("object_path").notNull(),
  week: integer("week"),
  caption: text("caption"),
  date: timestamp("date").notNull(),
});

export const diaryEntries = pgTable("diary_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  title: text("title"),
  content: text("content").notNull(),
  week: integer("week"),
  mood: text("mood"),
  date: timestamp("date").notNull(),
});

export const symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  name: text("name").notNull(),
  severity: integer("severity"), // 1-5 scale
  date: timestamp("date").notNull(),
  notes: text("notes"),
});

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  prescribedBy: text("prescribed_by"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"),
  content: text("content").notNull(),
  week: integer("week"),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityComments = pgTable("community_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => communityPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityLikes = pgTable("community_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => communityPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const babyDevelopment = pgTable("baby_development", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull().unique(),
  size: text("size").notNull(),
  weight: text("weight").notNull(),
  fruit_comparison: text("fruit_comparison").notNull(),
  fruit_image_url: text("fruit_image_url"), // Campo para URL da imagem da fruta/grão
  development_milestones_baby: text("development_milestones_baby").notNull(),
  development_milestones_mom: text("development_milestones_mom").notNull(),
  baby_description: text("baby_description"),
  mom_description: text("mom_description"),
  length_cm: numeric("length_cm").default(sql`0`),
  weight_grams: numeric("weight_grams").default(sql`0`),
});

// Tabela de auditoria completa - registra todas as modificações de dados
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: text("session_id"),
  tableName: text("table_name").notNull(), // birth_plans, kick_counts, weight_entries, etc
  recordId: text("record_id").notNull(), // ID do registro modificado
  action: text("action").notNull(), // 'create', 'update', 'delete'
  oldValues: jsonb("old_values").$type<Record<string, any>>(), // dados antes da modificação
  newValues: jsonb("new_values").$type<Record<string, any>>(), // dados depois da modificação
  changedFields: jsonb("changed_fields").$type<string[]>(), // campos que mudaram
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});
export const insertPregnancySchema = createInsertSchema(pregnancies).omit({ id: true, createdAt: true });
export const insertKickCountSchema = createInsertSchema(kickCounts).omit({ id: true });
export const insertWeightRecordSchema = createInsertSchema(weightRecords).omit({ id: true });
export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({ id: true, createdAt: true });
export const insertBirthPlanSchema = createInsertSchema(birthPlans).omit({ id: true, updatedAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true }).extend({
  date: z.string().transform((val) => new Date(val)),
});
export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({ id: true, purchaseDate: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });
export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({ id: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, likes: true, commentsCount: true, createdAt: true });
export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({ id: true, createdAt: true });
export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({ id: true, createdAt: true });
export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({ id: true, timestamp: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, startTime: true, endTime: true });
export const insertBabyDevelopmentSchema = createInsertSchema(babyDevelopment).omit({ id: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pregnancy = typeof pregnancies.$inferSelect;
export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;
export type KickCount = typeof kickCounts.$inferSelect;
export type InsertKickCount = z.infer<typeof insertKickCountSchema>;
export type WeightRecord = typeof weightRecords.$inferSelect;
export type InsertWeightRecord = z.infer<typeof insertWeightRecordSchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type BirthPlan = typeof birthPlans.$inferSelect;
export type InsertBirthPlan = z.infer<typeof insertBirthPlanSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type BabyDevelopment = typeof babyDevelopment.$inferSelect;
export type InsertBabyDevelopment = z.infer<typeof insertBabyDevelopmentSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Tabela para artigos médicos por semana
export const medicalArticles = pgTable("medical_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(), // Nome do hospital/fonte
  sourceUrl: text("source_url"), // Link opcional para o artigo original
  category: text("category").notNull(), // 'nutrition', 'exercise', 'health', 'preparation', 'symptoms'
  importance: text("importance").notNull().default('medium'), // 'low', 'medium', 'high'
  readingTime: integer("reading_time").default(5), // tempo estimado de leitura em minutos
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicalArticleSchema = createInsertSchema(medicalArticles);
export type MedicalArticle = typeof medicalArticles.$inferSelect;
export type InsertMedicalArticle = z.infer<typeof insertMedicalArticleSchema>;
