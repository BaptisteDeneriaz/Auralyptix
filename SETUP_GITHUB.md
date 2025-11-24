# 📦 Préparer le projet pour GitHub et Render

## Étape 1 : Installer Git (si pas déjà fait)

1. Télécharge Git : https://git-scm.com/download/win
2. Installe-le (garde les options par défaut)
3. Redémarre ton terminal

## Étape 2 : Créer un compte GitHub

1. Va sur https://github.com
2. Crée un compte (gratuit)
3. Note ton nom d'utilisateur

## Étape 3 : Créer un nouveau repository sur GitHub

1. Sur GitHub, clique sur **"New"** (ou le bouton **"+"** en haut à droite)
2. Nomme-le : `auto-edit-ai` (ou autre nom)
3. Laisse-le **Public** ou **Private** (comme tu veux)
4. **NE COCHE PAS** "Initialize with README"
5. Clique sur **"Create repository"**

## Étape 4 : Pousser ton code sur GitHub

Dans ton terminal, à la racine du projet :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/auto-edit-ai.git
git push -u origin main
```

⚠️ Remplace `TON_USERNAME` par ton vrai nom d'utilisateur GitHub et `auto-edit-ai` par le nom de ton repo.

## Étape 5 : Configurer GitHub Actions (optionnel)

Si tu veux que le frontend se déploie automatiquement à chaque push :

1. Va sur GitHub → Ton repo → **Settings** → **Secrets and variables** → **Actions**
2. Ajoute ces secrets :
   - `FTP_HOST` = `access-5019`
   - `FTP_USER` = `su331211`
   - `FTP_PASSWORD` = (ton mot de passe IONOS)
   - `FTP_REMOTE_PATH` = `/public`
   - `VITE_API_URL` = (l'URL de ton backend Render, après déploiement)

## ✅ C'est fait !

Une fois le code sur GitHub, tu peux déployer le backend sur Render (voir guide Render).


