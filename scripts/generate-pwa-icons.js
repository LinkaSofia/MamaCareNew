#!/usr/bin/env node

/**
 * Script para gerar ícones PWA em diferentes tamanhos
 * Usa a logo do app para criar os ícones necessários
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Gerando ícones PWA para MamaCare...');

// Caminho da logo source (você precisa ter uma imagem base)
const sourceLogoPath = path.join(__dirname, '../client/src/assets/logo-mamacare-final.png');
const iconsDir = path.join(__dirname, '../client/public/icons');

// Verificar se a pasta de ícones existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Pasta de ícones criada');
}

// Tamanhos necessários para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log(`
⚠️  IMPORTANTE:
Este script cria a estrutura de ícones, mas você precisa:

1. Ter a imagem base: ${sourceLogoPath}
2. Usar um serviço online para redimensionar:
   - https://www.iloveimg.com/resize-image
   - https://squoosh.app/
   - https://realfavicongenerator.net/

3. Ou instalar 'sharp' e usar o código abaixo:
   npm install sharp
   node scripts/generate-pwa-icons-with-sharp.js

Tamanhos necessários: ${sizes.join('x, ')}x

Por enquanto, vou criar ícones SVG como placeholder...
`);

// Criar SVG simples como placeholder
sizes.forEach(size => {
  const svgContent = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>
  <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial, sans-serif" font-size="${size/4}" font-weight="bold" fill="white" text-anchor="middle">MC</text>
</svg>
  `.trim();
  
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(iconPath, svgContent);
  console.log(`✅ Criado: icon-${size}x${size}.svg`);
});

console.log(`
✅ Ícones SVG temporários criados!

⚠️  Para PWA funcionar no Android, você PRECISA de PNG!

SOLUÇÃO RÁPIDA:
1. Acesse: https://realfavicongenerator.net/
2. Upload da logo: ${sourceLogoPath}
3. Baixe o pacote de ícones
4. Coloque os PNGs em: ${iconsDir}

Ou execute: npm install sharp && node scripts/generate-pwa-icons-with-sharp.js
`);

