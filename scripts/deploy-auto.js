import 'dotenv/config';
import { execSync } from 'child_process';
import FtpDeploy from 'ftp-deploy';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Déploiement automatique sur IONOS\n');

// Vérifier la configuration
if (!process.env.FTP_PASSWORD) {
  console.error('❌ Erreur : FTP_PASSWORD manquant dans .env');
  console.log('\n💡 Ajoute tes identifiants FTP dans .env:');
  console.log('   FTP_HOST=access-5019');
  console.log('   FTP_USER=su331211');
  console.log('   FTP_PASSWORD=ton_mot_de_passe');
  console.log('   FTP_REMOTE_PATH=/public\n');
  process.exit(1);
}

// Configuration FTP depuis .env
const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER || 'su331211',
  password: process.env.FTP_PASSWORD || '',
  host: process.env.FTP_HOST || 'access-5019',
  port: parseInt(process.env.FTP_PORT || '22'),
  localRoot: path.join(__dirname, '..', 'dist'),
  remoteRoot: process.env.FTP_REMOTE_PATH || '/public',
  include: ['*', '**/*', '.*'], // Inclure TOUS les fichiers, y compris .htaccess
  exclude: [],
  deleteRemote: true, // Supprimer les anciens fichiers
  forcePasv: true,
  sftp: true // Utilise SFTP
};

async function buildAndCopyHtaccess() {
  console.log('📦 Build du projet...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build terminé\n');
    
    // S'assurer que .htaccess est copié dans dist/
    const htaccessSrc = path.join(__dirname, '..', 'public', '.htaccess');
    const htaccessDest = path.join(__dirname, '..', 'dist', '.htaccess');
    
    try {
      await fs.copyFile(htaccessSrc, htaccessDest);
      console.log('✅ .htaccess copié dans dist/\n');
    } catch (err) {
      console.warn('⚠️  .htaccess non trouvé, création d\'un nouveau...\n');
      // Créer un .htaccess de base si absent
      const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
      await fs.writeFile(htaccessDest, htaccessContent);
      console.log('✅ .htaccess créé\n');
    }
  } catch (error) {
    console.error('❌ Erreur lors du build');
    process.exit(1);
  }
}

await buildAndCopyHtaccess();

console.log('📤 Upload sur IONOS...');
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   Remote: ${config.remoteRoot}\n`);

ftpDeploy
  .deploy(config)
  .then((res) => {
    console.log('\n✅ Déploiement terminé !');
    
    // Le résultat peut être un tableau ou un objet
    const files = Array.isArray(res) ? res : (res.files || []);
    console.log('📁 Fichiers uploadés:', files.length);
    
    if (files.length > 0) {
      console.log('\n📋 Détails des fichiers uploadés:');
      files.forEach((file, index) => {
        const fileName = typeof file === 'string' ? file : (file.name || file);
        console.log(`   ${index + 1}. ${fileName}`);
      });
    }
    
    console.log('\n💡 Si le bouton n\'apparaît pas:');
    console.log('   1. Vide le cache du navigateur (Ctrl + Shift + R)');
    console.log('   2. Attends 1-2 minutes pour la propagation');
    console.log('   3. Vérifie que les nouveaux fichiers JS/CSS sont bien chargés');
  })
  .catch((err) => {
    console.error('\n❌ Erreur lors de l\'upload:', err.message);
    console.log('\n💡 Vérifie tes identifiants FTP dans .env:');
    console.log('   FTP_HOST=access-5019');
    console.log('   FTP_USER=su331211');
    console.log('   FTP_PASSWORD=ton_mot_de_passe');
    console.log('   FTP_REMOTE_PATH=/public');
    process.exit(1);
  });

