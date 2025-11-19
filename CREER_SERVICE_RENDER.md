# 🚀 Guide complet : Créer et configurer le service Render

## 📋 Prérequis

- ✅ Compte GitHub créé
- ✅ Code poussé sur GitHub (si pas fait, voir étape 1)
- ✅ Compte Render créé (si pas fait, voir étape 2)

---

## ÉTAPE 1 : Pousser le code sur GitHub (si pas déjà fait)

### 1.1 Créer un repository GitHub

1. Va sur **https://github.com**
2. Clique sur le bouton **"+"** en haut à droite
3. Clique sur **"New repository"**
4. Remplis :
   - **Repository name** : `auto-edit-ai` (ou autre nom)
   - **Description** : (optionnel)
   - **Visibility** : Public ou Private (comme tu veux)
   - **NE COCHE PAS** "Add a README file"
   - **NE COCHE PAS** "Add .gitignore"
   - **NE COCHE PAS** "Choose a license"
5. Clique sur **"Create repository"**

### 1.2 Pousser ton code

**Si Git n'est pas installé** :
1. Télécharge Git : https://git-scm.com/download/win
2. Installe-le (garde les options par défaut)
3. Redémarre ton terminal

**Dans ton terminal, à la racine du projet** :

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit"

# Créer la branche main
git branch -M main

# Ajouter le remote GitHub (remplace TON_USERNAME et TON_REPO)
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git

