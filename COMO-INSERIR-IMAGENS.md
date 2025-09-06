# 📸 Como Inserir Imagens do Bebê por Semana

Você pode inserir imagens do desenvolvimento do bebê para qualquer semana (1 a 40) de forma independente, sem precisar me enviar uma por uma.

## 🚀 Método 1: Script Automatizado (Mais Fácil)

### Passo 1: Coloque sua imagem
1. Salve sua imagem na pasta `attached_assets/`
2. Anote o nome do arquivo (ex: `semana5_bebe.png`)

### Passo 2: Execute o comando
```bash
node scripts/insert-week-image.js SEMANA NOME_DA_IMAGEM
```

**Exemplos:**
```bash
# Para inserir imagem da semana 5
node scripts/insert-week-image.js 5 semana5_bebe.png

# Para inserir imagem da semana 12
node scripts/insert-week-image.js 12 semana12_limao.png

# Para inserir imagem da semana 20
node scripts/insert-week-image.js 20 semana20_manga.png
```

## 🔧 Método 2: Requisição Direta (Para Desenvolvedores)

### Via cURL:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"week": 5, "imageUrl": "@assets/semana5_bebe.png"}' \
  http://localhost:5000/api/baby-development/insert-image
```

### Via navegador/Postman:
- **URL:** `POST http://localhost:5000/api/baby-development/insert-image`
- **Body (JSON):**
```json
{
  "week": 5,
  "imageUrl": "@assets/semana5_bebe.png"
}
```

## 📋 Instruções Detalhadas

### 1. Prepare suas imagens
- Formatos aceitos: PNG, JPG, JPEG
- Tamanho recomendado: até 500KB
- Coloque na pasta `attached_assets/`

### 2. Nomeação sugerida
- `semana1_graao_areia.png`
- `semana5_feijao.png` 
- `semana12_limao.png`
- `semana20_manga.png`
- etc...

### 3. Execute para cada semana
```bash
node scripts/insert-week-image.js 1 semana1_graao_areia.png
node scripts/insert-week-image.js 5 semana5_feijao.png
node scripts/insert-week-image.js 12 semana12_limao.png
node scripts/insert-week-image.js 20 semana20_manga.png
```

## ✅ Verificar se funcionou

Para ver todas as imagens inseridas:
```bash
curl http://localhost:5000/api/baby-development/all-comparisons
```

Ou acesse no navegador: `http://localhost:5000/api/baby-development/all-comparisons`

## 📊 Status Atual
- ✅ Semana 1: Grão de areia
- ✅ Semana 2: Ponta de alfinete  
- ✅ Semana 3: Seu bebê microscópico (inserido!)
- ⚪ Semanas 4-40: Aguardando suas imagens

## 🆘 Problemas Comuns

**Erro "Semana não encontrada":** 
- Verifique se o número da semana está entre 1 e 40

**Erro "arquivo não encontrado":**
- Confirme que a imagem está na pasta `attached_assets/`
- Verifique se o nome do arquivo está correto (com extensão)

**Servidor não responde:**
- Verifique se o servidor está rodando (`npm run dev`)
- Teste se `http://localhost:5000` está acessível

## 💡 Dica
Você pode inserir quantas imagens quiser, quando quiser! O sistema atualiza automaticamente e as imagens aparecerão no app imediatamente.