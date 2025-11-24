# 📝 Résumé rapide : Créer le service Render

## 🎯 En 5 minutes

### 1. GitHub (si pas fait)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
git push -u origin main
```

### 2. Render
1. Va sur https://render.com
2. "Get Started" → "Sign up with GitHub"
3. "New +" → "Web Service"
4. Connecte ton repo GitHub

### 3. Configuration
- **Name** : `auto-edit-api`
- **Build Command** : `npm install && npm run build`
- **Start Command** : `node server/index.js`
- **Plan** : Free

### 4. Variables d'environnement
Ajoute dans Render :
- `NODE_ENV=production`
- `PORT=10000`
- `PUBLIC_BASE_URL` (sera rempli après)
- `CLOUDINARY_*` (tes valeurs)

### 5. Créer et attendre
- Clique "Create Web Service"
- ⏳ Attends 3-5 minutes
- **COPIE l'URL** qui apparaît

### 6. Finaliser
- Dans Render → Settings → Environment
- Mets `PUBLIC_BASE_URL` = ton URL Render
- Localement : `npm run config:render` (colle l'URL)

✅ **C'est fait !** Ton site est sur Render !

---

**Guide détaillé** : Voir `CREER_SERVICE_RENDER.md`


