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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const birthPlans = pgTable("birth_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  
  // Informações Básicas
  location: text("location"),
  companions: text("companions"),
  doctorPreference: text("doctor_preference"),
  
  // Ambiente
  lighting: text("lighting"),
  music: boolean("music"),
  movement: boolean("movement"),
  
  // Alívio da Dor
  painReliefNatural: boolean("pain_relief_natural"),
  painReliefEpidural: boolean("pain_relief_epidural"),
  painReliefOther: text("pain_relief_other"),
  
  // Durante o Trabalho de Parto
  laborPosition: text("labor_position"),
  monitoring: text("monitoring"),
  hydrationFood: boolean("hydration_food"),
  
  // Durante o Parto
  deliveryType: text("delivery_type"),
  episiotomy: text("episiotomy"),
  umbilicalCord: text("umbilical_cord"),
  skinToSkin: boolean("skin_to_skin"),
  
  // Pós-Parto
  breastfeeding: text("breastfeeding"),
  babyBath: text("baby_bath"),
  companionPresence: boolean("companion_presence"),
  
  // Solicitações Especiais
  photos: boolean("photos"),
  religiousCultural: text("religious_cultural"),
  specialRequests: text("special_requests"),
  
  createdAt: timestamp("created_at").defaultNow(),
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
  essential: boolean("essential").default(false),
  purchaseDate: timestamp("purchase_date"),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  objectPath: text("object_path").notNull(),
  week: integer("week"),
  caption: text("caption"),
  date: timestamp("date").notNull(),
  favorite: boolean("favorite").default(false),
  milestone: text("milestone"),
});

export const diaryEntries = pgTable("diary_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  week: integer("week"),
  mood: text("mood"),
  emotions: text("emotions"), // JSON string array
  milestone: text("milestone"),
  prompts: text("prompts"), // JSON string array
  date: timestamp("date").notNull(),
  image: text("image"), // Imagem em base64
});

// Tabela para múltiplos anexos do diário (imagens, PDFs, etc)
export const diaryAttachments = pgTable("diary_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diaryEntryId: varchar("diary_entry_id").references(() => diaryEntries.id, { onDelete: "cascade" }).notNull(),
  fileUrl: text("file_url").notNull(), // URL do arquivo no Supabase Storage
  fileType: varchar("file_type", { length: 50 }).notNull(), // 'image/jpeg', 'application/pdf', etc
  fileName: varchar("file_name", { length: 255 }), // Nome original do arquivo
  fileSize: integer("file_size"), // Tamanho em bytes
  createdAt: timestamp("created_at").defaultNow(),
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
  baby_image_url: text("baby_image_url"), // Campo para URL da imagem do bebê
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
export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({ id: true, createdAt: true })
  .extend({
    weight: z.union([z.string(), z.number()]).transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(num)) throw new Error('Peso deve ser um número válido');
      return num;
    }),
    date: z.union([z.string(), z.date()]).transform((val) => {
      return typeof val === 'string' ? new Date(val) : val;
    }),
    notes: z.string().optional().nullable().transform((val) => val || null),
  });

// Schema específico para atualização - mais permissivo
export const updateWeightEntrySchema = z.object({
  weight: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === undefined) return undefined;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) throw new Error('Peso deve ser um número válido');
    return num;
  }),
  date: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (val === undefined) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }),
  notes: z.string().optional().nullable().transform((val) => val || null),
}).partial();
export const insertBirthPlanSchema = createInsertSchema(birthPlans).omit({ id: true, updatedAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true }).extend({
  date: z.string().transform((val) => new Date(val)),
});
export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({ id: true, purchaseDate: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });
// Schema base para inserção (sem transformações)
const baseDiaryEntrySchema = createInsertSchema(diaryEntries).omit({ id: true })
  .extend({
    // Garantir que title seja obrigatório e string
    title: z.string().min(1, "Título é obrigatório"),
    // Garantir que content seja obrigatório e string
    content: z.string().min(1, "Conteúdo é obrigatório"),
    // Garantir que pregnancyId seja obrigatório e string
    pregnancyId: z.string().min(1, "ID da gravidez é obrigatório"),
    // Garantir que date seja uma data válida
    date: z.date(),
    // Campos opcionais
    week: z.number().nullable().optional(),
    mood: z.string().nullable().optional(),
    emotions: z.string().nullable().optional(),
    milestone: z.string().nullable().optional(),
    prompts: z.string().nullable().optional(),
    image: z.string().nullable().optional(), // Imagem em base64
  });

// Schema para inserção com transformações
export const insertDiaryEntrySchema = baseDiaryEntrySchema
  .transform((data) => ({
    ...data,
    // Converter undefined para null para campos opcionais
    milestone: data.milestone === undefined ? null : data.milestone,
    week: data.week === undefined ? null : data.week,
    mood: data.mood === undefined ? null : data.mood,
    emotions: data.emotions === undefined ? null : data.emotions,
    prompts: data.prompts === undefined ? null : data.prompts,
    image: data.image === undefined ? null : data.image,
  }));

// Schema para atualização (parcial e sem transformações)
export const updateDiaryEntrySchema = baseDiaryEntrySchema.partial();

// Schemas para anexos do diário
export const insertDiaryAttachmentSchema = createInsertSchema(diaryAttachments).omit({ id: true, createdAt: true })
  .extend({
    diaryEntryId: z.string().min(1, "ID da entrada do diário é obrigatório"),
    fileUrl: z.string().url("URL do arquivo deve ser válida"),
    fileType: z.string().min(1, "Tipo do arquivo é obrigatório"),
    fileName: z.string().nullable().optional(),
    fileSize: z.number().nullable().optional(),
  });

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
export type DiaryAttachment = typeof diaryAttachments.$inferSelect;
export type InsertDiaryAttachment = z.infer<typeof insertDiaryAttachmentSchema>;
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

// Tabela para artigos e vídeos por semana (conforme solicitado pelo usuário)
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  week: integer("week").notNull(),
  video_url: text("video_url"), // URL do vídeo para embed
  image: text("image"), // URL da imagem do artigo
  source: text("source"), // Fonte do conteúdo
  type: text("type").notNull().default('article'), // 'article' ou 'video'
  description: text("description"),
  categoria: text("categoria"), // Categoria do artigo para organização
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles);
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
