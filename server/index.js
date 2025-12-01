import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import os from 'os';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ffmpeg from 'fluent-ffmpeg';
import { fetchAudioPresets } from './services/audioLibrary.js';
import { analyzeSourceVideo } from './services/vision.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

const realRenderEnabled = (() => {
  const raw = `${process.env.REAL_RENDER_ENABLED || ''}`.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(raw);
})();
const MAX_RENDER_CLIPS = Number(process.env.RENDER_MAX_CLIPS || 6);
const MAX_CLIP_SEGMENT = Number(process.env.RENDER_CLIP_SEGMENT_MAX || 6);
const visionApiConfigured =
  Boolean(process.env.VISION_API_URL) && Boolean(process.env.VISION_API_KEY);
const pixabayAudioConfigured = Boolean(process.env.PIXABAY_AUDIO_API_KEY);
const TEMP_PREFIX = 'auralyptix';

console.log('[config] REAL_RENDER_ENABLED raw:', process.env.REAL_RENDER_ENABLED, '=>', realRenderEnabled);

await fs.mkdir(uploadsDir, { recursive: true });
await fs.mkdir(dataDir, { recursive: true });

const editsFile = path.join(dataDir, 'edits.json');
const messagesFile = path.join(dataDir, 'messages.json');
const jobsFile = path.join(dataDir, 'jobs.json');

const assemblyEnabled = Boolean(process.env.ASSEMBLYAI_API_KEY);
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

try {
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  }
  if (process.env.FFPROBE_PATH) {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
  }
} catch (error) {
  console.warn('FFmpeg configuration issue:', error.message);
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
  'scene_analysis',
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

function getPublicBaseUrl(req = null) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL;
  }

  if (req) {
    const host = req.get('host');
    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol = forwardedProto
      ? forwardedProto.split(',')[0].trim()
      : req.protocol;
    return `${protocol}://${host}`;
  }

  return `http://localhost:${PORT}`;
}

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
  const text = encodeURIComponent(title || 'Montage IA');
  return `https://placehold.co/800x450/111827/FFFFFF/png?text=${text}`;
}

function isLocalUrl(url) {
  return !url || url.includes('localhost') || url.includes('127.0.0.1');
}

function isRemoteAbsoluteUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function guessExtension(url, fallback = '.mp4') {
  try {
    const ext = path.extname(new URL(url).pathname);
    if (ext && ext.length <= 5) {
      return ext;
    }
  } catch {
    // ignore
  }
  return fallback;
}

