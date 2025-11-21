# 🚀 Commandes pour pousser vers GitHub

## Étapes à suivre dans ton terminal

Ouvre PowerShell ou Invite de commandes dans le dossier du projet, puis exécute ces commandes **une par une** :

### 1. Vérifier l'état
```bash
git status
```

### 2. Ajouter tous les fichiers modifiés
```bash
git add -A
```

### 3. Créer un commit avec un message
```bash
git commit -m "Implement real functionality: audio/video upload, beat detection, transcription, Pexels search"
```

### 4. Pousser vers GitHub
```bash
git push origin main
```

---

## Si tu rencontres des erreurs

### Erreur "git n'est pas reconnu"
→ Installe Git depuis https://git-scm.com/download/win
→ Redémarre ton terminal après installation

### Erreur "not a git repository"
→ Exécute d'abord : `git init`

### Erreur d'authentification
→ GitHub te demandera ton username et un **Personal Access Token** (pas ton mot de passe)
→ Crée un token ici : https://github.com/settings/tokens
→ Sélectionne le scope `repo`

### Erreur "origin does not exist"
→ Ajoute le remote : 
```bash
git remote add origin https://github.com/BaptisteDeneriaz/Auralyptix.git
```

---

## Après le push

Render détectera automatiquement les changements et redéploiera ton site en quelques minutes ! 🎉

