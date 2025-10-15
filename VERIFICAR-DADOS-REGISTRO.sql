-- Script para verificar se os dados de registro estão sendo salvos corretamente

-- 1. Verificar usuários recentes
SELECT 
    id, 
    email, 
    name, 
    profile_photo_url, 
    created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar dados de gravidez recentes
SELECT 
    p.id, 
    p.user_id, 
    u.email,
    p.last_menstruation_date, 
    p.due_date, 
    p.is_active, 
    p.created_at 
FROM pregnancies p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC 
LIMIT 5;

-- 3. Verificar se há usuários sem dados de gravidez
SELECT 
    u.id, 
    u.email, 
    u.name, 
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN 'SEM DADOS DE GRAVIDEZ'
        ELSE 'COM DADOS DE GRAVIDEZ'
    END as status
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id AND p.is_active = true
ORDER BY u.created_at DESC 
LIMIT 10;

-- 4. Verificar estrutura da tabela pregnancies
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pregnancies' 
ORDER BY ordinal_position;