async function downloadToTemp(url, { label = 'asset', extension } = {}) {
  if (!isRemoteAbsoluteUrl(url)) {
    throw new Error(`URL non valide pour le téléchargement: ${url}`);
  }

  const ext = extension || guessExtension(url);
  const tempPath = path.join(
    os.tmpdir(),
    `${TEMP_PREFIX}-${label}-${Date.now()}${ext}`
  );

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Téléchargement impossible (${response.status})`);
  }

  const nodeStream =
    typeof response.body.pipe === 'function'
      ? response.body
      : Readable.fromWeb(response.body);

  await pipeline(nodeStream, createWriteStream(tempPath));
  return tempPath;
}

async function cleanupTempFiles(paths = []) {
  await Promise.all(
    paths
      .filter(Boolean)
      .map((filePath) => fs.unlink(filePath).catch(() => {}))
  );
}

function buildClipPlan(clips = [], targetDuration = 30) {
  if (!Array.isArray(clips) || clips.length === 0) {
    return [];
  }

  const sortedClips = clips.slice(0, MAX_RENDER_CLIPS);
  const plan = [];
  let remaining = Math.max(5, targetDuration);

  for (const clip of sortedClips) {
    if (!clip?.url || !isRemoteAbsoluteUrl(clip.url)) continue;
    const desiredDuration = clip.requestedDuration
      ? Number(clip.requestedDuration)
      : Number(clip.duration);
    const clipDuration = Math.max(
      2,
      Math.min(desiredDuration || MAX_CLIP_SEGMENT, MAX_CLIP_SEGMENT)
    );

    const requestedDuration = Math.min(clipDuration, remaining);
    plan.push({
      id: clip.id || crypto.randomUUID(),
      url: clip.url,
      start: typeof clip.start === 'number' ? Number(clip.start) : undefined,
      label: clip.label,
      requestedDuration: Number(requestedDuration.toFixed(2))
    });
    remaining -= requestedDuration;
    if (remaining <= 1) break;
  }

  if (plan.length && remaining > 1) {
    plan[plan.length - 1].requestedDuration = Number(
      (plan[plan.length - 1].requestedDuration + remaining).toFixed(2)
    );
    remaining = 0;
  }

  return remaining <= targetDuration ? plan : [];
}

async function executeFfmpegConcat(plan, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    const stderrBuffer = [];
    plan.forEach((clip) => {
      command.input(clip.localPath);
    });

    if (audioPath) {
      command.input(audioPath);
    }

    const filters = [];
    const labels = [];

    // Chaîne uniquement vidéo : on laisse l'audio en dehors du filtre complexe
    plan.forEach((clip, idx) => {
      const label = plan.length === 1 ? 'vout' : `seg${idx}`;
      labels.push(`[${label}]`);
      filters.push(
        `[${idx}:v]scale=1080:-2:force_original_aspect_ratio=cover,setsar=1,fps=30,trim=0:${clip.requestedDuration},setpts=PTS-STARTPTS[${label}]`
      );
    });

    if (plan.length > 1) {
      filters.push(
        `${labels.join('')}concat=n=${plan.length}:v=1:a=0[vout]`
      );
    }

    command.complexFilter(filters, ['vout']);
    const baseOutputOptions = [
      '-map [vout]',
      '-c:v libx264',
      '-preset veryfast',
      '-pix_fmt yuv420p',
      '-movflags +faststart'
    ];

    if (audioPath) {
      const audioIndex = plan.length; // l'audio est ajouté après les vidéos
      command.outputOptions([
        ...baseOutputOptions,
        `-map ${audioIndex}:a`,
        '-shortest'
      ]);
      command.audioCodec('aac');
    } else {
      command.outputOptions([...baseOutputOptions, '-an']);
    }

    command.on('end', () => resolve(outputPath));
    command.on('stderr', (line) => {
      const text = line?.toString();
      if (!text) return;
      const clean = text.trim();
      if (!clean) return;
      stderrBuffer.push(clean);
      if (stderrBuffer.length > 40) {
        stderrBuffer.shift();
      }
    });
    command.on('error', (err, _stdout, stderr) => {
      if (err) {
        err.stderr =
          (stderr && stderr.trim()) ||
          stderrBuffer.slice(Math.max(0, stderrBuffer.length - 12)).join(' | ');
      }
      reject(err);
    });
    command.save(outputPath);
  });
}

async function renderMontageWithFfmpeg({
  editId,
  clips,
  targetDuration,
  musicUrl
}) {
  if (!realRenderEnabled) {
    console.log('[renderMontageWithFfmpeg] REAL_RENDER_ENABLED=false -> simulation');
    return null;
  }

  const plan = buildClipPlan(clips, targetDuration);
  if (!plan.length) {
    console.warn('[renderMontageWithFfmpeg] Aucun clip dans le plan, fallback simulation');
    return null;
  }

  const downloadedFiles = [];
  try {
    for (const clip of plan) {
      const localPath = await prepareClipAsset(clip);
      clip.localPath = localPath;
      downloadedFiles.push(localPath);
    }

    let audioPath = null;
    if (musicUrl && isRemoteAbsoluteUrl(musicUrl)) {
      try {
        audioPath = await downloadToTemp(musicUrl, {
          label: 'music',
          extension: guessExtension(musicUrl, '.mp3')
        });
        downloadedFiles.push(audioPath);
      } catch (error) {
        console.warn('Téléchargement audio impossible:', error.message);
      }
    }

    const outputPath = path.join(
      os.tmpdir(),
      `${TEMP_PREFIX}-render-${editId}-${Date.now()}.mp4`
    );
    console.log('[renderMontageWithFfmpeg] Plan final FFmpeg', {
      clipCount: plan.length,
      targetDuration,
      hasMusic: Boolean(audioPath)
    });
    plan.forEach((clip, index) => {
      console.log(`[renderMontageWithFfmpeg] Clip ${index + 1}/${plan.length}`, {
        id: clip.id,
        source: clip.url,
        localPath: clip.localPath,
        requestedDuration: clip.requestedDuration,
        start: clip.start
      });
    });
    if (audioPath) {
      console.log('[renderMontageWithFfmpeg] Audio utilisé', { audioPath });
    }
    console.log('[renderMontageWithFfmpeg] Lancement FFmpeg...');
    await executeFfmpegConcat(plan, audioPath, outputPath);
    console.log('[renderMontageWithFfmpeg] FFmpeg terminé', outputPath);
    return {
      videoPath: outputPath,
      clipCount: plan.length
    };
  } catch (error) {
    const stderrSnippet = typeof error.stderr === 'string'
      ? error.stderr.split('\n').slice(-6).join(' ').trim()
      : null;
    console.error('FFmpeg render failed:', error.message);
    if (error.cmd) {
      console.error('[ffmpeg] Command:', error.cmd);
    }
    if (error.stderr) {
      console.error('[ffmpeg] Stderr:', error.stderr);
    }
    const richError = new Error(
      stderrSnippet
        ? `FFmpeg a échoué: ${stderrSnippet}`
        : `FFmpeg a échoué: ${error.message}`
    );
    richError.details = {
      cmd: error.cmd,
      stderr: stderrSnippet || error.stderr || error.message
    };
    throw richError;
  } finally {
    await cleanupTempFiles(downloadedFiles);
  }
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

async function detectBeats(audioUrl, audioSegment = null, targetDuration = null) {
  // Si pas d'URL audio publique, retourner une estimation basée sur la durée
  if (!audioUrl || isLocalUrl(audioUrl)) {
    const duration = targetDuration || 30;
    const estimatedBpm = 120; // BPM moyen par défaut
    const beatInterval = 60 / estimatedBpm;
    const beats = [];
    for (let i = 0; i < duration; i += beatInterval) {
      beats.push(Number(i.toFixed(2)));
    }
    return {
      bpm: estimatedBpm,
      duration,
      beats,
      sections: [
        { label: 'intro', start: 0, end: Math.min(10, duration * 0.15) },
        { label: 'build', start: Math.min(10, duration * 0.15), end: Math.min(30, duration * 0.4) },
        { label: 'drop', start: Math.min(30, duration * 0.4), end: Math.min(55, duration * 0.85) },
        { label: 'outro', start: Math.min(55, duration * 0.85), end: duration }
      ],
      note: 'Détection basée sur estimation (URL audio non accessible)'
    };
  }

  // Utiliser AssemblyAI pour analyser l'audio si disponible
  if (assemblyEnabled) {
    try {
      // AssemblyAI peut analyser l'audio et détecter les beats via l'API
      // Pour l'instant, on utilise la transcription existante pour estimer
      const transcriptData = await transcribeAudio(audioUrl);
      
      // Estimer BPM basé sur les mots détectés et leur timing
      let estimatedBpm = 120;
      if (transcriptData.words && transcriptData.words.length > 0) {
        const words = transcriptData.words;
        const firstWord = words[0];
        const lastWord = words[words.length - 1];
        const totalDuration = (lastWord.end / 1000) - (firstWord.start / 1000);
        const wordCount = words.length;
        
        // Estimer BPM basé sur la densité des mots
        if (totalDuration > 0) {
          const wordsPerSecond = wordCount / totalDuration;
          // Musique rapide = plus de mots par seconde
          estimatedBpm = Math.max(80, Math.min(160, 90 + (wordsPerSecond * 15)));
        }
      }

      const duration = targetDuration || (audioSegment?.end ? audioSegment.end - (audioSegment.start || 0) : 30);
      const beatInterval = 60 / estimatedBpm;
      const beats = [];
      
      // Générer les beats en respectant le segment audio
      const startTime = audioSegment?.start || 0;
      const endTime = audioSegment?.end || duration;
      const segmentDuration = endTime - startTime;
      
      for (let i = 0; i < segmentDuration; i += beatInterval) {
        const beatTime = startTime + i;
        if (beatTime <= endTime) {
          beats.push(Number(beatTime.toFixed(2)));
        }
      }

      // Ajuster les sections selon la durée réelle
      const introEnd = Math.min(segmentDuration * 0.15, 10);
      const buildEnd = Math.min(segmentDuration * 0.4, 30);
      const dropEnd = Math.min(segmentDuration * 0.85, segmentDuration - 5);

      return {
        bpm: Math.round(estimatedBpm),
        duration: segmentDuration,
        beats,
        sections: [
          { label: 'intro', start: startTime, end: startTime + introEnd },
          { label: 'build', start: startTime + introEnd, end: startTime + buildEnd },
          { label: 'drop', start: startTime + buildEnd, end: startTime + dropEnd },
          { label: 'outro', start: startTime + dropEnd, end: endTime }
        ],
        note: 'Détection basée sur analyse AssemblyAI'
      };
    } catch (error) {
      console.error('Beat detection via AssemblyAI failed:', error.message);
    }
  }

  // Fallback: estimation simple
  const duration = targetDuration || 30;
  const estimatedBpm = 120;
  const beatInterval = 60 / estimatedBpm;
  const beats = [];
  const startTime = audioSegment?.start || 0;
  const endTime = audioSegment?.end || duration;
  
  for (let i = 0; i < (endTime - startTime); i += beatInterval) {
    beats.push(Number((startTime + i).toFixed(2)));
  }

  return {
    bpm: estimatedBpm,
    duration: endTime - startTime,
    beats,
    sections: [
      { label: 'intro', start: startTime, end: Math.min(startTime + 10, endTime * 0.15) },
      { label: 'build', start: Math.min(startTime + 10, endTime * 0.15), end: Math.min(startTime + 30, endTime * 0.4) },
      { label: 'drop', start: Math.min(startTime + 30, endTime * 0.4), end: Math.min(startTime + 55, endTime * 0.85) },
      { label: 'outro', start: Math.min(startTime + 55, endTime * 0.85), end: endTime }
    ],
    note: 'Détection basée sur estimation par défaut'
  };
}

async function prepareClipAsset(clip) {
  const label = `clip-${clip.id || crypto.randomUUID()}`;
  const extension = guessExtension(clip.url, '.mp4');
  const tempPath = path.join(os.tmpdir(), `${TEMP_PREFIX}-${label}-${Date.now()}${extension}`);

  if (typeof clip.start === 'number') {
    await new Promise((resolve, reject) => {
      ffmpeg(clip.url)
        .setStartTime(clip.start)
        .setDuration(
          Math.max(1, Number(clip.requestedDuration) || MAX_CLIP_SEGMENT)
        )
        .outputOptions(['-c copy'])
        .on('end', resolve)
        .on('error', reject)
        .save(tempPath);
    });
    return tempPath;
  }

  const downloaded = await downloadToTemp(clip.url, {
    label,
    extension
  });
  return downloaded;
}

async function uploadPlaceholderVideo(editId, title = null) {
  if (!cloudinaryEnabled) {
    return {
      secure_url: sampleVideoUrl,
      thumbnail: createPlaceholderThumbnail(title || `Montage ${editId}`),
      provider: 'placeholder'
    };
  }

  const result = await cloudinary.uploader.upload(sampleVideoUrl, {
    resource_type: 'video',
    folder: 'auralyptix/generated',
    public_id: `montage_${editId}_${Date.now()}`
  });

  return {
    secure_url: result.secure_url,
    thumbnail:
      result.secure_url.replace('/upload/', '/upload/so_auto,q_auto,w_600/'),
    provider: 'cloudinary'
  };
}

async function uploadFinalVideo(editId, { localPath, title } = {}) {
  if (localPath) {
    try {
      if (cloudinaryEnabled) {
        console.log('[upload_final] Upload vers Cloudinary...');
        const result = await cloudinary.uploader.upload(localPath, {
          resource_type: 'video',
          folder: 'auralyptix/generated',
          public_id: `montage_${editId}_${Date.now()}`,
          overwrite: true,
          eager: [
            {
              format: 'jpg',
              transformation: { width: 720, crop: 'fill', public_id: 'thumb' }
            }
          ]
        });
        console.log('[upload_final] Cloudinary OK', result.secure_url);
        await fs.unlink(localPath).catch(() => {});
        return {
          secure_url: result.secure_url,
          thumbnail:
            result.secure_url.replace('/upload/', '/upload/so_0/'),
          provider: 'cloudinary'
        };
      }

      console.log('[upload_final] Cloudinary désactivé, copie locale');
      const fileName = `montage_${editId}_${Date.now()}.mp4`;
      const destination = path.join(uploadsDir, fileName);
      await fs.copyFile(localPath, destination);
      await fs.unlink(localPath).catch(() => {});
      const publicBaseUrl = getPublicBaseUrl();
      return {
        secure_url: `${publicBaseUrl}/uploads/${fileName}`,
        thumbnail: null,
        provider: 'local'
      };
    } catch (error) {
      console.error(
        'Upload final échoué, fallback placeholder:',
        error.message
      );
      if (localPath) {
        await fs.unlink(localPath).catch(() => {});
      }
    }
  }

  return uploadPlaceholderVideo(editId, title);
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
    const errorPayload = {
      status: 'error',
      completed_at: new Date().toISOString(),
      error: error.message
    };
    if (error.details) {
      errorPayload.error_details = error.details;
    }
    await updateJobStep(jobId, name, errorPayload);
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

    const beats = await runStep('beat_detection', () => 
      detectBeats(
        payload.musicPublicUrl || payload.musicUrl,
        audioSegment,
        targetDuration
      )
    );

    let scenePlan = [];
    await runStep('scene_analysis', async () => {
      if (!payload.sourceVideo?.url) {
      console.warn('[scene_analysis] Aucune vidéo source fournie');
        return { used: false, scenes: 0 };
      }
      const scenes = await analyzeSourceVideo({
        sourceVideo: payload.sourceVideo,
        targetDuration
      });
      scenePlan = scenes;
      return {
        used: true,
        scene_count: scenes.length
      };
    });

    if (!scenePlan.length) {
      throw new Error(
        'Aucune scène détectée : merci de fournir une vidéo source exploitable'
      );
    }

    const clips = scenePlan;
    await updateJobStep(jobId, 'clip_scouting', {
      status: 'done',
      completed_at: new Date().toISOString(),
      output: {
        note: 'Segments générés via analyse vidéo',
        clip_count: scenePlan.length
      }
    });

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
      const finalDuration = targetDuration || beats.duration || 30;

      const subtitles = (transcription.words || [])
        .filter((word) => {
          if (!audioSegment) return true;
          const wordStart = word.start / 1000;
          return (
            wordStart >= audioSegment.start &&
            (!audioSegment.end || wordStart <= audioSegment.end)
          );
        })
        .slice(0, Math.min(50, Math.floor(finalDuration / 2)))
        .map((word) => ({
          text: word.text,
          start: word.start / 1000,
          end: word.end / 1000,
          confidence: word.confidence
        }));

      let renderedMontage = null;
      if (realRenderEnabled) {
        renderedMontage = await renderMontageWithFfmpeg({
          editId: payload.editId,
          clips,
          targetDuration: finalDuration,
          musicUrl: payload.musicPublicUrl || payload.musicUrl
        });
      }

      return {
        duration: finalDuration,
        segments: beats.sections,
        subtitles,
        clip_count: renderedMontage?.clipCount || clips.length,
        bpm: beats.bpm,
        renderedVideoPath: renderedMontage?.videoPath || null,
        render_mode: renderedMontage ? 'ffmpeg' : 'simulated'
      };
    });

    const uploadResult = await runStep('upload_final', () =>
      uploadFinalVideo(payload.editId, {
        localPath: videoResult.renderedVideoPath,
        title: payload.title
      })
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
      completed_date: new Date().toISOString(),
      bpm: videoResult.bpm,
      clip_count: videoResult.clip_count,
      transcription_text: transcription.text || '',
      transcription_summary: transcription.summary || [],
      render_mode: videoResult.render_mode
    });

    await updateJob(jobId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    await updateJob(jobId, {
      status: 'failed',
      error: error.message,
      error_details: error.details || null,
      completed_at: new Date().toISOString()
    });
    await updateEdit(payload.editId, {
      status: 'failed',
      error: error.message,
      error_details: error.details || null
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
      pixabay_audio: pixabayAudioConfigured ? 'configured' : 'fallback',
      vision: visionApiConfigured ? 'configured' : 'fallback'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu' });
  }

  try {
    const publicBaseUrl = getPublicBaseUrl(req);
    let fileUrl = `${publicBaseUrl}/uploads/${req.file.filename}`;
    let publicUrl = fileUrl;
    let thumbnail = null;
    let duration = null;

    const isVideo = req.file.mimetype.startsWith('video/');
    const isAudio = req.file.mimetype.startsWith('audio/');
    const resourceType = isVideo ? 'video' : isAudio ? 'raw' : 'auto';

    // Si Cloudinary est configuré, upload directement
    if (cloudinaryEnabled) {
      const baseFolder = 'auralyptix/uploads';
      const uploadOptions = {
        resource_type: resourceType,
        folder: isVideo
          ? `${baseFolder}/videos`
          : isAudio
          ? `${baseFolder}/audio`
          : baseFolder,
        public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
        overwrite: false,
        // Pour les vidéos et audio, récupérer la durée
        ...(isVideo || isAudio ? { eager_async: true } : {})
      };

      // Upload vers Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
      
      publicUrl = result.secure_url;
      fileUrl = result.secure_url;

      // Récupérer la durée depuis Cloudinary
      if (result.duration) {
        duration = Math.round(result.duration);
      } else if (isVideo || isAudio) {
        // Essayer de récupérer les infos depuis l'API Cloudinary
        try {
          const info = await cloudinary.api.resource(result.public_id, {
            resource_type: resourceType
          });
          if (info.duration) {
            duration = Math.round(info.duration);
          }
        } catch (err) {
          console.warn('Impossible de récupérer la durée depuis Cloudinary:', err.message);
        }
      }

      // Générer une thumbnail si c'est une vidéo
      if (isVideo && result.secure_url) {
        const videoId = result.public_id;
        thumbnail = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${videoId}.jpg`;
      }

      // Supprimer le fichier local après upload réussi
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn('Impossible de supprimer le fichier local:', err.message);
      }
    } else {
      // En local, essayer d'extraire la durée pour les fichiers audio/vidéo
      // Note: Pour une vraie extraction, il faudrait utiliser ffmpeg ou une lib audio
      // Pour l'instant, on retourne null et le frontend le calculera
    }

    res.json({
      file_url: fileUrl,
      public_url: publicUrl,
      name: req.file.originalname,
      size: req.file.size,
      mime_type: req.file.mimetype,
      ...(thumbnail && { thumbnail }),
      ...(duration !== null && { duration_seconds: duration })
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    // En cas d'erreur Cloudinary, retourne l'URL locale
    const publicBaseUrl = getPublicBaseUrl(req);
    const fileUrl = `${publicBaseUrl}/uploads/${req.file.filename}`;
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
    audio_segment = {},
    source_video = null
  } = req.body;

  if (!title || !theme || !style || !music_url) {
    return res.status(400).json({ 
      message: 'Champs requis manquants',
      required: ['title', 'theme', 'style', 'music_url']
    });
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
    source_video,
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
    audioSegment: parsedAudioSegment,
    sourceVideo: source_video
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

app.get('/api/audio-library', async (_req, res) => {
  try {
    const presets = await fetchAudioPresets(12);
    res.json({ presets, provider: pixabayAudioConfigured ? 'pixabay' : 'fallback' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
  console.log(`Server ready on ${getPublicBaseUrl()}`);
  console.log(`Frontend served from: ${distPath}`);
});

