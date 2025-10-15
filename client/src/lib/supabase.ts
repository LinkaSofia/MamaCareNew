import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - URLs corretas do seu projeto
const supabaseUrl = 'https://yrpbjxhtsnaxlfsazall.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycGJqeGh0c25heGxmc2F6YWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDE0MDUsImV4cCI6MjA2ODk3NzQwNX0.YH2n5rOCPfFItwWrQF9inO0gUfKRsYhj5zhVhRV07EQ'; // ✅ CHAVE CORRETA!

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing:', { supabaseUrl, hasKey: !!supabaseAnonKey });
}

console.log('🔧 Supabase Storage Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  bucket: 'diary-attachments'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Não precisamos de sessão para uploads
  }
});

// Função inteligente: tenta Supabase Storage, se falhar usa base64 otimizado
export async function uploadFileToSupabase(
  file: File,
  bucket: string = 'diary-attachments',
  userId?: string
): Promise<{ url: string; path: string; size: number }> {
  try {
    // Tentar upload para Supabase Storage primeiro
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    
    const date = new Date().toISOString().split('T')[0];
    const filePath = `uploads/${date}/${fileName}`;

    console.log('📤 Tentando Supabase Storage:', {
      originalName: file.name,
      fileName,
      filePath,
      bucket,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.warn('⚠️ Supabase Storage falhou, usando base64 otimizado:', error.message);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('✅ Supabase Storage success:', {
      path: data.path,
      url: urlData.publicUrl,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.size
    };
  } catch (error) {
    console.log('🔄 Usando base64 otimizado como fallback para:', file.name);
    
    // FALLBACK: Base64 otimizado (muito menor que antes)
    const optimizedBase64 = await compressImageToBase64(file);
    
    return {
      url: optimizedBase64,
      path: `base64:${file.name}`,
      size: file.size
    };
  }
}

// Função para comprimir imagem antes de converter para base64
async function compressImageToBase64(file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // Se não for imagem, converter direto
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Desenhar imagem comprimida
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Converter para base64 com qualidade otimizada
      const base64 = canvas.toDataURL(file.type, quality);
      
      console.log('✅ Base64 otimizado gerado:', file.name, 
        `Original: ${(file.size / 1024).toFixed(2)}KB`, 
        `Comprimido: ${(base64.length / 1024).toFixed(2)}KB`);
      
      resolve(base64);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}



// Função para deletar arquivo do Supabase Storage
export async function deleteFileFromSupabase(
  path: string,
  bucket: string = 'diary-attachments'
): Promise<void> {
  try {
    console.log('🗑️ Deleting file from Supabase Storage:', { path, bucket });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('❌ Error deleting from Supabase Storage:', error);
      throw error;
    }

    console.log('✅ File deleted successfully:', path);
  } catch (error) {
    console.error('❌ Error in deleteFileFromSupabase:', error);
    throw error;
  }
}