# Pousser le code
git push -u origin main
```

⚠️ **Remplace** :
- `TON_USERNAME` par ton nom d'utilisateur GitHub
- `TON_REPO` par le nom de ton repository

**Exemple** :
```bash
git remote add origin https://github.com/dener/auto-edit-ai.git
```

---

## ÉTAPE 2 : Créer un compte Render

1. Va sur **https://render.com**
2. Clique sur **"Get Started for Free"**
3. Choisis **"Sign up with GitHub"** (recommandé)
4. Autorise Render à accéder à GitHub
5. ✅ Tu es maintenant connecté

---

## ÉTAPE 3 : Créer le service Web

### 3.1 Accéder à la création

1. Dans le dashboard Render, clique sur **"New +"** (en haut à droite)
2. Clique sur **"Web Service"**

### 3.2 Connecter le repository

1. Si tu vois **"Connect a repository"**, clique dessus
2. Si tu vois **"Connect account"**, clique dessus et autorise Render
3. Sélectionne ton repository GitHub (`auto-edit-ai` ou le nom que tu as donné)
4. Clique sur **"Connect"**

### 3.3 Configurer le service

Remplis ces champs **exactement** :

- **Name** : `auto-edit-api` (ou un nom de ton choix)
- **Region** : Choisis le plus proche de toi (ex: `Frankfurt (EU Central)`)
- **Branch** : `main` (ou `master` si c'est ta branche principale)
- **Root Directory** : (laisse **vide**)
- **Runtime** : `Node`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `node server/index.js`
- **Instance Type** : `Free` (gratuit)

### 3.4 Configurer les variables d'environnement

Fais défiler jusqu'à **"Environment Variables"** et ajoute :

Clique sur **"Add Environment Variable"** pour chaque ligne :

```
NODE_ENV = production
```

```
PORT = 10000
```

```
PUBLIC_BASE_URL = (laisse vide pour l'instant, on le remplira après)
```

```
ASSEMBLYAI_API_KEY = (laisse vide si tu n'as pas)
```

```
PEXELS_API_KEY = (laisse vide si tu n'as pas)
```

```
CLOUDINARY_CLOUD_NAME = (ta valeur Cloudinary)
```

```
CLOUDINARY_API_KEY = (ta valeur Cloudinary)
```

```
CLOUDINARY_API_SECRET = (ta valeur Cloudinary)
```

**Comment ajouter une variable** :
1. Clique sur **"Add Environment Variable"**
2. Dans **"Key"**, tape le nom (ex: `NODE_ENV`)
3. Dans **"Value"**, tape la valeur (ex: `production`)
4. Clique ailleurs ou appuie sur Entrée
5. Répète pour chaque variable

### 3.5 Créer le service

1. Fais défiler en bas
2. Clique sur **"Create Web Service"**
3. ⏳ Render va maintenant :
   - Cloner ton code
   - Installer les dépendances (`npm install`)
   - Builder le frontend (`npm run build`)
   - Démarrer le serveur (`node server/index.js`)

### 3.6 Attendre le déploiement

- ⏳ **Premier déploiement** : 3-5 minutes
- Tu verras les logs en temps réel
- Une fois terminé, tu verras : **"Your service is live"**

---

## ÉTAPE 4 : Récupérer l'URL et finaliser

### 4.1 Récupérer l'URL

1. Une fois le déploiement terminé, l'URL apparaît en haut
2. Format : `https://auto-edit-api-XXXXX.onrender.com`
3. **COPIE cette URL complète**

### 4.2 Mettre à jour PUBLIC_BASE_URL

1. Dans Render, va dans **"Settings"** (onglet à gauche)
2. Fais défiler jusqu'à **"Environment"**
3. Trouve `PUBLIC_BASE_URL`
4. Clique dessus pour éditer
5. Colle l'URL que tu as copiée (ex: `https://auto-edit-api-XXXXX.onrender.com`)
6. Clique sur **"Save Changes"**
7. Render va redéployer automatiquement (2-3 minutes)

### 4.3 Configurer le frontend local

Maintenant que tu as l'URL Render, configure-la localement :

```bash
npm run config:render
```

Quand demandé, colle l'URL Render que tu as copiée.

Ou manuellement, ouvre `.env.production` et mets :

```
VITE_API_URL=https://ton-url-render.onrender.com
```

### 4.4 Rebuild et tester

```bash
npm run build
```

Puis teste ton site sur l'URL Render !

---

## ✅ Vérification

### Test rapide

1. Ouvre l'URL Render dans ton navigateur
2. Tu devrais voir ton site !
3. Teste les routes :
   - `https://ton-url.onrender.com/`
   - `https://ton-url.onrender.com/Generator`
   - `https://ton-url.onrender.com/Dashboard`

### Vérifier que l'API fonctionne

1. Ouvre : `https://ton-url.onrender.com/api/health`
2. Tu devrais voir : `{"status":"ok","services":{...}}`

---

## 🐛 Problèmes courants

### Le service ne démarre pas

**Vérifie les logs** :
1. Dans Render, clique sur **"Logs"** (onglet à gauche)
2. Regarde les erreurs
3. Vérifie que toutes les variables d'environnement sont définies

**Erreurs communes** :
- `PORT` manquant → Ajoute `PORT=10000`
- `NODE_ENV` manquant → Ajoute `NODE_ENV=production`
- Build échoue → Vérifie que `npm run build` fonctionne en local

### Le site ne charge pas

1. Vérifie que le build a réussi (onglet "Logs")
2. Vérifie que `dist/` existe après le build
3. Vérifie que `node server/index.js` démarre sans erreur

### Les appels API échouent

1. Vérifie que `VITE_API_URL` dans `.env.production` pointe vers Render
2. Rebuild : `npm run build`
3. Redéploie sur Render (ou pousse un nouveau commit)

---

## 📝 Résumé

1. ✅ Code sur GitHub
2. ✅ Compte Render créé
3. ✅ Service Web créé avec :
   - Build Command : `npm install && npm run build`
   - Start Command : `node server/index.js`
4. ✅ Variables d'environnement configurées
5. ✅ URL Render récupérée
6. ✅ `PUBLIC_BASE_URL` mis à jour dans Render
7. ✅ `VITE_API_URL` configuré localement
8. ✅ Site testé et fonctionnel

---

## 🎉 C'est fait !

Ton site est maintenant accessible sur Render ! 🚀

**URL** : `https://ton-service.onrender.com`

Plus besoin d'IONOS, tout est sur Render !

