import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vérification de la configuration...\n');

const checks = {
  envFile: false,
  envProduction: false,
  ftpConfig: false,
  cloudinaryConfig: false,
  renderConfig: false,
  githubWorkflow: false
};

// Vérifier .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  checks.envFile = true;
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Vérifier FTP
  const ftpPasswordLine = envContent.split('\n').find(l => l.startsWith('FTP_PASSWORD='));
  if (ftpPasswordLine && ftpPasswordLine.split('=')[1]?.trim() && ftpPasswordLine.split('=')[1].trim().length > 0) {
    checks.ftpConfig = true;
  }
  
  // Vérifier Cloudinary
  if (envContent.includes('CLOUDINARY_CLOUD_NAME=') && 
      envContent.includes('CLOUDINARY_API_KEY=') && 
      envContent.includes('CLOUDINARY_API_SECRET=')) {
    const lines = envContent.split('\n');
    const cloudName = lines.find(l => l.startsWith('CLOUDINARY_CLOUD_NAME='));
    const apiKey = lines.find(l => l.startsWith('CLOUDINARY_API_KEY='));
    const apiSecret = lines.find(l => l.startsWith('CLOUDINARY_API_SECRET='));
    
    if (cloudName && !cloudName.includes('CLOUDINARY_CLOUD_NAME=\n') && cloudName.split('=')[1]?.trim() &&
        apiKey && !apiKey.includes('CLOUDINARY_API_KEY=\n') && apiKey.split('=')[1]?.trim() &&
        apiSecret && !apiSecret.includes('CLOUDINARY_API_SECRET=\n') && apiSecret.split('=')[1]?.trim()) {
      checks.cloudinaryConfig = true;
    }
  }
} else {
  console.log('⚠️  Fichier .env manquant');
}

// Vérifier .env.production
const envProdPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envProdPath)) {
  checks.envProduction = true;
  const envProdContent = fs.readFileSync(envProdPath, 'utf-8');
  if (envProdContent.includes('VITE_API_URL=') && envProdContent.includes('onrender.com')) {
    checks.renderConfig = true;
  }
} else {
  console.log('⚠️  Fichier .env.production manquant (nécessaire pour build production)');
}

// Vérifier render.yaml
const renderPath = path.join(__dirname, '..', 'render.yaml');
if (fs.existsSync(renderPath)) {
  checks.renderConfig = true;
}

// Vérifier GitHub workflow
const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy-frontend.yml');
if (fs.existsSync(workflowPath)) {
  checks.githubWorkflow = true;
}

// Afficher les résultats
console.log('\n📋 État de la configuration :\n');

console.log(`${checks.envFile ? '✅' : '❌'} Fichier .env`);
console.log(`${checks.ftpConfig ? '✅' : '❌'} Configuration FTP (mot de passe)`);
console.log(`${checks.cloudinaryConfig ? '✅' : '❌'} Configuration Cloudinary`);
console.log(`${checks.envProduction ? '✅' : '❌'} Fichier .env.production`);
console.log(`${checks.renderConfig ? '✅' : '❌'} Configuration Render`);
console.log(`${checks.githubWorkflow ? '✅' : '❌'} Workflow GitHub Actions`);

// Checklist des actions restantes
console.log('\n📝 Actions à faire :\n');

if (!checks.envFile) {
  console.log('1. Créer le fichier .env depuis env.sample');
}

if (!checks.ftpConfig) {
  console.log('2. Ajouter FTP_PASSWORD dans .env');
}

if (!checks.cloudinaryConfig) {
  console.log('3. Configurer Cloudinary dans .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
}

if (!checks.envProduction) {
  console.log('4. Créer .env.production avec VITE_API_URL pointant vers ton backend Render');
}

if (!checks.renderConfig) {
  console.log('5. Déployer le backend sur Render et noter l\'URL');
}

console.log('\n💡 Pour tester le déploiement automatique :');
console.log('   npm run deploy:auto\n');

