# 🔧 Dépannage rapide - Site ne fonctionne plus

## ✅ Solution immédiate

Si le site ne fonctionne plus sans avoir rien touché, c'est probablement un problème côté IONOS.

### Étape 1 : Redéployer
```bash
npm run deploy:auto
```

### Étape 2 : Vider le cache
- Navigateur : `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Ou navigation privée

### Étape 3 : Attendre 1-2 minutes
La propagation peut prendre un peu de temps.

## 🔍 Vérifications

### Test rapide
1. Accède à : `https://tondomaine.com/index.html`
   - Si ça fonctionne → Le problème vient du routing (`.htaccess`)
   - Si ça ne fonctionne pas → Le problème vient de la configuration IONOS

2. Accède à : `https://tondomaine.com/`
   - Si ça fonctionne → Tout est OK
   - Si ça ne fonctionne pas → Vérifie que `index.html` est bien uploadé

### Vérifier les fichiers sur IONOS
Le script de déploiement devrait uploader :
- `index.html`
- `.htaccess` (fichier caché, important !)
- `assets/index-XXXXX.js`
- `assets/index-XXXXX.css`

## 🐛 Problèmes courants

### 1. .htaccess manquant
**Symptôme** : La page d'accueil fonctionne mais pas les routes (`/Generator`, `/Dashboard`)

**Solution** : Le fichier `.htaccess` doit être présent sur IONOS. Redéploie :
```bash
npm run deploy:auto
```

### 2. Cache navigateur
**Symptôme** : Ancienne version du site s'affiche

**Solution** : 
- `Ctrl + Shift + R` pour vider le cache
- Ou navigation privée

### 3. Fichiers supprimés sur IONOS
**Symptôme** : Erreur 404 ou page blanche

**Solution** : Redéploie tout :
```bash
npm run deploy:auto
```

### 4. Problème IONOS
**Symptôme** : Rien ne fonctionne même après redéploiement

**Solution** : 
- Contacte le support IONOS
- Vérifie que le domaine pointe bien vers `/public`
- Vérifie que mod_rewrite est activé (pour `.htaccess`)

## 📞 Commandes utiles

```bash
npm run diagnose    # Diagnostiquer les problèmes
npm run check       # Vérifier la configuration
npm run deploy:auto # Redéployer
```

## ⚡ Solution rapide (copier-coller)

Si rien ne fonctionne, exécute ces commandes dans l'ordre :

```bash
npm run build
npm run deploy:auto
```

Puis :
1. Attends 2 minutes
2. Vide le cache (`Ctrl + Shift + R`)
3. Teste ton site

