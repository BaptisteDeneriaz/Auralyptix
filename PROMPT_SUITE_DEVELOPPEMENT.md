# 🚀 Prompt détaillé pour la suite du développement

## 📋 État actuel du projet (17/11/2025)

### ✅ Ce qui est fait et fonctionnel

#### Architecture
- **Frontend** : React + Vite + Tailwind CSS
- **Backend** : Express.js (Node.js)
- **Déploiement** :
  - Frontend : IONOS (hébergement web statique)
  - Backend : Render.com (à déployer, configuré mais pas encore déployé)
- **Déploiement automatique** : Script `npm run deploy:auto` fonctionnel

#### Fonctionnalités implémentées

1. **Générateur d'edits en 3 étapes** :
   - Étape 1 : Upload musique + intros vidéo multiples (limite 3)
   - Étape 2 : Brief (thème/style/titre + URL de référence + instructions)
   - Étape 3 : Progression "live" avec suivi des étapes

2. **Dashboard** :
   - Liste des éditions créées
   - Jobs en cours avec statut en temps réel
   - Rafraîchissement automatique toutes les 4 secondes
   - Téléchargement des vidéos (bloqué tant que statut != "ready")

3. **Page d'accueil** :
   - Hero section
   - Features section
   - Demo section
   - How it works
   - Pricing
   - FAQ
   - Contact form
   - Footer

4. **Backend API** :
   - `POST /api/upload` : Upload fichiers (musique/vidéo) → Cloudinary si configuré
   - `POST /api/generate` : Lance un job de génération
   - `GET /api/status/:jobId` : Statut détaillé d'un job
   - `GET /api/jobs` : Liste des jobs
   - `GET /api/edits` : Liste des edits
   - `GET /api/edits/:id` : Détails d'un edit
   - `DELETE /api/edits/:id` : Supprimer un edit
   - `POST /api/transcribe` : Transcription AssemblyAI
   - `POST /api/contact` : Messages de contact

5. **Intégrations** :
   - ✅ Cloudinary : Upload direct des fichiers (URLs publiques)
   - ⚠️ AssemblyAI : Configuré mais nécessite clé API
   - ⚠️ Pexels : Placeholder si clé absente
   - ✅ Stockage local : JSON files (edits.json, jobs.json, messages.json)

#### Configuration
- ✅ Variables d'environnement configurées (.env, .env.production)
- ✅ Scripts npm : dev, build, deploy:auto, check, diagnose
- ✅ Routing React avec BrowserRouter
- ✅ .htaccess pour le routing SPA sur IONOS
- ✅ Logo "Auralyptix" dans la navigation

---

## 🎯 Prochaines étapes à implémenter

### Priorité 1 : Intégrations réelles

#### 1.1 Pexels API (clips vidéo)
**Objectif** : Remplacer les placeholders par de vrais clips Pexels

**Fichier à modifier** : `server/index.js` (fonction `fetchClips`)

**Code actuel** (ligne ~249) :
```javascript
async function fetchClips(theme) {
  if (!pexelsEnabled) {
    return Array.from({ length: 6 }).map((_, idx) => ({
      id: `placeholder-${idx}`,
      url: `https://videos.pexels.com/video-${1000 + idx}`,
      // ...
    }));
  }
  // Code réel existe mais à vérifier/améliorer
}
```

**À faire** :
1. Vérifier que la clé Pexels est dans `.env` et Render
2. Tester l'API Pexels avec différents thèmes
3. Gérer les erreurs (rate limits, pas de résultats)
4. Filtrer pour ne garder que les vidéos portrait (9:16)
5. Optimiser la sélection (qualité, durée, pertinence)

**Endpoints Pexels à utiliser** :
- `GET https://api.pexels.com/videos/search?query={theme}&orientation=portrait&size=large&per_page=10`
- Headers : `Authorization: {PEXELS_API_KEY}`

