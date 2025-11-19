import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔧 Création des fichiers d\'environnement...\n');

// Créer .env
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `VITE_API_URL=http://localhost:4000

# Backend services
ASSEMBLYAI_API_KEY=
PEXELS_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional
PUBLIC_BASE_URL=
PORT=4000

# FTP/SFTP pour déploiement automatique IONOS
FTP_HOST=access-5019
FTP_USER=su331211
FTP_PASSWORD=
FTP_PORT=22
FTP_REMOTE_PATH=/public
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env créé');
} else {
  console.log('ℹ️  Fichier .env existe déjà');
}

// Créer .env.production
const envProdPath = path.join(rootDir, '.env.production');
if (!fs.existsSync(envProdPath)) {
  const envProdContent = `# Fichier .env.production - utilisé lors du build pour la production
# Remplace l'URL par celle de ton backend Render après déploiement
VITE_API_URL=https://ton-api-render.onrender.com
`;
  fs.writeFileSync(envProdPath, envProdContent);
  console.log('✅ Fichier .env.production créé');
} else {
  console.log('ℹ️  Fichier .env.production existe déjà');
}

console.log('\n📝 Prochaines étapes :');
console.log('1. Ouvre .env et remplis :');
console.log('   - FTP_PASSWORD (ton mot de passe IONOS)');
console.log('   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
console.log('2. Ouvre .env.production et remplace l\'URL par celle de ton backend Render\n');

