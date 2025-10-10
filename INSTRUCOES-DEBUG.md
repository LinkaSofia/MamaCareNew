# 🔍 Instruções para Debug

## ✅ **O QUE FOI FEITO:**

1. **Adicionei logs detalhados** no backend para:
   - Plano de Parto (`POST /api/birth-plans`)
   - Consultas (`PUT /api/consultations/:id`)

2. **Corrigi** o envio de dados do plano de parto (de snake_case para camelCase)

3. **Corrigi** o envio de `pregnancyId` ao atualizar consultas

---

## 📋 **SIGA ESTES PASSOS:**

### **1️⃣ REINICIE O SERVIDOR BACKEND:**

No terminal do Windows PowerShell:

```powershell
# Se o servidor ainda estiver rodando, pare com Ctrl+C

# Depois reinicie:
npm run dev
```

### **2️⃣ NO NAVEGADOR:**

1. **Recarregue a página** (Ctrl+R)
2. Tente **salvar o plano de parto** novamente
3. Tente **editar uma consulta**

### **3️⃣ COPIE OS LOGS DO TERMINAL:**

No terminal do backend, você verá logs como:

```
📋 Creating birth plan with data: {...}
❌ Error creating birth plan: ...
❌ Zod validation errors: [...]
```

ou

```
📝 Updating consultation: ...
❌ Error updating consultation: ...
```

### **4️⃣ ME ENVIE:**

- ✅ **Os logs completos** do terminal backend
- ✅ **Se possível**, execute o SQL do arquivo `CHECK-BIRTH-PLANS-TABLE.md` no Supabase e me envie o resultado

---

## 🎯 **O QUE ESPERAMOS VER:**

Os logs vão mostrar **exatamente** qual campo está causando o erro, facilitando a correção!

---

**Aguardo seus retornos!** 🚀

