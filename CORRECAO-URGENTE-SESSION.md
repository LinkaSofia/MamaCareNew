# 🚨 CORREÇÃO URGENTE - Session não funciona

## ❌ PROBLEMA:

Erro 401 em `/api/auth/me` significa:
- Login até funciona
- Mas **cookie NÃO está sendo salvo/enviado**
- Sessão não é mantida
- Usuário volta para login

## 🔍 CAUSA PROVÁVEL:

A configuração de session estava usando `isProduction` que depende de `NODE_ENV=production`.

**Se `NODE_ENV` não estiver configurado no Render:**
```typescript
const isProduction = process.env.NODE_ENV === 'production';  // false!
secure: isProduction,  // false! ❌
sameSite: isProduction ? 'none' : 'lax',  // 'lax'! ❌
```

Resultado: Cookie com configuração ERRADA para produção!

## ✅ CORREÇÃO:

**AGORA usa valores FIXOS para produção:**
```typescript
cookie: { 
  secure: true,        // ✅ SEMPRE true (Render usa HTTPS)
  sameSite: 'none',    // ✅ SEMPRE 'none' (cross-domain)
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
},
proxy: true  // ✅ SEMPRE true (Render usa proxy)
```

**Não depende mais de NODE_ENV!**

---

## 🚀 COMMIT E PUSH URGENTE:

```bash
git add server/routes.ts
git commit -m "Fix: force secure cookie settings for production HTTPS"
git push
```

---

## ⏱️ DEPOIS DO DEPLOY (2-3 MIN):

### No Render Dashboard:

1. Vá em **"Logs"**
2. Procure por: `🔧 Session Config:`
3. Deve mostrar:
```
🔧 Session Config: {
  NODE_ENV: 'production',
  isProduction: true,
  secure: true,
  sameSite: 'none',
  proxy: true
}
```

### Testar Login:

1. **Limpe cache** do navegador
2. Acesse: `https://friendly-alpaca-bf0d68.netlify.app`
3. Abra DevTools (F12) → Aba "Network"
4. Faça login
5. **Veja a requisição de login:**
   - Deve retornar **200 OK**
   - Deve ter header: `Set-Cookie: mama-care-session-v2=...`
6. **Veja a requisição /api/auth/me:**
   - Deve retornar **200 OK** (não mais 401!)
   - Cookie deve ser enviado automaticamente

---

## 🔍 COMO VERIFICAR SE O COOKIE FOI SALVO:

**Chrome DevTools:**
1. F12 → Aba "Application"
2. Cookies → `https://friendly-alpaca-bf0d68.netlify.app`
3. Deve aparecer: `mama-care-session-v2`
4. Verifique:
   - `Secure: ✅ true`
   - `SameSite: None`
   - `HttpOnly: ✅ true`

Se o cookie NÃO aparecer = problema não resolvido!

---

## 🆘 SE AINDA NÃO FUNCIONAR:

O problema pode ser que **Render não permite FileStore sessions** no plano free!

**Solução alternativa:** Usar MemoryStore (mas perde sessões ao reiniciar):

```typescript
// REMOVER:
store: new FileStoreSession({ ... }),

// Não usar store (usa memória por padrão)
```

Ou usar **PostgreSQL session store:**
```typescript
import connectPgSimple from 'connect-pg-simple';
const PgSession = connectPgSimple(session);

store: new PgSession({
  conString: process.env.DATABASE_URL,
  tableName: 'session'
})
```

---

**FAÇA O PUSH AGORA E TESTE!** 🚀

