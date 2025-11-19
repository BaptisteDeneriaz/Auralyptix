# Auralyptix - Générateur d'Edits TikTok/Shorts par IA

Application React (Vite) + Backend Express pour créer automatiquement des edits vidéo TikTok/Shorts avec IA.

## 🚀 Déploiement

### Frontend (IONOS)
- Déployé automatiquement via GitHub Actions à chaque push
- Ou manuellement avec `npm run deploy:auto`

### Backend (Render)
- Déployé automatiquement sur Render.com
- Configuration dans `render.yaml`

## 📦 Installation locale

```bash
npm install
```

## 🛠️ Scripts

- `npm run dev` - Frontend uniquement
- `npm run dev:server` - Backend uniquement  
- `npm run dev:full` - Frontend + Backend
- `npm run build` - Build production
- `npm run deploy:auto` - Build + Upload sur IONOS

## 🔧 Configuration

Copie `env.sample` vers `.env` et remplis les variables nécessaires.

