import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  loginCount: integer("login_count").default(0),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  times: jsonb("times").$type<string[]>(),
});

export const weightRecords = pgTable("weight_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pregnancyId: varchar("pregnancy_id").references(() => pregnancies.id).notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPregnancySchema = createInsertSchema(pregnancies).omit({ id: true, createdAt: true });
export const insertKickCountSchema = createInsertSchema(kickCounts).omit({ id: true });
export const insertWeightRecordSchema = createInsertSchema(weightRecords).omit({ id: true });
export const insertBirthPlanSchema = createInsertSchema(birthPlans).omit({ id: true, updatedAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true });
export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({ id: true, purchaseDate: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });
export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).omit({ id: true });
export const insertSymptomSchema = createInsertSchema(symptoms).omit({ id: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, likes: true, commentsCount: true, createdAt: true });
export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({ id: true, createdAt: true });
export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pregnancy = typeof pregnancies.$inferSelect;
export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;
export type KickCount = typeof kickCounts.$inferSelect;
export type InsertKickCount = z.infer<typeof insertKickCountSchema>;
export type WeightRecord = typeof weightRecords.$inferSelect;
export type InsertWeightRecord = z.infer<typeof insertWeightRecordSchema>;
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