#### 1.2 AssemblyAI (transcription réelle)
**Objectif** : Transcrire réellement les intros parlées

**Fichier à modifier** : `server/index.js` (fonction `transcribeAudio`)

**Code actuel** (ligne ~163) :
```javascript
async function transcribeAudio(audioUrl) {
  if (!assemblyEnabled || isLocalUrl(audioUrl)) {
    return { text: '', words: [], note: 'Transcription simulée...' };
  }
  // Code réel existe mais à tester
}
```

**À faire** :
1. Vérifier que la clé AssemblyAI est dans `.env` et Render
2. S'assurer que les URLs audio sont publiques (Cloudinary)
3. Tester avec différents formats audio
4. Gérer les erreurs (timeout, format non supporté)
5. Extraire les timestamps des mots pour le montage

**Workflow AssemblyAI** :
1. `POST /v2/transcript` avec `audio_url`
2. Polling `GET /v2/transcript/{id}` jusqu'à `status === 'completed'`
3. Extraire `text`, `words[]`, `utterances[]`

---

### Priorité 2 : Scripts Python (traitement vidéo)

#### 2.1 Beat Detection avec Librosa
**Objectif** : Détecter les beats de la musique pour synchroniser les clips

**Fichier à créer** : `server/scripts/beat_detection.py`

**Fonctionnalités** :
- Analyser le fichier audio (MP3, WAV)
- Détecter le BPM
- Extraire les positions des beats
- Retourner JSON : `{ bpm: 120, beats: [0.0, 0.5, 1.0, ...], sections: [...] }`

**Dépendances Python** :
```bash
pip install librosa numpy
```

**Interface** :
- Input : URL du fichier audio (Cloudinary)
- Output : JSON avec beats et sections
- Appel depuis Node.js : `child_process.exec('python server/scripts/beat_detection.py {audio_url}')`

**Code de base** :
```python
import librosa
import json
import sys

audio_url = sys.argv[1]
# Télécharger l'audio depuis Cloudinary
# Analyser avec librosa
# Retourner JSON
```

#### 2.2 Whisper (fallback transcription)
**Objectif** : Transcription locale si AssemblyAI échoue

**Fichier à créer** : `server/scripts/whisper_transcribe.py`

**À faire** :
- Installer Whisper (OpenAI)
- Transcrire l'audio localement
- Retourner le même format que AssemblyAI

**Dépendances** :
```bash
pip install openai-whisper
```

---

### Priorité 3 : Montage vidéo avec FFmpeg

#### 3.1 Script de montage principal
**Objectif** : Créer la vidéo finale avec tous les éléments

**Fichier à créer** : `server/scripts/video_edit.py`

**Inputs** :
- Musique : URL Cloudinary
- Intro parlée : URL Cloudinary (avec transcription)
- Clips Pexels : Array d'URLs
- Beats : Positions des beats (JSON)
- Style : 'dynamic', 'smooth', 'aggressive', etc.
- Référence : URL vidéo TikTok/YouTube (optionnel)

**Processus** :
1. Télécharger tous les assets
2. Découper l'intro selon les mots de la transcription
3. Sélectionner les clips Pexels selon le thème
4. Synchroniser les clips sur les beats
5. Appliquer les transitions selon le style
6. Ajouter les effets (zoom, transitions, etc.)
7. Burner les sous-titres (si transcription disponible)
8. Mixer l'audio (musique + intro)
9. Exporter en 9:16 (1080x1920)
10. Uploader sur Cloudinary
11. Retourner l'URL finale

**Dépendances** :
```bash
pip install ffmpeg-python pillow
```

**Commandes FFmpeg principales** :
- Découper : `ffmpeg -i input.mp4 -ss 00:00:10 -t 00:00:05 output.mp4`
- Concaténer : `ffmpeg -f concat -safe 0 -i filelist.txt -c copy output.mp4`
- Redimensionner : `ffmpeg -i input.mp4 -vf scale=1080:1920 output.mp4`
- Ajouter audio : `ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac output.mp4`
- Sous-titres : `ffmpeg -i video.mp4 -vf subtitles=subs.srt output.mp4`

