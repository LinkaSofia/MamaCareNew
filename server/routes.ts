import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertUserSchema, insertPregnancySchema, insertKickCountSchema, insertWeightRecordSchema, insertWeightEntrySchema, updateWeightEntrySchema, insertBirthPlanSchema, insertConsultationSchema, insertShoppingItemSchema, insertPhotoSchema, insertDiaryEntrySchema, updateDiaryEntrySchema, insertSymptomSchema, insertMedicationSchema, insertCommunityPostSchema, insertCommunityCommentSchema, insertBabyDevelopmentSchema, babyDevelopment, articles, insertArticleSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
// FileStore removido - usando MemoryStore (in-memory) para compatibilidade com Render
import { sendPasswordResetEmail } from "./nodemailer";
import { randomUUID } from "crypto";
import { db } from "./storage";
import { sql, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import cors from "cors";

// Simple session store for user authentication
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configurar CORS para permitir cookies
  app.use(cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:5173',
      'https://friendly-alpaca-bf0d68.netlify.app',
      'https://splendorous-rabanadas-6fe8f2.netlify.app',
      'https://joyful-bavarois-e44cbe.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Cache-Control', 'Pragma', 'Expires']
  }));

  // Servir arquivos estáticos do diretório public
  app.use(express.static(path.join(process.cwd(), 'client/public')));
  
  // Endpoint para servir imagens do desenvolvimento do bebê
  app.get("/api/baby-development/image/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      if (isNaN(week)) {
        return res.status(400).json({ error: "Week must be a number" });
      }

      const result = await db.select().from(babyDevelopment).where(eq(babyDevelopment.week, week)).limit(1);
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Week not found" });
      }

      const babyDev = result[0];
      
      console.log("🔍 Baby dev data:", {
        week: babyDev.week,
        baby_image_url: babyDev.baby_image_url,
        url_type: typeof babyDev.baby_image_url,
        starts_with_http: babyDev.baby_image_url?.startsWith('http')
      });
      
      if (!babyDev.baby_image_url) {
        console.log("❌ No baby_image_url found");
        return res.status(404).json({ error: "Image not found for this week" });
      }

      // Se a URL já é completa (Supabase), redirecionar diretamente
      if (babyDev.baby_image_url && babyDev.baby_image_url.startsWith('http')) {
        console.log("🔄 Redirecting to Supabase URL:", babyDev.baby_image_url);
        return res.redirect(babyDev.baby_image_url);
      }
      
      console.log("📁 Trying local file path for:", babyDev.baby_image_url);
      
      // Construir o caminho para o arquivo de imagem local
      const imagePath = path.join(process.cwd(), 'client/public/baby-images', babyDev.baby_image_url);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image file not found" });
      }

      // Detectar o tipo de imagem baseado na extensão
      const ext = path.extname(babyDev.baby_image_url).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';

      // Servir o arquivo de imagem
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
      res.sendFile(imagePath);
    } catch (error) {
      console.error("Error serving baby development image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Endpoint de debug para verificar sessão
  app.get("/api/debug/session", (req, res) => {
    res.json({
      hasSession: !!req.session,
      sessionId: req.sessionID,
      sessionData: req.session,
      cookies: req.headers.cookie,
      userAgent: req.headers['user-agent']
    });
  });

  // Endpoint de debug para verificar dados do baby development
  app.get("/api/debug/baby-development/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const result = await db.select().from(babyDevelopment).where(eq(babyDevelopment.week, week)).limit(1);
      
      res.json({
        week,
        found: result.length > 0,
        data: result[0] || null,
        imagePath: result[0] ? path.join(process.cwd(), 'client/src/assets', result[0].baby_image_url || '') : null,
        imageExists: result[0] ? fs.existsSync(path.join(process.cwd(), 'client/src/assets', result[0].baby_image_url || '')) : false
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

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

  // Inserir imagem da 3ª semana (embrião) 
  app.post("/api/baby-development/update-week3-image", async (req, res) => {
    try {
      console.log("🤰 Inserindo nova imagem da 3ª semana (embrião)...");
      
      const imageUrl = "@assets/3_1757173100445.png";
      
      await db.execute(sql`UPDATE baby_development SET fruit_image_url = ${imageUrl} WHERE week = 3`);
      
      console.log("✅ Nova imagem da 3ª semana inserida!");
      res.json({ success: true, imageUrl });
    } catch (error: any) {
      console.error("❌ Erro:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 🆕 Endpoint genérico para inserir imagem de qualquer semana
  app.post("/api/baby-development/insert-image", async (req, res) => {
    try {
      const { week, imageUrl } = req.body;
      
      if (!week || !imageUrl) {
        return res.status(400).json({ 
          success: false, 
          error: "Semana e imageUrl são obrigatórios" 
        });
      }
      
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 40) {
        return res.status(400).json({ 
          success: false, 
          error: "Semana deve ser um número entre 1 e 40" 
        });
      }
      
      console.log(`🖼️ Inserindo imagem da semana ${weekNum}: ${imageUrl}`);
      
      // Atualizar a semana com a nova imagem
      const result = await db.update(babyDevelopment)
        .set({ fruit_image_url: imageUrl })
        .where(eq(babyDevelopment.week, weekNum))
        .returning();
      
      if (result.length > 0) {
        console.log(`✅ Imagem da semana ${weekNum} inserida com sucesso!`);
        res.json({ 
          success: true, 
          message: `Imagem da semana ${weekNum} inserida com sucesso!`,
          imageUrl,
          week: weekNum,
          data: result[0]
        });
      } else {
        console.log(`⚠️ Semana ${weekNum} não encontrada no banco`);
        res.status(404).json({ 
          success: false, 
          message: `Semana ${weekNum} não encontrada no banco de dados` 
        });
      }
    } catch (error: any) {
      console.error("❌ Erro ao inserir imagem:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Endpoint para atualizar baby_image_url
  app.post("/api/baby-development/insert-baby-image", async (req, res) => {
    try {
      const { week, imageUrl } = req.body;
      
      if (!week || !imageUrl) {
        return res.status(400).json({ 
          success: false, 
          error: "Semana e imageUrl são obrigatórios" 
        });
      }
      
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 40) {
        return res.status(400).json({ 
          success: false, 
          error: "Semana deve ser um número entre 1 e 40" 
        });
      }
      
      console.log(`👶 Inserindo baby_image_url da semana ${weekNum}: ${imageUrl}`);
      
      // Atualizar a semana com a nova baby_image_url
      const result = await db.update(babyDevelopment)
        .set({ baby_image_url: imageUrl })
        .where(eq(babyDevelopment.week, weekNum))
        .returning();
      
      if (result.length > 0) {
        console.log(`✅ Baby image da semana ${weekNum} inserida com sucesso!`);
        res.json({ 
          success: true, 
          message: `Baby image da semana ${weekNum} inserida com sucesso!`,
          imageUrl,
          week: weekNum,
          data: result[0]
        });
      } else {
        console.log(`⚠️ Semana ${weekNum} não encontrada no banco`);
        res.status(404).json({ 
          success: false, 
          message: `Semana ${weekNum} não encontrada no banco de dados` 
        });
      }
    } catch (error: any) {
      console.error("❌ Erro ao inserir baby image:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
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
    console.log("🔍 API /api/test-simple called");
    res.json({ message: "Test endpoint working!" });
  });

  // Rota de teste para categorias (sem autenticação)
  app.get("/api/test-categories", (req, res) => {
    console.log("🔍 API /api/test-categories called");
    res.json({ 
      message: "Categories test endpoint working!",
      categories: [
        { name: "Saúde e Bem-estar", icon: "🥦" },
        { name: "Gestação", icon: "👶" }
      ]
    });
  });

  // Buscar todos os artigos organizados por categoria (sem auth)
  app.get("/api/articles/categories", async (req, res) => {
    console.log("🔍 API /api/articles/categories called");
    try {
      // Buscar todos os artigos ativos
      const allArticles = await db.select({
        id: articles.id,
        title: articles.title,
        week: articles.week,
        video_url: articles.video_url,
        image: articles.image,
        source: articles.source,
        type: articles.type,
        description: articles.description,
        categoria: articles.categoria,
        isActive: articles.isActive
      })
        .from(articles)
        .where(sql`is_active IS NULL OR is_active = true`)
        .orderBy(sql`categoria ASC, week ASC`);

      // Organizar por categoria
      const categories = {
        'saude-bem-estar': {
          icon: '🥦',
          name: 'Saúde e Bem-estar',
          subcategories: {
            'alimentacao': 'Alimentação e nutrição na gestação',
            'atividade-fisica': 'Atividade física segura',
            'sono': 'Sono e descanso',
            'saude-mental': 'Saúde mental e emocional'
          },
          articles: []
        },
        'gestacao': {
          icon: '👶',
          name: 'Gestação',
          subcategories: {
            'sintomas': 'Sintomas comuns e como lidar',
            'exames': 'Exames pré-natais',
            'desenvolvimento': 'Desenvolvimento do bebê por trimestre',
            'complicacoes': 'Complicações mais frequentes'
          },
          articles: []
        },
        'preparacao-parto': {
          icon: '🧘',
          name: 'Preparação para o Parto',
          subcategories: {
            'tipos-parto': 'Tipos de parto (normal, cesárea, humanizado)',
            'plano-parto': 'Plano de parto',
            'tecnicas': 'Técnicas de respiração e relaxamento',
            'sinais': 'Sinais de trabalho de parto'
          },
          articles: []
        },
        'pos-parto': {
          icon: '🤱',
          name: 'Pós-parto e Recuperação',
          subcategories: {
            'recuperacao': 'Recuperação física (cesárea e parto normal)',
            'saude-emocional': 'Saúde emocional no puerpério',
            'amamentacao': 'Amamentação e cuidados com o seio',
            'planejamento': 'Planejamento familiar e anticoncepção pós-parto'
          },
          articles: []
        },
        'cuidados-bebe': {
          icon: '🍼',
          name: 'Cuidados com o Bebê',
          subcategories: {
            'primeiros-cuidados': 'Primeiros cuidados (banho, sono, fraldas)',
            'aleitamento': 'Aleitamento materno e introdução alimentar',
            'vacinacao': 'Vacinação',
            'desenvolvimento': 'Desenvolvimento nos primeiros meses'
          },
          articles: []
        },
        'rede-apoio': {
          icon: '💕',
          name: 'Rede de Apoio',
          subcategories: {
            'parceiro': 'Participação do parceiro(a)',
            'familia': 'Apoio familiar',
            'direitos': 'Direitos da gestante e da lactante (trabalho, licença)'
          },
          articles: []
        }
      };

      // Categorizar artigos baseado na coluna categoria
      allArticles.forEach(article => {
        const categoria = (article.categoria || '').toLowerCase().trim();
        console.log(`📝 Processing article: "${article.title}" with category: "${categoria}"`);
        
        // Mapear categorias do banco para as categorias do sistema usando valores mais flexíveis
        let categoryKey = 'gestacao'; // Default
        
        // Saúde e Bem-estar
        if (categoria.includes('saúde') || categoria.includes('saude') || categoria.includes('bem-estar') || 
            categoria.includes('alimentação') || categoria.includes('alimentacao') || 
            categoria.includes('exercício') || categoria.includes('exercicio') ||
            categoria.includes('nutrição') || categoria.includes('nutricao')) {
          categoryKey = 'saude-bem-estar';
        }
        // Preparação para o Parto
        else if (categoria.includes('parto') || categoria.includes('preparação') || categoria.includes('preparacao') ||
                 categoria.includes('trabalho de parto') || categoria.includes('cesárea') || categoria.includes('cesarea')) {
          categoryKey = 'preparacao-parto';
        }
        // Pós-parto e Recuperação
        else if (categoria.includes('pós-parto') || categoria.includes('pos-parto') || categoria.includes('puerpério') || 
                 categoria.includes('puerperio') || categoria.includes('recuperação') || categoria.includes('recuperacao')) {
          categoryKey = 'pos-parto';
        }
        // Cuidados com o Bebê
        else if (categoria.includes('bebê') || categoria.includes('bebe') || categoria.includes('cuidados') ||
                 categoria.includes('aleitamento') || categoria.includes('amamentação') || categoria.includes('amamentacao')) {
          categoryKey = 'cuidados-bebe';
        }
        // Rede de Apoio
        else if (categoria.includes('apoio') || categoria.includes('família') || categoria.includes('familia') ||
                 categoria.includes('direitos') || categoria.includes('parceiro')) {
          categoryKey = 'rede-apoio';
        }
        // Gestação (default e explícito)
        else if (categoria.includes('gestação') || categoria.includes('gestacao') || categoria.includes('gravidez')) {
          categoryKey = 'gestacao';
        }

        console.log(`🎯 Article "${article.title}" mapped to category: "${categoryKey}"`);
        
        if (categories[categoryKey]) {
          categories[categoryKey].articles.push(article);
        }
      });

      res.json({ 
        success: true, 
        categories: Object.values(categories) // Mostrar todas as categorias, mesmo vazias
      });
    } catch (error: any) {
      console.error("Error fetching articles by categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Session middleware for authentication
  // REMOVIDO FileStore - Render tem filesystem efêmero
  // Usando MemoryStore (in-memory) que funciona imediatamente
  
  console.log('🔧 Session Config:', {
    NODE_ENV: process.env.NODE_ENV,
    usingMemoryStore: true,
    secure: true,
    sameSite: 'none',
    proxy: true
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "maternity-app-secret-key-for-mama-care-app-v2",
    // SEM store = usa MemoryStore (in-memory) - funciona no Render!
    resave: false, 
    saveUninitialized: false,
    cookie: { 
      secure: true, // SEMPRE true para HTTPS (Render sempre usa HTTPS)
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'none', // SEMPRE 'none' para cross-domain HTTPS
      domain: undefined // Deixar o navegador decidir
    },
    name: 'mama-care-session-v2', // Force new session cookie
    proxy: true // SEMPRE true no Render (proxy reverso)
  }));

  // Authentication middleware - aceita session OU token
  const requireAuth = (req: any, res: any, next: any) => {
    // Tentar session primeiro
    if (req.session && req.session.userId) {
      console.log("🔐 Auth via session:", { userId: req.session.userId });
      req.userId = req.session.userId;
      return next();
    }
    
    // Tentar token do header
    const authToken = req.headers['x-auth-token'];
    if (authToken) {
      try {
        const decoded = JSON.parse(Buffer.from(authToken, 'base64').toString());
        if (decoded.userId && decoded.timestamp) {
          // Token válido por 24h
          if (Date.now() - decoded.timestamp < 24 * 60 * 60 * 1000) {
            console.log("🔑 Auth via token:", { userId: decoded.userId });
            req.userId = decoded.userId;
            return next();
          }
        }
      } catch (error) {
        console.log("❌ Invalid token:", error);
      }
    }
    
    console.log("❌ No valid session or token");
    return res.status(401).json({ error: "Authentication required" });
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
      
      // USAR SESSÃO E TAMBÉM RETORNAR TOKEN
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
        
        // Criar um token simples (userId) para autenticação alternativa via localStorage
        const authToken = Buffer.from(JSON.stringify({ 
          userId: user.id, 
          email: user.email,
          timestamp: Date.now()
        })).toString('base64');
        
        res.json({ 
          user: { id: user.id, email: user.email, name: user.name },
          authToken: authToken  // Token para localStorage
        });
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
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("❌ User not found in DB:", email);
        return res.status(404).json({ 
          error: "Email não cadastrado no sistema. Verifique o endereço ou crie uma conta." 
        });
      }
      
      console.log("📧 Found real user:", user.email);

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

  app.get("/api/auth/me", async (req, res) => {
    // Headers para evitar cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    let userId = req.session?.userId;
    
    // Se não tem session, tentar token do localStorage
    if (!userId) {
      const authToken = req.headers['x-auth-token'];
      if (authToken) {
        try {
          const decoded = JSON.parse(Buffer.from(authToken as string, 'base64').toString());
          if (decoded.userId && decoded.timestamp) {
            // Token válido por 24h
            if (Date.now() - decoded.timestamp < 24 * 60 * 60 * 1000) {
              userId = decoded.userId;
              console.log("🔑 Auth via token:", { userId });
            }
          }
        } catch (error) {
          console.log("❌ Invalid token:", error);
        }
      }
    } else {
      console.log("🔐 Auth via session:", { userId });
    }
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(userId);
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
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ 
        method: "PUT",
        url: uploadURL 
      });
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
      
      // Se tem URL de upload, normalize o path e configure ACL
      let normalizedPhotoUrl = profilePhotoUrl;
      if (profilePhotoUrl && profilePhotoUrl.includes('storage.googleapis.com')) {
        const objectStorageService = new ObjectStorageService();
        normalizedPhotoUrl = await objectStorageService.trySetObjectEntityAclPolicy(
          profilePhotoUrl,
          {
            owner: userId,
            visibility: "public", // Profile photos são públicas
          }
        );
      }
      
      const updatedUser = await storage.updateUserProfile(userId, {
        profilePhotoUrl: normalizedPhotoUrl,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      });
      
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Route to serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Logout route
  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      console.log("User logout:", userId);
      
      // Log the logout activity
      if (userId) {
        await storage.logUserAccess({
          userId,
          type: 'logout',
          success: true,
          timestamp: new Date(),
        });
      }
      
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        
        // Clear session cookie
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
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
      console.log("⚖️ Weight entry data received:", JSON.stringify(req.body, null, 2));
      
      // Log each field individually
      console.log("⚖️ Field validation:");
      console.log("  - weight:", req.body.weight, typeof req.body.weight);
      console.log("  - date:", req.body.date, typeof req.body.date);
      console.log("  - notes:", req.body.notes, typeof req.body.notes);
      
      // Buscar gravidez ativa do usuário
      const userId = req.session.userId!;
      const pregnancy = await storage.getActivePregnancy(userId);
      
      if (!pregnancy) {
        return res.status(400).json({ error: "Nenhuma gravidez ativa encontrada" });
      }
      
      console.log("⚖️ Found pregnancy:", pregnancy.id);
      
      // Preparar dados com pregnancyId
      const requestData = {
        ...req.body,
        pregnancyId: pregnancy.id,
        weight: req.body.weight.toString(),
        date: req.body.date ? new Date(req.body.date) : new Date()
      };
      
      console.log("⚖️ Processed weight data:", JSON.stringify(requestData, null, 2));
      console.log("⚖️ Attempting to parse with Zod schema...");
      const weightData = insertWeightRecordSchema.parse(requestData);
      console.log("⚖️ Parsed weight data:", weightData);
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
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      
      // Log Zod validation errors specifically
      if (error && typeof error === 'object' && 'issues' in error) {
        console.error("❌ Zod validation issues:", JSON.stringify(error.issues, null, 2));
      }
      
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

  app.put("/api/weight-entries/:id", requireAuth, async (req, res) => {
    try {
      console.log("📊 Weight entry update request:", req.params.id, req.body);
      
      const userId = req.session.userId!;
      const pregnancy = await storage.getActivePregnancy(userId);
      
      if (!pregnancy) {
        return res.status(404).json({ error: "No active pregnancy found" });
      }

      // Processar dados de entrada
      const processedData = {
        ...req.body,
      };

      console.log("📊 Processed update data:", processedData);

      // Validar dados com Zod - usar schema específico para atualização
      const updateData = updateWeightEntrySchema.parse(processedData);
      console.log("📊 Validated update data:", updateData);

      const updatedEntry = await storage.updateWeightEntry(req.params.id, updateData);
      console.log("📊 Weight entry updated successfully:", updatedEntry);
      
      res.json({ success: true, entry: updatedEntry });
    } catch (error) {
      console.error("❌ Weight entry update error:", error);
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      res.status(500).json({ 
        error: "Failed to update weight entry", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete("/api/weight-entries/:id", requireAuth, async (req, res) => {
    try {
      console.log("🗑️ Weight entry delete request - ID:", req.params.id, "Type:", typeof req.params.id);
      
      const userId = req.session.userId!;
      const pregnancy = await storage.getActivePregnancy(userId);
      
      if (!pregnancy) {
        console.log("❌ No active pregnancy found for user:", userId);
        return res.status(404).json({ error: "No active pregnancy found" });
      }

      console.log("🗑️ Calling storage.deleteWeightEntry with ID:", req.params.id);
      const result = await storage.deleteWeightEntry(req.params.id);
      console.log("🗑️ Weight entry deleted successfully:", result);
      
      res.json({ success: true, id: result.id });
    } catch (error) {
      console.error("❌ Weight entry delete error:", error);
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      res.status(500).json({ 
        error: "Failed to delete weight entry", 
        details: error instanceof Error ? error.message : String(error) 
      });
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
      console.log("📸 Upload request received");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("📸 Generated upload URL:", uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("📸 Error generating upload URL:", error);
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
      console.log("📸 Photo creation request:", req.body);
      
      // Buscar gravidez ativa do usuário
      const userId = req.session.userId!;
      const pregnancy = await storage.getActivePregnancy(userId);
      
      if (!pregnancy) {
        return res.status(400).json({ error: "Nenhuma gravidez ativa encontrada" });
      }
      
      console.log("📸 Found pregnancy:", pregnancy.id);
      
      // Preparar dados com pregnancyId
      const requestData = {
        ...req.body,
        pregnancyId: pregnancy.id,
        objectPath: req.body.photoURL, // Usar photoURL como objectPath temporariamente
      };
      
      console.log("📸 Processed photo data:", requestData);
      const photoData = insertPhotoSchema.parse(requestData);
      console.log("📸 Parsed photo data:", photoData);
      
      const photo = await storage.createPhoto(photoData);
      console.log("📸 Photo created successfully:", photo);
      res.json({ photo });
    } catch (error) {
      console.error("📸 Error creating photo:", error);
      res.status(400).json({ error: "Invalid photo data", details: error instanceof Error ? error.message : "Unknown error" });
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
    console.log("📝 Diary entry data received:", JSON.stringify(req.body, null, 2));
    
    // Log each field individually
    console.log("📝 Field validation:");
    console.log("  - pregnancyId:", req.body.pregnancyId, typeof req.body.pregnancyId);
    console.log("  - title:", req.body.title, typeof req.body.title);
    console.log("  - content:", req.body.content, typeof req.body.content);
    console.log("  - mood:", req.body.mood, typeof req.body.mood);
    console.log("  - emotions:", req.body.emotions, typeof req.body.emotions);
    console.log("  - milestone:", req.body.milestone, typeof req.body.milestone);
    console.log("  - week:", req.body.week, typeof req.body.week);
    console.log("  - date:", req.body.date, typeof req.body.date);
    console.log("  - prompts:", req.body.prompts, typeof req.body.prompts);
    
    // Converter string date para Date object e undefined para null antes da validação
    const processedBody = {
      ...req.body,
      date: new Date(req.body.date),
      // Converter undefined para null para campos opcionais
      milestone: req.body.milestone === undefined || req.body.milestone === "" ? null : req.body.milestone,
      week: req.body.week === undefined || req.body.week === "" ? null : (isNaN(parseInt(req.body.week)) ? null : parseInt(req.body.week)),
      mood: req.body.mood === undefined || req.body.mood === "" ? null : req.body.mood,
      emotions: req.body.emotions === undefined || req.body.emotions === "" ? null : req.body.emotions,
      prompts: req.body.prompts === undefined || req.body.prompts === "" ? null : req.body.prompts,
    };
    
    console.log("📝 Processed body with converted date:", processedBody);
    console.log("📝 Date type after conversion:", typeof processedBody.date);
    
    console.log("📝 Attempting to parse with Zod schema...");
    const entryData = insertDiaryEntrySchema.parse(processedBody);
    console.log("📝 Parsed entry data:", entryData);
    const entry = await storage.createDiaryEntry(entryData);
    console.log("📝 Entry created successfully:", entry);
    res.json({ entry });
  } catch (error) {
    console.error("❌ Diary entry creation error:", error);
    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
    
    // Log Zod validation errors specifically
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error("❌ Zod validation issues:", JSON.stringify(error.issues, null, 2));
    }
    
    res.status(400).json({ error: "Invalid diary entry data", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

  app.put("/api/diary-entries/:id", requireAuth, async (req, res) => {
    try {
      console.log("📝 Updating diary entry:", req.params.id);
      console.log("📝 Update data:", JSON.stringify(req.body, null, 2));
      
      // Converter string date para Date object e undefined para null antes da validação
      const processedBody = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        // Converter undefined para null para campos opcionais
        milestone: req.body.milestone === undefined || req.body.milestone === "" ? null : req.body.milestone,
        week: req.body.week === undefined || req.body.week === "" ? null : (isNaN(parseInt(req.body.week)) ? null : parseInt(req.body.week)),
        mood: req.body.mood === undefined || req.body.mood === "" ? null : req.body.mood,
        emotions: req.body.emotions === undefined || req.body.emotions === "" ? null : req.body.emotions,
        prompts: req.body.prompts === undefined || req.body.prompts === "" ? null : req.body.prompts,
      };
      
      console.log("📝 Processed update data:", processedBody);
      
      // Validar apenas os campos que estão sendo atualizados
      const updateData = updateDiaryEntrySchema.parse(processedBody);
      console.log("📝 Validated update data:", updateData);
      
      const updatedEntry = await storage.updateDiaryEntry(req.params.id, updateData);
      console.log("📝 Entry updated successfully:", updatedEntry);
      res.json({ success: true, entry: updatedEntry });
    } catch (error) {
      console.error("❌ Diary entry update error:", error);
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      
      // Log Zod validation errors specifically
      if (error && typeof error === 'object' && 'issues' in error) {
        console.error("❌ Zod validation issues:", JSON.stringify(error.issues, null, 2));
      }
      
      res.status(400).json({ error: "Invalid diary entry data", details: error instanceof Error ? error.message : "Unknown error" });
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

  // Endpoint para inserir imagem do bebê (baby_image_url)
  app.post("/api/baby-development/insert-baby-image", async (req, res) => {
    try {
      const { week, imageUrl } = req.body;
      
      if (!week || !imageUrl) {
        return res.status(400).json({ 
          success: false, 
          error: "Semana e imageUrl são obrigatórios" 
        });
      }
      
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 40) {
        return res.status(400).json({ 
          success: false, 
          error: "Semana deve ser um número entre 1 e 40" 
        });
      }
      
      console.log(`👶 Inserindo imagem do bebê para semana ${weekNum}: ${imageUrl}`);
      
      // Atualizar a semana com a nova imagem do bebê
      await db.execute(sql`
        UPDATE baby_development 
        SET baby_image_url = ${imageUrl}
        WHERE week = ${weekNum}
      `);
      
      // Verificar se a inserção foi bem-sucedida
      const result = await db.select()
        .from(babyDevelopment)
        .where(sql`week = ${weekNum}`)
        .limit(1);
      
      if (result.length > 0) {
        console.log(`✅ Imagem do bebê da semana ${weekNum} inserida com sucesso!`);
        res.json({ 
          success: true, 
          message: `Imagem do bebê da semana ${weekNum} inserida com sucesso!`,
          imageUrl,
          week: weekNum,
          data: result[0]
        });
      } else {
        console.log(`⚠️ Semana ${weekNum} não encontrada no banco`);
        res.status(404).json({ 
          success: false, 
          message: `Semana ${weekNum} não encontrada no banco de dados` 
        });
      }
    } catch (error: any) {
      console.error("❌ Erro ao inserir imagem do bebê:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ==================== ENDPOINTS PARA ARTIGOS E VÍDEOS ====================
  
  // Criar tabela articles se não existir
  app.post("/api/articles/create-table", async (req, res) => {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS articles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          week INTEGER NOT NULL,
          video_url TEXT,
          image TEXT,
          type TEXT NOT NULL DEFAULT 'article',
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log("✅ Tabela articles criada/verificada com sucesso!");
      res.json({ success: true, message: "Tabela articles criada/verificada com sucesso!" });
    } catch (error: any) {
      console.error("❌ Erro ao criar tabela articles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint para popular artigos de exemplo
  app.post("/api/articles/seed", async (req, res) => {
    try {
      const sampleArticles = [
        {
          title: "Desenvolvimento do Sistema Nervoso",
          week: 3,
          type: "article",
          description: "Na terceira semana, o sistema nervoso do bebê começa a se formar. O tubo neural se desenvolve, dando origem ao cérebro e medula espinhal.",
          video_url: "https://www.youtube.com/embed/BHbtF_N5L5Q", // Vídeo sobre desenvolvimento fetal
          image: "/assets/week3-development.jpg",
        },
        {
          title: "Primeiros Batimentos do Coração",
          week: 3,
          type: "video",
          description: "O coração primitivo começa a se formar e dar os primeiros batimentos. Este é um marco importante no desenvolvimento fetal.",
          video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
          image: "/assets/heart-formation.jpg",
        },
        {
          title: "Formação dos Órgãos Principais",
          week: 3,
          type: "article",
          description: "Durante a terceira semana, os principais órgãos começam a se formar através do processo de organogênese.",
          image: "/assets/organ-formation.jpg",
        }
      ];

      const insertedArticles = [];
      for (const article of sampleArticles) {
        const [inserted] = await db.insert(articles)
          .values(article)
          .returning();
        insertedArticles.push(inserted);
      }
      
      console.log(`✅ ${insertedArticles.length} artigos de exemplo criados!`);
      res.json({ 
        success: true, 
        message: `${insertedArticles.length} artigos criados com sucesso!`,
        articles: insertedArticles
      });
    } catch (error: any) {
      console.error("❌ Erro ao criar artigos de exemplo:", error);
      res.status(500).json({ error: error.message });
    }
  });


  // Buscar artigos por semana
  app.get("/api/articles/week/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      
      if (isNaN(week) || week < 1 || week > 42) {
        return res.status(400).json({ error: "Semana deve ser um número entre 1 e 42" });
      }

      // Buscar dados da tabela com apenas as colunas que existem no Supabase
      const articlesData = await db.select({
        id: articles.id,
        title: articles.title,
        week: articles.week,
        video_url: articles.video_url,
        image: articles.image,
        source: articles.source,
        type: articles.type,
        description: articles.description,
        categoria: articles.categoria,
        isActive: articles.isActive
      })
        .from(articles)
        .where(sql`week = ${week} AND (is_active IS NULL OR is_active = true)`)
        .orderBy(sql`id ASC`)
        .limit(3); // Máximo 3 artigos por semana conforme solicitado
      
      console.log(`📚 Artigos encontrados para semana ${week}:`, articlesData.length);
      
      res.json({ 
        success: true, 
        week: week,
        articles: articlesData 
      });
    } catch (error: any) {
      console.error(`❌ Erro ao buscar artigos da semana ${req.params.week}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Criar/inserir artigo
  app.post("/api/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      
      const [newArticle] = await db.insert(articles)
        .values(validatedData)
        .returning();
      
      console.log(`✅ Artigo criado para semana ${validatedData.week}:`, validatedData.title);
      res.status(201).json({ 
        success: true, 
        message: "Artigo criado com sucesso!",
        article: newArticle 
      });
    } catch (error: any) {
      console.error("❌ Erro ao criar artigo:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Inserir artigo de exemplo para semana 1
  app.post("/api/articles/sample", async (req, res) => {
    try {
      // Primeiro criar a tabela se não existir
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS articles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT,
          week INTEGER NOT NULL,
          video_url TEXT,
          image TEXT,
          type TEXT NOT NULL DEFAULT 'article',
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      const sampleArticle = {
        title: "Preparação para a Gravidez",
        content: "A primeira semana da gravidez marca o início de uma jornada única e emocionante. Neste período, é fundamental iniciar os cuidados pré-natais e adotar hábitos saudáveis que beneficiarão tanto a mãe quanto o bebê em desenvolvimento.",
        week: 1,
        video_url: null,
        image: "@assets/mulher-gravida-na-creche_1757181979218.jpg",
        type: "article",
        description: "Guia completo sobre os cuidados essenciais na primeira semana de gravidez"
      };

      const [newArticle] = await db.insert(articles)
        .values(sampleArticle)
        .returning();
      
      console.log("✅ Artigo de exemplo inserido para semana 1");
      res.json({ 
        success: true, 
        message: "Artigo de exemplo inserido com sucesso!",
        article: newArticle 
      });
    } catch (error: any) {
      console.error("❌ Erro ao inserir artigo de exemplo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint para inserir imagens da pasta comparacao
  app.post("/api/baby-development/insert-comparacao-images", async (req, res) => {
    try {
      console.log("🖼️ Iniciando inserção de imagens da pasta comparacao...");
      
      // Caminho da pasta de imagens
      const assetsPath = path.join(process.cwd(), 'client/src/assets/comparacao');
      
      // Verificar se a pasta existe
      if (!fs.existsSync(assetsPath)) {
        console.error('❌ Pasta comparacao não encontrada:', assetsPath);
        return res.status(404).json({ error: 'Pasta comparacao não encontrada' });
      }
      
      // Listar arquivos na pasta
      const files = fs.readdirSync(assetsPath);
      console.log('📁 Arquivos encontrados:', files);
      
      // Filtrar apenas arquivos de imagem
      const imageFiles = files.filter(file => 
        file.match(/\.(png|jpg|jpeg|gif|webp)$/i)
      );
      
      console.log('🖼️ Imagens encontradas:', imageFiles);
      
      const results = [];
      
      for (const file of imageFiles) {
        // Extrair número da semana do nome do arquivo
        const weekMatch = file.match(/^(\d+)\./);
        if (!weekMatch) {
          console.log(`⚠️ Arquivo ${file} não segue o padrão de nome (número.png)`);
          continue;
        }
        
        const week = parseInt(weekMatch[1]);
        const imageUrl = `@assets/comparacao/${file}`;
        
        console.log(`📝 Inserindo imagem para semana ${week}: ${imageUrl}`);
        
        try {
          // Verificar se a semana existe no banco
          const existingWeek = await db.select()
            .from(babyDevelopment)
            .where(sql`${babyDevelopment.week} = ${week}`)
            .limit(1);
          
          if (existingWeek.length === 0) {
            console.log(`⚠️ Semana ${week} não encontrada no banco de dados`);
            results.push({
              week,
              file,
              status: 'error',
              message: 'Semana não encontrada no banco'
            });
            continue;
          }
          
          // Atualizar a imagem
          await db.update(babyDevelopment)
            .set({ fruit_image_url: imageUrl })
            .where(sql`${babyDevelopment.week} = ${week}`);
          
          console.log(`✅ Semana ${week} atualizada com sucesso!`);
          results.push({
            week,
            file,
            imageUrl,
            status: 'success'
          });
          
        } catch (error) {
          console.error(`❌ Erro ao atualizar semana ${week}:`, error.message);
          results.push({
            week,
            file,
            status: 'error',
            message: error.message
          });
        }
      }
      
      // Mostrar resumo
      console.log('\n📊 Resumo da inserção:');
      results.forEach(result => {
        if (result.status === 'success') {
          console.log(`✅ Semana ${result.week}: ${result.file} → ${result.imageUrl}`);
        } else {
          console.log(`❌ Semana ${result.week}: ${result.file} - ${result.message}`);
        }
      });
      
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      console.log(`\n🎯 Total: ${successCount} sucessos, ${errorCount} erros`);
      
      // Verificar semanas que já têm imagens
      console.log('\n🔍 Verificando semanas com imagens no banco:');
      const weeksWithImages = await db.select({
        week: babyDevelopment.week,
        fruit_image_url: babyDevelopment.fruit_image_url
      })
      .from(babyDevelopment)
      .where(sql`${babyDevelopment.fruit_image_url} IS NOT NULL`)
      .orderBy(babyDevelopment.week);
      
      weeksWithImages.forEach(row => {
        console.log(`📸 Semana ${row.week}: ${row.fruit_image_url}`);
      });
      
      res.json({ 
        success: true, 
        message: "Processo de inserção de imagens concluído!",
        results,
        summary: {
          total: results.length,
          success: successCount,
          errors: errorCount
        },
        weeksWithImages: weeksWithImages
      });
      
    } catch (error: any) {
      console.error('❌ Erro geral:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
