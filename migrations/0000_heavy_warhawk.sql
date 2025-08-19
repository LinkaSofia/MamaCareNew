CREATE TABLE "access_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" text,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"success" boolean DEFAULT true,
	"error_message" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "birth_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"location" text,
	"pain_relief" jsonb,
	"companions" text,
	"special_requests" text,
	"preferences" jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_likes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"week" integer,
	"likes" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"title" text NOT NULL,
	"date" timestamp NOT NULL,
	"location" text,
	"doctor_name" text,
	"notes" text,
	"completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "diary_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"week" integer,
	"mood" text,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kick_counts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"count" integer NOT NULL,
	"times" jsonb
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"name" text NOT NULL,
	"dosage" text,
	"frequency" text,
	"prescribed_by" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"notes" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"object_path" text NOT NULL,
	"week" integer,
	"caption" text,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pregnancies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"due_date" timestamp NOT NULL,
	"last_menstrual_period" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopping_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2),
	"purchased" boolean DEFAULT false,
	"category" text,
	"priority" text,
	"purchase_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"name" text NOT NULL,
	"severity" integer,
	"date" timestamp NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"last_login_at" timestamp,
	"login_count" integer DEFAULT 0,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weight_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregnancy_id" varchar NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birth_plans" ADD CONSTRAINT "birth_plans_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kick_counts" ADD CONSTRAINT "kick_counts_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_items" ADD CONSTRAINT "shopping_items_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_pregnancy_id_pregnancies_id_fk" FOREIGN KEY ("pregnancy_id") REFERENCES "public"."pregnancies"("id") ON DELETE no action ON UPDATE no action;