**Intégration dans le backend** :
- Modifier `server/index.js` → étape `editing`
- Appeler le script Python avec tous les paramètres
- Attendre la fin du traitement
- Récupérer l'URL Cloudinary

---

### Priorité 4 : Améliorations UX/UI

#### 4.1 Téléchargement mobile
**Objectif** : Optimiser le téléchargement sur mobile

**Fichier à modifier** : `src/components/dashboard/VideoModal.jsx`

**À faire** :
- Vérifier que le bouton de téléchargement pointe vers l'URL Cloudinary
- Ajouter un indicateur de progression
- Gérer les erreurs de téléchargement
- Tester sur différents appareils

#### 4.2 Améliorer le suivi de génération
**Fichier à modifier** : `src/components/generator/GeneratingStep.jsx`

**À faire** :
- Afficher un pourcentage de progression réel
- Afficher des messages plus détaillés par étape
- Ajouter des animations/effets visuels
- Gérer les erreurs avec messages clairs

#### 4.3 Optimiser les performances
**À faire** :
- Code splitting pour réduire la taille du bundle
- Lazy loading des composants
- Optimiser les images
- Compresser les assets

---

### Priorité 5 : Queue système (scalabilité)

#### 5.1 BullMQ + Redis
**Objectif** : Gérer les jobs de manière scalable

**Fichier à créer** : `server/queue.js`

**À faire** :
- Installer BullMQ et Redis
- Créer des queues pour chaque type de job
- Gérer les priorités
- Retry automatique en cas d'erreur
- Monitoring des jobs

**Dépendances** :
```bash
npm install bullmq ioredis
```

**Configuration** :
- Redis sur Render (ou service externe)
- Queues : `video-generation`, `transcription`, `beat-detection`

---

## 🔧 Configuration technique détaillée

### Variables d'environnement nécessaires

**Backend (.env et Render)** :
```
NODE_ENV=production
PORT=10000
PUBLIC_BASE_URL=https://ton-api-render.onrender.com

# APIs
ASSEMBLYAI_API_KEY=ta_clé
PEXELS_API_KEY=ta_clé

# Cloudinary
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ta_clé
CLOUDINARY_API_SECRET=ton_secret

# Redis (pour BullMQ, optionnel)
REDIS_URL=redis://...
```

**Frontend (.env.production)** :
```
VITE_API_URL=https://ton-api-render.onrender.com
```

### Structure des fichiers

```
auto-edit-ai-39282629/
├── server/
│   ├── index.js              # Backend Express principal
│   ├── data/                  # JSON files (edits, jobs, messages)
│   ├── uploads/               # Fichiers temporaires (supprimés après Cloudinary)
│   └── scripts/               # Scripts Python
│       ├── beat_detection.py
│       ├── whisper_transcribe.py
│       └── video_edit.py
├── src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Generator.jsx
│   │   ├── Dashboard.jsx
│   │   └── Layout.jsx
│   ├── components/
│   │   ├── generator/
│   │   │   ├── UploadStep.jsx
│   │   │   ├── ThemeStep.jsx
│   │   │   └── GeneratingStep.jsx
│   │   └── dashboard/
│   │       └── VideoModal.jsx
│   └── api/
│       └── client.js          # Client API unique
├── public/
│   └── .htaccess              # Routing SPA
└── dist/                       # Build de production
```

### Scripts npm disponibles

```bash
npm run dev              # Frontend uniquement
npm run dev:server       # Backend uniquement
npm run dev:full         # Frontend + Backend
npm run build            # Build production
npm run deploy:auto      # Build + Upload IONOS
npm run check            # Vérifier la configuration
npm run diagnose         # Diagnostiquer les problèmes
```

---

## 📝 Détails d'implémentation par fonctionnalité

