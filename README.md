# Video Montage Builder

Application React (Vite) accompagnée d’un backend Node/Express orchestrant la génération d’edits TikTok/Shorts : upload musique + intro parlée, analyse IA, pipeline asynchrone, export vertical 9:16 et stockage cloud.

## Fonctionnalités actuelles

- Upload musique + intros vidéo multiples (limite 3)
- Sélection de la durée (5 à 120 s) avec découpe du segment audio (start/end, alignement automatique sur les beats)
- Brief complet (thème, style, prompt, référence)
- Dashboard temps réel (suivi des jobs + liste des edits)

## Prérequis

- Node.js 18+ (inclut npm)

## Installation

```bash
npm install
```

## Lancement en local

```bash
# Terminal 1 – API locale
npm run dev:server

# Terminal 2 – Front
npm run dev
```

ou utilisez `npm run dev:full` pour lancer les deux en parallèle (via `concurrently`).

Par défaut :

- API exposée sur `http://localhost:4000`
- Front sur `http://127.0.0.1:4173`

Assurez-vous que la variable d’environnement `VITE_API_URL` (fichier `.env`) pointe vers l’URL publique de l’API. En local :

```
VITE_API_URL=http://localhost:4000
```

## Scripts utiles

- `npm run dev` : front uniquement
- `npm run dev:server` : backend uniquement
- `npm run dev:full` : front + backend
- `npm run build` : build de production du front
- `npm run preview` : prévisualiser le build
- `npm run config:render` : mettre à jour l'URL Render (`.env.production`)
- `npm run lint` : exécuter ESLint

## Déploiement sur un hébergeur

1. **Backend**  
   - Déployez `server/index.js` sur un service Node (Render, Railway, OVH, etc.).  
   - Définissez `PORT` (par défaut 4000) et, si besoin, `PUBLIC_BASE_URL` pour refléter l’URL publique (ex. `https://api.monsite.com`).  
   - Montez un volume ou un stockage persistant pour `server/data/edits.json` et `server/uploads/`.

2. **Frontend**  
   - Construisez avec `npm run build`.  
   - Déployez le dossier `dist` sur n’importe quel hébergeur static.  
   - Configurez `VITE_API_URL` (ou `VITE_API_URL` lors du build) pour cibler l’API déployée.

### Activer le rendu vidéo réel (FFmpeg)

Le backend peut maintenant générer un vrai montage MP4 (concat clips + musique) via FFmpeg :

1. **Installer FFmpeg sur l’hébergeur**  
   - Sur Render : ajoutez dans “Build Command”  
     `apt-get update && apt-get install -y ffmpeg && npm install`  
   - Ou fournissez vos propres binaires et indiquez-les avec `FFMPEG_PATH` / `FFPROBE_PATH`.

2. **Variables d’environnement obligatoires**  
   ```
   REAL_RENDER_ENABLED=true
   RENDER_MAX_CLIPS=6
   RENDER_CLIP_SEGMENT_MAX=6
   FFMPEG_PATH=/usr/bin/ffmpeg       # adapter si besoin
   FFPROBE_PATH=/usr/bin/ffprobe     # optionnel mais recommandé
   ```

3. **Stockage Cloud**  
   - Si Cloudinary est configuré, la vidéo finale est uploadée automatiquement (`auralyptix/generated`).  
   - Sinon, le fichier est copié dans `server/uploads/` et servi via l’API.

Si `REAL_RENDER_ENABLED` est `false` ou si FFmpeg échoue, le pipeline retombe automatiquement sur la génération simulée (placeholder).

## Fichier d’environnement

Copiez `env.sample` vers `.env` et remplissez les clés suivantes (non versionnées) :

```
VITE_API_URL=http://localhost:4000
ASSEMBLYAI_API_KEY=<clé AssemblyAI>
ASSEMBLYAI_POLL_INTERVAL_MS=2000
ASSEMBLYAI_MAX_POLLS=90
PEXELS_API_KEY=<clé Pexels>
CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>
```

## Endpoints de l’API

- `POST /api/upload` – upload de n’importe quel fichier (audio/vidéo) vers le serveur (et plus tard vers Cloudinary).  
- `POST /api/generate` – lance un job complet `{ music_url, intro_videos[], theme, style, reference_video_url }`.  
- `GET /api/status/:jobId` – statut détaillé du job (étapes, progression).  
- `GET /api/jobs` – liste des jobs (utile pour polling dashboard).  
- `GET /api/edits` / `GET /api/edits/:id` / `DELETE /api/edits/:id` – gestion des montages terminés.  
- `POST /api/transcribe` – proxy vers AssemblyAI (ou fallback local) pour la transcription.  
- `POST /api/contact` – stocke les messages du formulaire.

Le backend stocke les données persistantes dans `server/data/*.json` (edits, jobs, messages) et les fichiers uploadés dans `server/uploads/`. Montez un volume persistant en production.