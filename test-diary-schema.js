// Teste do schema do diário
const { z } = require('zod');

// Simular o schema do diaryEntries
const diaryEntriesSchema = z.object({
  pregnancyId: z.string().min(1),
  title: z.string().nullable().optional(),
  content: z.string().min(1),
  week: z.number().int().min(1).max(42).nullable().optional(),
  mood: z.string().nullable().optional(),
  emotions: z.string().nullable().optional(), // JSON string
  milestone: z.string().nullable().optional(),
  prompts: z.string().nullable().optional(), // JSON string
  date: z.date()
});

// Dados de teste
const testData = {
  pregnancyId: "123e4567-e89b-12d3-a456-426614174000",
  title: "Teste",
  content: "Conteúdo de teste",
  mood: "5",
  emotions: JSON.stringify(["feliz", "ansiosa"]),
  milestone: null,
  week: 20,
  date: new Date(),
  prompts: JSON.stringify(["Como você se sente hoje?"])
};

console.log("Testando schema...");
console.log("Dados de teste:", testData);

try {
  const result = diaryEntriesSchema.parse(testData);
  console.log("✅ Schema válido:", result);
} catch (error) {
  console.error("❌ Erro de validação:", error.issues);
}