### 1. Intégration Pexels complète

**Fichier** : `server/index.js` → fonction `fetchClips`

**Code à améliorer** :
```javascript
async function fetchClips(theme) {
  if (!pexelsEnabled) {
    // Fallback placeholder
    return Array.from({ length: 6 }).map((_, idx) => ({
      id: `placeholder-${idx}`,
      url: `https://videos.pexels.com/video-${1000 + idx}`,
      thumbnail: `https://images.pexels.com/photos/${1000 + idx}/pexels-photo.jpeg`,
      duration: 6 + (idx % 4),
      description: `${theme} clip ${idx + 1}`
    }));
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(
        theme || 'cinematic'
      )}&orientation=portrait&size=large&per_page=10`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      console.warn('Pexels API error, using fallback');
      return fetchClips(null); // Retry sans clé
    }

    const data = await response.json();
    
    // Filtrer et formater les résultats
    return (data.videos || []).slice(0, 8).map((video) => {
      // Trouver le fichier vidéo portrait de meilleure qualité
      const portraitFile = video.video_files?.find(
        file => file.quality === 'hd' && file.width < file.height
      ) || video.video_files?.[0];
      
      return {
        id: `pexels-${video.id}`,
        url: portraitFile?.link,
        duration: video.duration,
        thumbnail: video.image,
        description: video.user?.name || 'Pexels',
        width: portraitFile?.width,
        height: portraitFile?.height
      };
    });
  } catch (error) {
    console.error('Error fetching Pexels clips:', error);
    return fetchClips(null); // Fallback
  }
}
```

**Améliorations à apporter** :
- Gérer les rate limits (429)
- Cache des résultats par thème
- Fallback intelligent si pas de résultats
- Validation des URLs retournées

---

### 2. Transcription AssemblyAI robuste

**Fichier** : `server/index.js` → fonction `transcribeAudio`

**Code actuel à améliorer** :
```javascript
async function transcribeAudio(audioUrl) {
  if (!audioUrl) {
    return { text: '', words: [], note: 'Aucune piste audio fournie' };
  }
  
  if (!assemblyEnabled || isLocalUrl(audioUrl)) {
    return {
      text: '',
      words: [],
      note: 'Transcription simulée (clé AssemblyAI absente ou URL locale)'
    };
  }

  const payload = {
    audio_url: audioUrl,
    speaker_labels: false,
    language_code: 'fr',
    punctuate: true,
    format_text: true,
    word_boost: [],
    disfluencies: true
  };

  const headers = {
    authorization: process.env.ASSEMBLYAI_API_KEY,
    'content-type': 'application/json'
  };

  // Créer la transcription
  const creation = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  }).then((res) => res.json());

  if (creation.error) {
    throw new Error(creation.error || 'Impossible de créer une transcription AssemblyAI');
  }

  // Polling jusqu'à completion
  let attempt = 0;
  while (attempt < 60) {
    await sleep(2000);
    attempt += 1;
    const result = await fetch(
      `https://api.assemblyai.com/v2/transcript/${creation.id}`,
      { headers }
    ).then((res) => res.json());

    if (result.status === 'completed') {
      return {
        text: result.text,
        words: result.words ?? [],
        utterances: result.utterances ?? []
      };
    }

    if (result.status === 'error') {
      throw new Error(result.error || 'Transcription échouée');
    }
  }

  throw new Error('Transcription AssemblyAI trop longue (>2min)');
}
```

**Améliorations** :
- Gérer les timeouts plus intelligemment
- Retry automatique en cas d'erreur temporaire
- Fallback vers Whisper si AssemblyAI échoue
- Extraire les timestamps précis pour chaque mot

---

### 3. Script Python Beat Detection

**Fichier à créer** : `server/scripts/beat_detection.py`

**Code complet** :
```python
#!/usr/bin/env python3
import librosa
import numpy as np
import json
import sys
import requests
import tempfile
import os

