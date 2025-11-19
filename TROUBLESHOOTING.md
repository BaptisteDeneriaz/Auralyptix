# 🔧 Dépannage - Erreur "Not Found"

## Problème : "Not Found" sur IONOS

### Vérifications à faire :

#### 1. Structure des fichiers sur IONOS
Dans FileZilla, vérifie que dans `/public` ou `/htdocs`, tu as :

```
/public (ou /htdocs)
  ├── .htaccess          ← DOIT être présent !
  ├── index.html
  └── assets/
      ├── index-XXXXX.css
      └── index-XXXXX.js
```

**Important** : 
- `index.html` doit être **directement** dans `/public`, pas dans un sous-dossier
- `.htaccess` doit être présent à la racine

#### 2. Si `.htaccess` manque sur IONOS

**Option A : Redéployer**
```bash
npm run build
npm run deploy:auto
```

**Option B : Upload manuel**
1. Ouvre FileZilla
2. Va dans `/public` ou `/htdocs`
3. Upload le fichier `dist/.htaccess` depuis ton PC

#### 3. Vérifier les permissions
Dans FileZilla, clic droit sur `.htaccess` → Propriétés
- Les permissions doivent être : `644` ou `rw-r--r--`

#### 4. Vider le cache
- Navigateur : `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- Ou ouvre en navigation privée

#### 5. Vérifier l'URL
- Essaie : `https://tondomaine.com/` (avec slash final)
- Essaie : `https://tondomaine.com/index.html`
- Les deux doivent fonctionner

#### 6. Vérifier le domaine
Dans IONOS → Domaines & SSL → Vérifie que ton domaine pointe bien vers le bon dossier web

### Si ça ne fonctionne toujours pas

1. **Vérifie les logs IONOS** (si disponible)
2. **Contacte le support IONOS** pour vérifier :
   - Si mod_rewrite est activé (pour .htaccess)
   - Si le serveur web est Apache ou Nginx
3. **Teste avec un fichier simple** :
   - Crée `test.html` dans `/public`
   - Accède à `https://tondomaine.com/test.html`
   - Si ça marche, le problème vient du routing React

### Solution alternative (si .htaccess ne fonctionne pas)

Si IONOS utilise Nginx ou si .htaccess ne fonctionne pas, il faut configurer le serveur différemment. Contacte le support IONOS pour activer le routing SPA.

