import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import multer from 'multer';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

await fs.mkdir(uploadsDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });

const editsFile = path.join(dataDir, 'edits.json');
const messagesFile = path.join(dataDir, 'messages.json');
const jobsFile = path.join(dataDir, 'jobs.json');

const assemblyEnabled = Boolean(process.env.ASSEMBLYAI_API_KEY);
const pexelsEnabled = Boolean(process.env.PEXELS_API_KEY);
const cloudinaryEnabled =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

const defaultSteps = [
  'collect_inputs',
  'analyze_intro',
  'transcription',
  'beat_detection',
  'clip_scouting',
  'style_transfer',
  'editing',
  'upload_final'
];

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(uploadsDir));

// Servir le frontend React (après le build)
// Cette route sera ajoutée à la fin, après toutes les routes API

const sampleVideoUrl =
  'https://res.cloudinary.com/demo/video/upload/v1716554020/marketing_video.mp4';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function readEdits() {
  return readJson(editsFile, []);
}

async function writeEdits(edits) {
  await writeJson(editsFile, edits);
}

async function readJobs() {
  return readJson(jobsFile, []);
}

async function writeJobs(jobs) {
  await writeJson(jobsFile, jobs);
}

async function saveContactMessage(message) {
  const messages = await readJson(messagesFile, []);
  messages.push(message);
  await writeJson(messagesFile, messages);
}

function createPlaceholderThumbnail(title) {
  const text = encodeURIComponent(title || 'Edit IA');
  return `https://placehold.co/800x450/111827/FFFFFF/png?text=${text}`;
}

function isLocalUrl(url) {
  return !url || url.includes('localhost') || url.includes('127.0.0.1');
}

async function updateEdit(editId, updates) {
  const edits = await readEdits();
  const idx = edits.findIndex((edit) => edit.id === editId);
  if (idx === -1) return null;
  edits[idx] = { ...edits[idx], ...updates };
  await writeEdits(edits);
  return edits[idx];
}

async function getEdit(editId) {
  const edits = await readEdits();
  return edits.find((edit) => edit.id === editId) || null;
}

