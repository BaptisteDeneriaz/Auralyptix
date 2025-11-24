import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

console.log('🔧 Configuration de l\'URL Render\n');

async function main() {
  // Demander l'URL Render
  const renderUrl = await question('Entre l\'URL de ton backend Render (ex: https://auto-edit-api.onrender.com): ');
  
  if (!renderUrl || !renderUrl.includes('onrender.com')) {
    console.error('❌ URL invalide. Format attendu: https://ton-service.onrender.com');
    rl.close();
    process.exit(1);
  }

  // Nettoyer l'URL (enlever le slash final)
  const cleanUrl = renderUrl.trim().replace(/\/$/, '');

  // Mettre à jour .env.production
  const envProdPath = path.join(__dirname, '..', '.env.production');
  let envProdContent = '';
  
  if (fs.existsSync(envProdPath)) {
    envProdContent = fs.readFileSync(envProdPath, 'utf-8');
  }

  // Remplacer ou ajouter VITE_API_URL
  if (envProdContent.includes('VITE_API_URL=')) {
    envProdContent = envProdContent.replace(
      /VITE_API_URL=.*/,
      `VITE_API_URL=${cleanUrl}`
    );
  } else {
    envProdContent += `\nVITE_API_URL=${cleanUrl}\n`;
  }

  fs.writeFileSync(envProdPath, envProdContent);
  console.log(`\n✅ .env.production mis à jour avec: ${cleanUrl}\n`);

  // Mettre à jour .env aussi (pour le dev local si besoin)
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('VITE_API_URL=')) {
      // Garder localhost pour le dev local
      console.log('ℹ️  .env garde localhost pour le développement local\n');
    }
  }

  console.log('📝 Prochaines étapes:');
  console.log('1. Rebuild le frontend: npm run build');
  console.log('2. Redéploie sur Render (si pas déjà fait)');
  console.log('3. Teste ton site !\n');

  rl.close();
}

main().catch(console.error);


