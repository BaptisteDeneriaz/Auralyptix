# 🚀 Guide de déploiement étape par étape

## 📋 Vue d'ensemble
- **Backend** (Express) → Render.com (gratuit)
- **Frontend** (React) → IONOS (via FileZilla)

---

## PARTIE 1 : Déployer le backend sur Render

### Étape 1.1 : Créer un compte Render
1. Va sur **https://render.com**
2. Clique sur **"Get Started for Free"** ou **"Sign Up"**
3. Choisis **"Sign up with GitHub"** (recommandé)
4. Autorise Render à accéder à ton compte GitHub
5. ✅ Tu es maintenant connecté à Render

### Étape 1.2 : Préparer ton code sur GitHub (si pas déjà fait)
1. Va sur **https://github.com**
2. Crée un nouveau repository (ou utilise un existant)
3. Dans ton terminal local, exécute :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
   git push -u origin main
   ```
   ⚠️ Remplace `TON_USERNAME` et `TON_REPO` par tes vraies valeurs

### Étape 1.3 : Créer un nouveau service Web sur Render
1. Dans le dashboard Render, clique sur **"New +"** (en haut à droite)
2. Clique sur **"Web Service"**
3. Si tu vois "Connect a repository", clique dessus
4. Sélectionne ton repository GitHub (celui que tu viens de pousser)
5. Clique sur **"Connect"**

### Étape 1.4 : Configurer le service
Remplis les champs suivants :

- **Name** : `auto-edit-api` (ou un nom de ton choix)
- **Region** : Choisis le plus proche de toi (ex: Frankfurt)
- **Branch** : `main` (ou `master` selon ton repo)
- **Root Directory** : Laisse vide (ou mets `.` si demandé)
- **Runtime** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `node server/index.js`
- **Plan** : Sélectionne **"Free"** (gratuit)

### Étape 1.5 : Configurer les variables d'environnement
1. Fais défiler jusqu'à la section **"Environment Variables"**
2. Clique sur **"Add Environment Variable"** pour chaque variable :

   ```
   NODE_ENV = production
   ```
   
   ```
   PORT = 10000
   ```
   
   ```
   PUBLIC_BASE_URL = https://auto-edit-api.onrender.com
   ```
   ⚠️ Remplace `auto-edit-api` par le nom que tu as choisi à l'étape 1.4
   
   ```
   ASSEMBLYAI_API_KEY = (laisse vide si tu n'as pas de clé)
   ```
   
   ```
   PEXELS_API_KEY = (laisse vide si tu n'as pas de clé)
   ```
   
   ```
   CLOUDINARY_CLOUD_NAME = (laisse vide si tu n'as pas de clé)
   ```
   
   ```
   CLOUDINARY_API_KEY = (laisse vide si tu n'as pas de clé)
   ```
   
   ```
   CLOUDINARY_API_SECRET = (laisse vide si tu n'as pas de clé)
   ```

3. Pour chaque variable :
   - Clique sur **"Add Environment Variable"**
   - Tape le nom (ex: `NODE_ENV`)
   - Tape la valeur (ex: `production`)
   - Clique ailleurs pour sauvegarder

### Étape 1.6 : Déployer
1. Fais défiler en bas de la page
2. Clique sur **"Create Web Service"**
3. Render va maintenant :
   - Cloner ton code
   - Installer les dépendances (`npm install`)
   - Démarrer le serveur
4. ⏳ Attends 2-5 minutes (premier déploiement est plus long)
5. Tu verras des logs en temps réel

### Étape 1.7 : Récupérer l'URL de ton API
1. Une fois le déploiement terminé, tu verras un message **"Your service is live"**
2. L'URL sera affichée en haut : `https://auto-edit-api.onrender.com`
3. **COPIE CETTE URL** (tu en auras besoin pour la partie 2)
4. Teste l'URL dans ton navigateur : tu devrais voir une erreur 404 (normal, il n'y a pas de route `/`)

✅ **Backend déployé !**

---

## PARTIE 2 : Mettre à jour le frontend

### Étape 2.1 : Créer le fichier .env.production
1. Ouvre ton projet dans l'éditeur (VS Code, etc.)
2. À la racine du projet (même niveau que `package.json`), crée un nouveau fichier
3. Nomme-le exactement : `.env.production`
4. Ouvre ce fichier et colle dedans :
   ```
   VITE_API_URL=https://auto-edit-api.onrender.com
   ```
   ⚠️ Remplace `auto-edit-api.onrender.com` par l'URL que tu as copiée à l'étape 1.7

### Étape 2.2 : Rebuild le frontend
1. Ouvre PowerShell ou Terminal dans le dossier du projet
2. Exécute :
   ```bash
   npm run build
   ```
3. ⏳ Attends la fin (30 secondes à 2 minutes)
4. Tu devrais voir : `dist/index.html` and `dist/assets/...` built successfully

✅ **Frontend prêt avec la bonne URL API !**

---

## PARTIE 3 : Uploader sur IONOS

### Étape 3.1 : Ouvrir FileZilla
1. Lance **FileZilla Client**
2. Connecte-toi à IONOS (tu sais déjà faire ça)

### Étape 3.2 : Naviguer vers le dossier public
1. Dans le panneau de droite (serveur IONOS), double-clique sur `/`
2. Cherche le dossier `public` ou `htdocs`
3. Double-clique dessus pour l'ouvrir
4. Si tu vois un fichier `index.html` ou `default.html`, **supprime-le** (clic droit → Supprimer)

### Étape 3.3 : Préparer les fichiers locaux
1. Dans le panneau de gauche (ton PC), navigue vers ton projet
2. Ouvre le dossier `dist` (celui qui vient d'être créé par `npm run build`)
3. Tu devrais voir :
   - `index.html`
   - Un dossier `assets/`

### Étape 3.4 : Uploader les fichiers
1. Dans le panneau de gauche, **sélectionne TOUT** dans le dossier `dist` :
   - Clique sur `index.html`
   - Maintiens `Ctrl` et clique sur le dossier `assets`
   - Ou utilise `Ctrl + A` pour tout sélectionner
2. **Glisse** ces fichiers vers le panneau de droite (dans `public` ou `htdocs`)
3. ⏳ Attends que tous les fichiers soient transférés
4. Vérifie qu'il n'y a pas d'erreurs dans la file de transfert

✅ **Fichiers uploadés !**

### Étape 3.5 : Vérifier la structure
Dans FileZilla, côté serveur (droite), tu devrais voir :
```
/public (ou /htdocs)
  ├── index.html
  └── assets/
      ├── index-XXXXX.css
      └── index-XXXXX.js
```

⚠️ **Important** : `index.html` doit être **directement** dans `public`, pas dans un sous-dossier !

---

## PARTIE 4 : Tester

### Étape 4.1 : Ouvrir ton site
1. Ouvre ton navigateur
2. Va sur ton domaine IONOS (ex: `https://tondomaine.com`)
3. Tu devrais voir ton site !

### Étape 4.2 : Vérifier que l'API fonctionne
1. Ouvre les **Outils de développement** (F12)
2. Va dans l'onglet **"Console"**
3. Essaie d'utiliser une fonctionnalité (upload, génération, etc.)
4. Va dans l'onglet **"Network"** (Réseau)
5. Tu devrais voir des requêtes vers `https://auto-edit-api.onrender.com`
6. Si elles sont en vert (200), tout fonctionne ! ✅

### Étape 4.3 : Tester avec le PC éteint
1. **Éteins ton PC** (ou arrête `npm run dev:server`)
2. Attends 1-2 minutes
3. Ouvre ton site depuis un autre appareil (téléphone, autre PC)
4. Le site doit toujours fonctionner ! 🎉

---

## ⚠️ Problèmes courants

### Le site affiche toujours la page par défaut IONOS
- Vérifie que `index.html` est bien dans `public` (pas dans un sous-dossier)
- Supprime l'ancien `index.html` ou `default.html` d'IONOS
- Vide le cache du navigateur (Ctrl + Shift + R)

### Les appels API échouent (erreur CORS ou 404)
- Vérifie que l'URL dans `.env.production` est correcte
- Vérifie que le backend Render est bien démarré (va sur l'URL Render dans le navigateur)
- Le premier appel peut prendre 30-60 secondes (service gratuit qui "s'endort")

### Le backend Render ne démarre pas
- Va dans Render Dashboard → Logs
- Vérifie les erreurs
- Vérifie que toutes les variables d'environnement sont définies
- Vérifie que `package.json` contient bien `"type": "module"`

### FileZilla ne peut pas uploader
- Vérifie les permissions du dossier `public`
- Vérifie que tu as assez d'espace disque
- Essaie de supprimer un fichier d'abord pour tester les permissions

---

## 🎯 Résumé rapide

1. **Render** : Crée un Web Service, connecte GitHub, configure, déploie
2. **Local** : Crée `.env.production` avec l'URL Render, fais `npm run build`
3. **IONOS** : Upload le contenu de `dist/` dans `public/`
4. **Test** : Ouvre ton domaine, vérifie que ça marche

---

## 📞 Besoin d'aide ?

Si tu bloques à une étape, dis-moi :
- À quelle étape tu es
- Quel message d'erreur tu vois (si erreur)
- Ce que tu vois à l'écran

Je t'aiderai à résoudre le problème ! 🚀