async function updateJob(jobId, updates) {
  const jobs = await readJobs();
  const idx = jobs.findIndex((job) => job.id === jobId);
  if (idx === -1) return null;
  jobs[idx] = {
    ...jobs[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };
  await writeJobs(jobs);
  return jobs[idx];
}

async function updateJobStep(jobId, stepName, updates) {
  const jobs = await readJobs();
  const idx = jobs.findIndex((job) => job.id === jobId);
  if (idx === -1) return null;
  jobs[idx].steps = jobs[idx].steps.map((step) =>
    step.name === stepName ? { ...step, ...updates } : step
  );
  jobs[idx].updated_at = new Date().toISOString();
  await writeJobs(jobs);
  return jobs[idx];
}

const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';
const ASSEMBLYAI_POLL_INTERVAL_MS = Number(
  process.env.ASSEMBLYAI_POLL_INTERVAL_MS || 2000
);
const ASSEMBLYAI_MAX_POLLS = Number(
  process.env.ASSEMBLYAI_MAX_POLLS || 90
);

async function requestAssemblyAI(pathname, options = {}) {
  const response = await fetch(`${ASSEMBLYAI_BASE_URL}${pathname}`, {
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      'content-type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `AssemblyAI error (${response.status})`;
    throw new Error(message);
  }

  return data;
}

async function createAssemblyTranscript(payload) {
  const body = {
    audio_url: payload.audio_url,
    speaker_labels: false,
    punctuate: true,
    format_text: true,
    disfluencies: true,
    auto_highlights: true,
    sentiment_analysis: true,
    entity_detection: true,
    summarization: true,
    summary_model: 'informative',
    summary_type: 'bullets',
    language_code: 'fr',
    language_detection: true,
    speakers_expected: 1,
    filter_profanity: false,
    ...payload.extra
  };

  const transcript = await requestAssemblyAI('/transcript', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!transcript.id) {
    throw new Error(
      transcript.error || 'Impossible de créer une transcription AssemblyAI'
    );
  }

  return transcript.id;
}

async function pollAssemblyTranscript(transcriptId) {
  let attempt = 0;

  while (attempt < ASSEMBLYAI_MAX_POLLS) {
    await sleep(ASSEMBLYAI_POLL_INTERVAL_MS);
    attempt += 1;

    const result = await requestAssemblyAI(`/transcript/${transcriptId}`, {
      method: 'GET'
    });

    if (result.status === 'completed') {
      return result;
    }

    if (result.status === 'error') {
      throw new Error(result.error || 'Transcription AssemblyAI échouée');
    }
  }

  throw new Error('Transcription AssemblyAI trop longue (>3min)');
}

function buildTranscriptionResponse(result, { audioUrl }) {
  return {
    text: result.text ?? '',
    words: result.words ?? [],
    utterances: result.utterances ?? [],
    summary: result.summary ?? [],
    highlights: result.auto_highlights_result?.results ?? [],
    sentiment: result.sentiment_analysis_results ?? [],
    entities: result.entities ?? [],
    audio_url: audioUrl,
    confidence: result.confidence ?? null,
    processing_time: result.processed_time ?? null
  };
}

async function transcribeAudio(audioUrl) {
  if (!audioUrl) {
    return { text: '', words: [], note: 'Aucune piste audio fournie' };
  }

  if (!assemblyEnabled) {
    return {
      text: '',
      words: [],
      note: 'Transcription simulée (clé AssemblyAI absente)'
    };
  }

  if (isLocalUrl(audioUrl)) {
    return {
      text: '',
      words: [],
      note: 'Transcription simulée (URL locale non accessible par AssemblyAI)'
    };
  }

  try {
    const transcriptId = await createAssemblyTranscript({
      audio_url: audioUrl
    });
    const result = await pollAssemblyTranscript(transcriptId);
    return buildTranscriptionResponse(result, { audioUrl });
  } catch (error) {
    console.error('AssemblyAI transcription failed:', error.message);
    return {
      text: '',
      words: [],
      note: `Transcription indisponible: ${error.message}`
    };
  }
}

async function detectBeats() {
  await sleep(1000);
  const bpm = 110 + Math.floor(Math.random() * 30);
  const duration = 75 + Math.floor(Math.random() * 20);
  const beatInterval = 60 / bpm;
  const beats = [];
  for (let i = 0; i < duration; i += beatInterval) {
    beats.push(Number(i.toFixed(2)));
  }
  return {
    bpm,
    duration,
    beats,
    sections: [
      { label: 'intro', start: 0, end: 10 },
      { label: 'build', start: 10, end: 30 },
      { label: 'drop', start: 30, end: 55 },
      { label: 'outro', start: 55, end: duration }
    ]
  };
}

async function fetchClips(theme) {
  if (!pexelsEnabled) {
    return Array.from({ length: 6 }).map((_, idx) => ({
      id: `placeholder-${idx}`,
      url: `https://videos.pexels.com/video-${1000 + idx}`,
      thumbnail: `https://images.pexels.com/photos/${1000 + idx}/pexels-photo.jpeg`,
      duration: 6 + (idx % 4),
      description: `${theme} clip ${idx + 1}`
    }));
  }

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
    return fetchClips(null);
  }

  const data = await response.json();
  return (data.videos || []).slice(0, 8).map((video) => ({
    id: `pexels-${video.id}`,
    url: video.video_files?.[0]?.link,
    duration: video.duration,
    thumbnail: video.image,
    description: video.user?.name || 'Pexels'
  }));
}

async function uploadPlaceholderVideo(editId) {
  if (!cloudinaryEnabled) {
    return {
      secure_url: sampleVideoUrl,
      thumbnail: createPlaceholderThumbnail(`Edit ${editId}`),
      provider: 'placeholder'
    };
  }

  const result = await cloudinary.uploader.upload(sampleVideoUrl, {
    resource_type: 'video',
    folder: 'autoedit/generated',
    public_id: `edit_${editId}_${Date.now()}`
  });

  return {
    secure_url: result.secure_url,
    thumbnail:
      result.secure_url.replace('/upload/', '/upload/so_auto,q_auto,w_600/'),
    provider: 'cloudinary'
  };
}

async function runGenerationJob(jobId, payload) {
  const targetDuration = Math.min(
    Math.max(5, Number(payload.durationSeconds) || 30),
    120
  );
  const audioSegment = {
    start: Math.max(0, Number(payload.audioSegment?.start) || 0),
    end:
      typeof payload.audioSegment?.end === 'number'
        ? Math.max(Number(payload.audioSegment.end), 0)
        : null,
    autoBeatAlign:
      typeof payload.audioSegment?.auto_beat_align === 'boolean'
        ? payload.audioSegment.auto_beat_align
        : typeof payload.audioSegment?.autoBeatAlign === 'boolean'
        ? payload.audioSegment.autoBeatAlign
        : true
  };

  const runStep = async (name, handler) => {
    await updateJobStep(jobId, name, {
      status: 'running',
      started_at: new Date().toISOString()
    });
    try {
      const output = await handler();
      await updateJobStep(jobId, name, {
        status: 'done',
        completed_at: new Date().toISOString(),
        output
      });
      return output;
    } catch (error) {
      await updateJobStep(jobId, name, {
        status: 'error',
        completed_at: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  };

  try {
    await updateJob(jobId, { status: 'processing' });

    await runStep('collect_inputs', async () => {
      await sleep(500);
      return {
        intro_videos: payload.introVideos?.length || 0,
        reference_video_url: payload.referenceVideoUrl,
        duration_seconds: targetDuration,
        audio_segment: audioSegment
      };
    });

    await runStep('analyze_intro', async () => {
      await sleep(500);
      return {
        hasIntro: Boolean(payload.introVideos?.length),
        detected_voice: payload.introVideos?.length ? 'detected' : 'none'
      };
    });

    const transcription = await runStep('transcription', async () =>
      transcribeAudio(payload.musicPublicUrl || payload.musicUrl)
    );

    const beats = await runStep('beat_detection', detectBeats);
    const clips = await runStep('clip_scouting', () =>
      fetchClips(payload.theme)
    );

    await runStep('style_transfer', async () => {
      await sleep(400);
      return {
        base_style: payload.style,
        reference_analysis: payload.referenceVideoUrl
          ? { rhythm: 'fast', transitions: 'zoom' }
          : null
      };
    });

    const videoResult = await runStep('editing', async () => {
      await sleep(1500);
      return {
        duration: targetDuration,
        segments: beats.sections,
        subtitles: transcription.words?.slice(0, 40) ?? []
      };
    });

    const uploadResult = await runStep('upload_final', () =>
      uploadPlaceholderVideo(payload.editId)
    );

    await updateEdit(payload.editId, {
      status: 'ready',
      duration: videoResult.duration,
      audio_segment_used: audioSegment,
      sections: videoResult.segments,
      subtitles: videoResult.subtitles,
      video_url: uploadResult.secure_url,
      thumbnail_url: uploadResult.thumbnail,
      provider: uploadResult.provider,
      completed_date: new Date().toISOString()
    });

    await updateJob(jobId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    await updateJob(jobId, {
      status: 'failed',
      error: error.message,
      completed_at: new Date().toISOString()
    });
    await updateEdit(payload.editId, {
      status: 'failed',
      error: error.message
    });
  }
}

async function enqueueGeneration(payload) {
  const jobs = await readJobs();
  const newJob = {
    id: crypto.randomUUID(),
    status: 'queued',
    edit_id: payload.editId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: defaultSteps.map((name) => ({
      name,
      status: 'pending'
    }))
  };

  jobs.unshift(newJob);
  await writeJobs(jobs);

  runGenerationJob(newJob.id, payload).catch((error) => {
    console.error('Job error', error);
  });

  return newJob;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      assemblyai: assemblyEnabled ? 'configured' : 'disabled',
      cloudinary: cloudinaryEnabled ? 'configured' : 'disabled',
      pexels: pexelsEnabled ? 'configured' : 'disabled'
    }
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu' });
  }

  try {
    let fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    let publicUrl = fileUrl;
    let thumbnail = null;

    // Si Cloudinary est configuré, upload directement
    if (cloudinaryEnabled) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const isAudio = req.file.mimetype.startsWith('audio/');
      const resourceType = isVideo ? 'video' : isAudio ? 'raw' : 'auto';

      const uploadOptions = {
        resource_type: resourceType,
        folder: isVideo ? 'autoedit/uploads/videos' : isAudio ? 'autoedit/uploads/audio' : 'autoedit/uploads',
        public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
        overwrite: false
      };

      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
      
      publicUrl = result.secure_url;
      fileUrl = result.secure_url;

      // Générer une thumbnail si c'est une vidéo
      if (isVideo && result.secure_url) {
        // Cloudinary génère automatiquement une thumbnail pour les vidéos
        const videoId = result.public_id;
        thumbnail = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${videoId}.jpg`;
      }

      // Supprimer le fichier local après upload réussi
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn('Impossible de supprimer le fichier local:', err.message);
      }
    }

    res.json({
      file_url: fileUrl,
      public_url: publicUrl,
      name: req.file.originalname,
      size: req.file.size,
      mime_type: req.file.mimetype,
      ...(thumbnail && { thumbnail })
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    // En cas d'erreur Cloudinary, retourne l'URL locale
    const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    res.json({
      file_url: fileUrl,
      public_url: fileUrl,
      name: req.file.originalname,
      size: req.file.size,
      mime_type: req.file.mimetype,
      warning: 'Upload Cloudinary échoué, fichier disponible localement uniquement'
    });
  }
});

app.post('/api/generate', async (req, res) => {
  const {
    title,
    theme,
    style,
    music_url,
    music_name,
    music_public_url,
    intro_videos = [],
    reference_video_url,
    custom_prompt,
    duration_seconds = 30,
    audio_segment = {}
  } = req.body;

  if (!title || !theme || !style || !music_url) {
    return res.status(400).json({ message: 'Champs requis manquants' });
  }

  const editId = crypto.randomUUID();
  const parsedAudioSegment = {
    start: Math.max(0, Number(audio_segment.start) || 0),
    end:
      typeof audio_segment.end === 'number'
        ? Math.max(Number(audio_segment.end), 0)
        : null,
    auto_beat_align:
      typeof audio_segment.auto_beat_align === 'boolean'
        ? audio_segment.auto_beat_align
        : true
  };

  if (
    parsedAudioSegment.end !== null &&
    parsedAudioSegment.end <= parsedAudioSegment.start
  ) {
    parsedAudioSegment.end = parsedAudioSegment.start + 5;
  }

  const newEdit = {
    id: editId,
    title,
    theme,
    style,
    custom_prompt,
    music_url,
    music_name,
    reference_video_url,
    intro_videos,
    duration_seconds,
    audio_segment: parsedAudioSegment,
    status: 'processing',
    thumbnail_url: createPlaceholderThumbnail(title),
    created_date: new Date().toISOString()
  };

  const edits = await readEdits();
  edits.unshift(newEdit);
  await writeEdits(edits);

  const job = await enqueueGeneration({
    editId,
    title,
    theme,
    style,
    musicUrl: music_url,
    musicName: music_name,
    musicPublicUrl: music_public_url,
    introVideos: intro_videos,
    referenceVideoUrl: reference_video_url,
    customPrompt: custom_prompt,
    durationSeconds: duration_seconds,
    audioSegment: parsedAudioSegment
  });

  res.status(202).json({
    edit: newEdit,
    job
  });
});

app.get('/api/status/:jobId', async (req, res) => {
  const jobs = await readJobs();
  const job = jobs.find((j) => j.id === req.params.jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job introuvable' });
  }
  res.json(job);
});

app.get('/api/jobs', async (_req, res) => {
  const jobs = await readJobs();
  res.json(jobs);
});

app.get('/api/edits', async (_req, res) => {
  const edits = await readEdits();
  res.json(edits);
});

app.get('/api/edits/:id', async (req, res) => {
  const edit = await getEdit(req.params.id);
  if (!edit) {
    return res.status(404).json({ message: 'Edit introuvable' });
  }
  res.json(edit);
});

app.delete('/api/edits/:id', async (req, res) => {
  const edits = await readEdits();
  const nextEdits = edits.filter((edit) => edit.id !== req.params.id);

  if (nextEdits.length === edits.length) {
    return res.status(404).json({ message: 'Edit introuvable' });
  }

  await writeEdits(nextEdits);
  res.status(204).send();
});

app.post('/api/transcribe', async (req, res) => {
  const { audio_url } = req.body;
  if (!audio_url) {
    return res.status(400).json({ message: 'audio_url est requis' });
  }

  try {
    const data = await transcribeAudio(audio_url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Merci de remplir tous les champs' });
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    email,
    message,
    created_date: new Date().toISOString()
  };

  await saveContactMessage(entry);
  res.status(201).json({ status: 'received' });
});

// Servir le frontend React (doit être après toutes les routes API)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Toutes les routes non-API redirigent vers index.html (pour React Router)
app.get('*', (req, res) => {
  // Ignorer les routes API (déjà gérées plus haut)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route API introuvable' });
  }
  // Servir index.html pour toutes les autres routes (React Router)
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server ready on ${BASE_URL}`);
  console.log(`Frontend served from: ${distPath}`);
});

