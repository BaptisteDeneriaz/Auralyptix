import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnostic de l\'erreur "Not Found"\n');

const distPath = path.join(__dirname, '..', 'dist');

// Vérifier que dist existe
if (!fs.existsSync(distPath)) {
  console.error('❌ Le dossier dist/ n\'existe pas');
  console.log('💡 Lance: npm run build\n');
  process.exit(1);
}

// Vérifier les fichiers essentiels
const requiredFiles = [
  'index.html',
  '.htaccess',
  'assets'
];

console.log('📋 Vérification des fichiers dans dist/:\n');

let allOk = true;
for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  const exists = fs.existsSync(filePath);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${file}`);
  if (!exists) {
    allOk = false;
  }
}

// Vérifier le contenu de index.html
console.log('\n📄 Contenu de index.html:');
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf-8');
  if (content.includes('root')) {
    console.log('✅ index.html semble correct');
  } else {
    console.log('⚠️  index.html semble incomplet');
  }
} else {
  console.log('❌ index.html manquant');
  allOk = false;
}

// Vérifier .htaccess
console.log('\n📄 Contenu de .htaccess:');
const htaccessPath = path.join(distPath, '.htaccess');
if (fs.existsSync(htaccessPath)) {
  const content = fs.readFileSync(htaccessPath, 'utf-8');
  if (content.includes('RewriteEngine')) {
    console.log('✅ .htaccess semble correct');
    console.log('   Contenu:', content.substring(0, 100) + '...');
  } else {
    console.log('⚠️  .htaccess semble incomplet');
  }
} else {
  console.log('❌ .htaccess manquant');
  console.log('💡 Le fichier sera copié lors du prochain build');
  allOk = false;
}

// Vérifier les assets
console.log('\n📦 Assets:');
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`✅ ${assets.length} fichier(s) dans assets/`);
  assets.forEach(asset => {
    console.log(`   - ${asset}`);
  });
} else {
  console.log('❌ Dossier assets/ manquant');
  allOk = false;
}

// Recommandations
console.log('\n💡 Recommandations:\n');

if (!allOk) {
  console.log('1. Rebuild le projet:');
  console.log('   npm run build\n');
  console.log('2. Redéploie sur IONOS:');
  console.log('   npm run deploy:auto\n');
} else {
  console.log('✅ Tous les fichiers sont présents localement\n');
  console.log('🔍 Vérifications à faire sur IONOS:\n');
  console.log('1. Vérifie que .htaccess est bien uploadé sur IONOS');
  console.log('   (fichier caché, commence par un point)\n');
  console.log('2. Vérifie que index.html est directement dans /public');
  console.log('   (pas dans un sous-dossier)\n');
  console.log('3. Vérifie les permissions:');
  console.log('   - .htaccess: 644 (rw-r--r--)');
  console.log('   - index.html: 644 (rw-r--r--)');
  console.log('   - assets/: 755 (rwxr-xr-x)\n');
  console.log('4. Teste l\'URL:');
  console.log('   - https://tondomaine.com/');
  console.log('   - https://tondomaine.com/index.html');
  console.log('   - https://tondomaine.com/Generator\n');
  console.log('5. Si ça ne fonctionne toujours pas:');
  console.log('   - Contacte le support IONOS pour vérifier si mod_rewrite est activé');
  console.log('   - Demande si le serveur utilise Apache ou Nginx\n');
}