def download_audio(url, temp_dir):
    """Télécharge l'audio depuis Cloudinary"""
    response = requests.get(url, stream=True)
    if response.status_code != 200:
        raise Exception(f"Erreur téléchargement: {response.status_code}")
    
    ext = url.split('.')[-1].split('?')[0]
    filepath = os.path.join(temp_dir, f"audio.{ext}")
    
    with open(filepath, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return filepath

def detect_beats(audio_path):
    """Détecte les beats avec librosa"""
    # Charger l'audio
    y, sr = librosa.load(audio_path, sr=22050)
    
    # Détecter le tempo et les beats
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beats, sr=sr)
    
    # Calculer la durée
    duration = librosa.get_duration(y=y, sr=sr)
    
    # Détecter les sections (intro, build, drop, outro)
    sections = detect_sections(y, sr, duration)
    
    return {
        'bpm': round(float(tempo)),
        'duration': round(duration, 2),
        'beats': [round(float(t), 2) for t in beat_times],
        'sections': sections
    }

def detect_sections(y, sr, duration):
    """Détecte les sections de la musique"""
    # Analyse simple basée sur l'énergie
    frame_length = 2048
    hop_length = 512
    energy = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    
    # Découper en 4 sections
    section_length = duration / 4
    sections = [
        {'label': 'intro', 'start': 0, 'end': section_length},
        {'label': 'build', 'start': section_length, 'end': section_length * 2},
        {'label': 'drop', 'start': section_length * 2, 'end': section_length * 3},
        {'label': 'outro', 'start': section_length * 3, 'end': duration}
    ]
    
    return sections

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'URL audio requise'}), file=sys.stderr)
        sys.exit(1)
    
    audio_url = sys.argv[1]
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Télécharger l'audio
            audio_path = download_audio(audio_url, temp_dir)
            
            # Détecter les beats
            result = detect_beats(audio_path)
            
            # Retourner en JSON
            print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Intégration dans Node.js** :
```javascript
async function detectBeats(audioUrl) {
  // Si pas d'URL, simulation
  if (!audioUrl) {
    return simulateBeats();
  }

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync(
      `python server/scripts/beat_detection.py "${audioUrl}"`
    );
    
    if (stderr) {
      console.warn('Beat detection warning:', stderr);
    }
    
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Beat detection failed, using simulation:', error);
    return simulateBeats();
  }
}
```

---

### 4. Script Python Montage Vidéo

**Fichier à créer** : `server/scripts/video_edit.py`

