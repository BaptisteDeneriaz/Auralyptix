# 🚀 Déploiement automatique sans FileZilla

## ✅ Solution complète

Tout est automatisé ! Plus besoin de FileZilla.

## 📋 Commandes disponibles

### Déploiement automatique complet
```bash
npm run deploy:auto
```

**Ce que ça fait automatiquement :**
1. ✅ Build le projet (`npm run build`)
2. ✅ Copie `.htaccess` dans `dist/`
3. ✅ Upload tout sur IONOS via SFTP
4. ✅ Supprime les anciens fichiers
5. ✅ Affiche le résultat

**Temps total :** ~1-2 minutes

## 🔧 Configuration (une seule fois)

Tout est déjà configuré dans `.env` :
- `FTP_HOST` - Host IONOS
- `FTP_USER` - Utilisateur IONOS
- `FTP_PASSWORD` - Mot de passe IONOS
- `FTP_REMOTE_PATH` - Chemin distant (`/public`)

## 📝 Workflow quotidien

1. **Modifie ton code** (ex: `src/pages/Layout.jsx`)
2. **Lance le déploiement** :
   ```bash
   npm run deploy:auto
   ```
3. **Attends 1-2 minutes**
4. **Rafraîchis ton site** (Ctrl + Shift + R)

✅ **C'est tout ! Plus besoin de FileZilla.**

## 🎯 Avantages

- ✅ **100% automatisé** - Une seule commande
- ✅ **Rapide** - 1-2 minutes
- ✅ **Fiable** - Upload tous les fichiers nécessaires
- ✅ **Sécurisé** - Utilise SFTP
- ✅ **Inclut .htaccess** - Résout les erreurs 404

## 🔍 Vérification

Pour vérifier que tout est bien configuré :
```bash
npm run check
```

## ⚠️ En cas d'erreur

Si le déploiement échoue :
1. Vérifie que `FTP_PASSWORD` est bien rempli dans `.env`
2. Vérifie que le chemin `FTP_REMOTE_PATH` est correct (`/public` ou `/htdocs`)
3. Vérifie ta connexion internet

## 🎉 Résultat

Ton site est maintenant déployé automatiquement sans FileZilla !


