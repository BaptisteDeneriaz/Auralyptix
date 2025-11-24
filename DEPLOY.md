# Guide de déploiement complet

## Architecture
- **Frontend** : IONOS (fichiers statiques dans `dist/`)
- **Backend** : Render.com (gratuit, Node.js/Express)

---

## Étape 1 : Déployer le backend sur Render

### 1.1 Créer un compte Render
1. Va sur https://render.com
2. Crée un compte (gratuit avec GitHub)
3. Connecte ton compte GitHub

### 1.2 Créer un nouveau service Web
1. Dans le dashboard Render, clique sur **"New +"** → **"Web Service"**
2. Connecte ton dépôt GitHub (ou pousse le code sur GitHub d'abord)
3. Configure le service :
   - **Name** : `auto-edit-api` (ou autre)
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server/index.js`
   - **Plan** : Free (gratuit)

### 1.3 Configurer les variables d'environnement
Dans Render, section **"Environment"**, ajoute :
```
NODE_ENV=production
PORT=10000
PUBLIC_BASE_URL=https://ton-api-render.onrender.com
ASSEMBLYAI_API_KEY=ta_clé
PEXELS_API_KEY=ta_clé
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ta_clé
CLOUDINARY_API_SECRET=ton_secret
```

### 1.4 Déployer
1. Clique sur **"Create Web Service"**
2. Render va builder et déployer automatiquement
3. Note l'URL générée : `https://ton-api-render.onrender.com`

⚠️ **Important** : Le service gratuit Render "s'endort" après 15 min d'inactivité. Le premier appel peut prendre 30-60 secondes.

---

## Étape 2 : Mettre à jour le frontend pour pointer vers Render

### 2.1 Créer un fichier .env pour le build
Crée un fichier `.env.production` à la racine du projet :

```env
VITE_API_URL=https://ton-api-render.onrender.com
```

### 2.2 Rebuild le frontend
```bash
npm run build
```

Le dossier `dist/` contient maintenant les fichiers avec la bonne URL API.

---

## Étape 3 : Uploader le frontend sur IONOS

### 3.1 Via FileZilla
1. Connecte-toi à IONOS (SFTP)
2. Navigue jusqu'au dossier `public` ou `htdocs`
3. Supprime l'ancien contenu
4. Upload **tout le contenu** du dossier `dist/` (pas le dossier `dist` lui-même)

### 3.2 Vérifier
- Ouvre ton domaine dans le navigateur
- Le site doit charger
- Les appels API doivent pointer vers Render (vérifie dans la console du navigateur, onglet Network)

---

## Étape 4 : Configurer le domaine (optionnel)

Si tu veux utiliser un sous-domaine pour l'API (ex. `api.tondomaine.com`) :

1. Dans Render → Settings → Custom Domain
2. Ajoute `api.tondomaine.com`
3. Configure les DNS chez IONOS :
   - Type : `CNAME`
   - Nom : `api`
   - Valeur : `ton-api-render.onrender.com`
4. Attends la propagation DNS (10-30 min)
5. Mets à jour `VITE_API_URL` dans `.env.production` et rebuild

---

## Scripts utiles

### Déploiement rapide (local)
```bash
# 1. Build avec la bonne URL API
npm run build

# 2. Upload via FileZilla manuellement
# (ou automatise avec un script FTP)
```

### Automatiser l'upload FTP (optionnel)
Installe `lftp` ou utilise un script Node.js avec `ftp-deploy`.

---

## Dépannage

### Le site ne charge pas
- Vérifie que `index.html` est bien dans le dossier racine web IONOS
- Vérifie les permissions des fichiers (755 pour dossiers, 644 pour fichiers)

### Les appels API échouent
- Vérifie que `VITE_API_URL` est correct dans `.env.production`
- Vérifie que le backend Render est bien démarré (premier appel peut être lent)
- Vérifie CORS dans `server/index.js` (doit autoriser ton domaine IONOS)

### Le backend Render ne démarre pas
- Vérifie les logs dans Render Dashboard → Logs
- Vérifie que toutes les variables d'environnement sont définies
- Vérifie que `package.json` a bien `"type": "module"`

---

## Alternative : VPS IONOS

Si tu préfères tout héberger chez IONOS :
1. Achète un **VPS IONOS** (Cloud Server)
2. Installe Node.js sur le VPS
3. Clone ton repo
4. Installe les dépendances : `npm install`
5. Configure PM2 pour faire tourner le backend : `pm2 start server/index.js`
6. Configure un reverse proxy (Nginx) pour servir le frontend et proxifier `/api/*` vers le backend

Mais Render est plus simple pour commencer !


