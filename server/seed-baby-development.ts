import { db } from "./storage";
import { babyDevelopment } from "../shared/schema";
import { babyDevelopmentSeedData } from "./baby-development-seed";

export async function seedBabyDevelopment() {
  try {
    console.log("🌱 Populando tabela baby_development com dados reais...");
    
    // Inserir todos os dados seed na tabela
    for (const data of babyDevelopmentSeedData) {
      try {
        await db.insert(babyDevelopment).values({
          week: data.week,
          size: data.size,
          weight: data.weight,
          fruit_comparison: data.fruit_comparison,
          development_milestones_baby: data.development_milestones_baby,
          development_milestones_mom: data.development_milestones_mom,
          baby_description: data.baby_description || "",
          mom_description: data.mom_description || ""
        }).onConflictDoUpdate({
          target: babyDevelopment.week,
          set: {
            size: data.size,
            weight: data.weight,
            fruit_comparison: data.fruit_comparison,
            development_milestones_baby: data.development_milestones_baby,
            development_milestones_mom: data.development_milestones_mom,
            baby_description: data.baby_description || "",
            mom_description: data.mom_description || ""
          }
        });
        console.log(`✓ Dados da semana ${data.week} inseridos/atualizados`);
      } catch (error: any) {
        console.log(`⚠️ Erro ao inserir dados da semana ${data.week}:`, error.message);
      }
    }
    
    console.log("✅ Tabela baby_development populada com sucesso!");
    return true;
  } catch (error: any) {
    console.error("❌ Erro ao popular tabela baby_development:", error.message);
    return false;
  }
}