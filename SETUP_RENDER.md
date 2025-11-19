# 🚀 Déployer le backend sur Render

## Prérequis
- ✅ Code poussé sur GitHub (voir `SETUP_GITHUB.md`)
- ✅ Compte Render créé

## Étapes

### 1. Créer un compte Render
1. Va sur https://render.com
2. Clique sur **"Get Started for Free"**
3. Choisis **"Sign up with GitHub"**
4. Autorise Render à accéder à GitHub

### 2. Créer un nouveau Web Service
1. Dans Render Dashboard, clique sur **"New +"** → **"Web Service"**
2. Clique sur **"Connect a repository"**
3. Sélectionne ton repo GitHub (`auto-edit-ai`)
4. Clique sur **"Connect"**

### 3. Configurer le service
Remplis ces champs :

- **Name** : `auto-edit-api`
- **Region** : Choisis le plus proche (ex: Frankfurt)
- **Branch** : `main`
- **Root Directory** : (laisse vide)
- **Runtime** : `Node`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `node server/index.js`
- **Plan** : **Free** (gratuit)

### 4. Configurer les variables d'environnement
Dans la section **"Environment Variables"**, ajoute :

```
NODE_ENV = production
PORT = 10000
PUBLIC_BASE_URL = (sera rempli après, ex: https://auto-edit-api.onrender.com)
ASSEMBLYAI_API_KEY = (laisse vide si tu n'as pas)
PEXELS_API_KEY = (laisse vide si tu n'as pas)
CLOUDINARY_CLOUD_NAME = (ta valeur Cloudinary)
CLOUDINARY_API_KEY = (ta valeur Cloudinary)
CLOUDINARY_API_SECRET = (ta valeur Cloudinary)
```

### 5. Déployer
1. Clique sur **"Create Web Service"**
2. ⏳ Attends 2-5 minutes (premier déploiement)
3. Une fois terminé, note l'URL : `https://auto-edit-api.onrender.com`

### 6. Mettre à jour PUBLIC_BASE_URL
1. Va dans **Settings** → **Environment**
2. Modifie `PUBLIC_BASE_URL` avec l'URL que tu viens de noter
3. Clique sur **"Save Changes"**
4. Render va redéployer automatiquement

### 7. Mettre à jour le frontend (optionnel si tout est sur Render)
Si tu utilises la nouvelle architecture (tout sur Render), le frontend est déjà servi par le backend. Sinon :

1. Crée un fichier `.env.production` à la racine :
   ```
   VITE_API_URL=https://auto-edit-api.onrender.com
   ```
   (Remplace par ton URL Render)

2. Rebuild et déploie sur IONOS :
   ```bash
   npm run deploy:auto
   ```

## ✅ C'est fait !

Ton backend est maintenant actif 24/7 sur Render ! 🎉

**Note** : Le service gratuit Render "s'endort" après 15 min d'inactivité. Le premier appel peut prendre 30-60 secondes.