**Structure** :
```python
#!/usr/bin/env python3
import ffmpeg
import json
import sys
import requests
import tempfile
import os
from pathlib import Path

def download_file(url, dest_path):
    """Télécharge un fichier"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with open(dest_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

def create_video_edit(config):
    """
    Crée la vidéo finale
    
    config = {
        'music_url': '...',
        'intro_url': '...',
        'clips': [...],
        'beats': [...],
        'transcription': {...},
        'style': 'dynamic',
        'output_path': '...'
    }
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        # 1. Télécharger tous les assets
        music_path = download_asset(config['music_url'], temp_dir, 'music.mp3')
        intro_path = download_asset(config['intro_url'], temp_dir, 'intro.mp4')
        clips_paths = [download_asset(url, temp_dir, f'clip_{i}.mp4') 
                      for i, url in enumerate(config['clips'])]
        
        # 2. Découper l'intro selon la transcription
        intro_segments = segment_intro(intro_path, config['transcription'])
        
        # 3. Sélectionner et découper les clips selon les beats
        clip_segments = select_clips(clips_paths, config['beats'], config['style'])
        
        # 4. Assembler la vidéo
        final_video = assemble_video(intro_segments, clip_segments, music_path, config)
        
        # 5. Uploader sur Cloudinary
        cloudinary_url = upload_to_cloudinary(final_video)
        
        return cloudinary_url

def main():
    config_json = sys.stdin.read()
    config = json.loads(config_json)
    
    try:
        result = create_video_edit(config)
        print(json.dumps({'url': result}))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Intégration dans Node.js** :
```javascript
async function createVideoEdit(jobData) {
  const config = {
    music_url: jobData.music_public_url,
    intro_url: jobData.intro_videos[0]?.url,
    clips: jobData.clips.map(c => c.url),
    beats: jobData.beats,
    transcription: jobData.transcription,
    style: jobData.style,
    theme: jobData.theme
  };

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  const { stdout } = await execAsync(
    `python server/scripts/video_edit.py`,
    { input: JSON.stringify(config) }
  );
  
  return JSON.parse(stdout);
}
```

---

## 🐛 Points d'attention et bugs connus

### Problèmes à surveiller

1. **Cache navigateur** : Toujours vider le cache après déploiement
2. **.htaccess** : Vérifier qu'il est bien uploadé (fichier caché)
3. **Cloudinary** : Vérifier que les URLs sont publiques avant AssemblyAI
4. **Render** : Service gratuit "s'endort" après 15 min (premier appel lent)
5. **Taille bundle** : >500KB, à optimiser avec code splitting

### Tests à faire

1. **Upload fichiers** : Tester avec différents formats (MP3, MP4, etc.)
2. **Génération complète** : Tester un job de bout en bout
3. **Erreurs réseau** : Tester avec connexion lente/interrompue
4. **Mobile** : Tester sur différents appareils
5. **Performance** : Tester avec beaucoup de jobs/edits

---

## 📚 Ressources et documentation

### APIs externes
- **Pexels** : https://www.pexels.com/api/documentation/
- **AssemblyAI** : https://www.assemblyai.com/docs/
- **Cloudinary** : https://cloudinary.com/documentation

### Bibliothèques
- **Librosa** : https://librosa.org/doc/latest/index.html
- **FFmpeg** : https://ffmpeg.org/documentation.html
- **ffmpeg-python** : https://kkroening.github.io/ffmpeg-python/

### React Router
- **BrowserRouter** : https://reactrouter.com/en/main/router-components/browser-router
- **HashRouter** (alternative si .htaccess ne fonctionne pas) : https://reactrouter.com/en/main/router-components/hash-router

---

## 🎯 Checklist pour demain

### Avant de commencer
- [ ] Vérifier que le site fonctionne (`npm run check`)
- [ ] Vérifier les clés API (Pexels, AssemblyAI)
- [ ] Tester le déploiement (`npm run deploy:auto`)

### Tâches prioritaires
- [ ] Intégrer Pexels API (vraie)
- [ ] Tester AssemblyAI avec URLs Cloudinary
- [ ] Créer script Python beat detection
- [ ] Créer script Python montage vidéo
- [ ] Intégrer les scripts dans le pipeline backend

### Tests
- [ ] Tester un job complet de bout en bout
- [ ] Vérifier que les vidéos sont bien générées
- [ ] Tester le téléchargement
- [ ] Vérifier les performances

---

## 💡 Conseils pour la suite

1. **Commiter régulièrement** : Fais des commits Git après chaque fonctionnalité
2. **Tester localement** : Teste toujours en local avant de déployer
3. **Logs** : Ajoute des `console.log` pour débugger
4. **Gestion d'erreurs** : Gère toujours les cas d'erreur (try/catch)
5. **Documentation** : Documente les nouvelles fonctions

---

## 🔗 Commandes utiles

```bash
# Développement
npm run dev:full              # Lancer front + back
npm run dev:server            # Backend uniquement
npm run dev                   # Frontend uniquement

# Production
npm run build                 # Build
npm run deploy:auto           # Build + Deploy
npm run check                 # Vérifier config
npm run diagnose              # Diagnostiquer

# Python (quand scripts créés)
python server/scripts/beat_detection.py "https://..."
pip install librosa numpy ffmpeg-python
```

---

**Bon courage pour la suite ! 🚀**

