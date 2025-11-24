# 🚀 Déploiement automatique sur IONOS

## Configuration (une seule fois)

### 1. Ajouter tes identifiants FTP dans `.env`

Ouvre ton fichier `.env` (crée-le depuis `env.sample` si besoin) et ajoute :

```env
# FTP/SFTP pour déploiement automatique IONOS
FTP_HOST=access-5019
FTP_USER=su331211
FTP_PASSWORD=ton_mot_de_passe_ionos
FTP_PORT=22
FTP_REMOTE_PATH=/public
```

⚠️ **Important** : Remplace `ton_mot_de_passe_ionos` par ton vrai mot de passe IONOS.

### 2. Vérifier le chemin distant

Le `FTP_REMOTE_PATH` doit pointer vers ton dossier web :
- `/public` (le plus courant)
- `/htdocs` (selon ton offre IONOS)

Si tu ne sais pas, regarde dans FileZilla où tu uploades normalement tes fichiers.

---

## Utilisation

### Déploiement automatique (build + upload)

```bash
npm run deploy:auto
```

**Ce que ça fait :**
1. ✅ Build automatique (`npm run build`)
2. ✅ Upload automatique sur IONOS via SFTP
3. ✅ Suppression des anciens fichiers
4. ✅ Affichage du résultat

**Temps total :** ~1-2 minutes

### Déploiement manuel (build seulement)

```bash
npm run deploy
```

**Ce que ça fait :**
1. ✅ Build automatique
2. ⚠️ Instructions pour uploader manuellement via FileZilla

---

## Workflow recommandé

### Pour voir tes modifications en temps réel sur IONOS :

1. **Modifie ton code** (ex: `src/pages/Layout.jsx`)
2. **Lance le déploiement** :
   ```bash
   npm run deploy:auto
   ```
3. **Attends 1-2 minutes**
4. **Rafraîchis ton site IONOS** (Ctrl + Shift + R pour vider le cache)

✅ **Tes modifications sont maintenant en ligne !**

---

## Dépannage

### Erreur "FTP authentication failed"
- Vérifie que `FTP_PASSWORD` est correct dans `.env`
- Vérifie que `FTP_USER` est correct
- Vérifie que `FTP_HOST` est correct

### Erreur "Cannot connect to host"
- Vérifie que `FTP_PORT` est `22` (SFTP) ou `21` (FTP)
- Vérifie que `FTP_HOST` est correct
- Vérifie ta connexion internet

### Erreur "Remote path not found"
- Vérifie que `FTP_REMOTE_PATH` est correct (`/public` ou `/htdocs`)
- Connecte-toi manuellement avec FileZilla pour voir le bon chemin

### Les fichiers ne s'affichent pas après upload
- Vérifie que `index.html` est bien dans le dossier racine (pas dans un sous-dossier)
- Vide le cache du navigateur (Ctrl + Shift + R)
- Attends 1-2 minutes (propagation)

---

## Alternative : GitHub Actions (déploiement automatique au push)

Si tu veux que le site se mette à jour automatiquement à chaque `git push`, je peux te créer un workflow GitHub Actions. Dis-moi si tu veux cette option !

---

## Résumé

**Commande magique :**
```bash
npm run deploy:auto
```

**Résultat :** Ton site est mis à jour sur IONOS en 1-2 minutes ! 🎉


