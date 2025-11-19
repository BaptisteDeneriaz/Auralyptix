import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration FTP (à mettre dans .env)
const FTP_CONFIG = {
  host: process.env.FTP_HOST || 'access-5019',
  user: process.env.FTP_USER || 'su331211',
  password: process.env.FTP_PASSWORD || '',
  remotePath: process.env.FTP_REMOTE_PATH || '/public',
  port: process.env.FTP_PORT || 22
};

console.log('🚀 Déploiement automatique sur IONOS\n');

// Étape 1 : Build
console.log('📦 Build du projet...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build terminé\n');
} catch (error) {
  console.error('❌ Erreur lors du build');
  process.exit(1);
}

// Étape 2 : Vérifier que dist existe
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Le dossier dist/ n\'existe pas');
  process.exit(1);
}

console.log('📤 Upload via FileZilla...');
console.log('\n⚠️  Pour automatiser complètement, installe "ftp-deploy":');
console.log('   npm install --save-dev ftp-deploy\n');

console.log('📋 Instructions manuelles :');
console.log('1. Ouvre FileZilla');
console.log('2. Connecte-toi à IONOS');
console.log('3. Va dans:', FTP_CONFIG.remotePath);
console.log('4. Upload le contenu de:', distPath);
console.log('\n✅ Ou utilise: npm run deploy:auto (si ftp-deploy est installé)');

