import React, { useEffect, useMemo, useState } from 'react';
import { motion } from "framer-motion";
import { Loader2, Music, Wand2, Film, CheckCircle, Zap, UploadCloud } from "lucide-react";
import { api } from '@/api/client';

const STEP_META = {
  collect_inputs: { icon: Music, label: 'Collecte des inputs' },
  analyze_intro: { icon: Film, label: 'Analyse de l\'intro parlée' },
  transcription: { icon: Wand2, label: 'Transcription & sous-titres' },
  beat_detection: { icon: Zap, label: 'Analyse BPM & beats' },
  clip_scouting: { icon: Film, label: 'Recherche de clips' },
  style_transfer: { icon: Wand2, label: 'Adaptation du style' },
  editing: { icon: CheckCircle, label: 'Assemblage vidéo (studio)' },
  upload_final: { icon: UploadCloud, label: 'Upload final' }
};

const FALLBACK_STEPS = Object.keys(STEP_META).map((name) => ({
  name,
  status: 'pending'
}));

function getErrorHelp(message = '') {
  if (!message) return null;
  const lower = message.toLowerCase();
  if (lower.includes('ffmpeg')) {
    return {
      title: 'FFmpeg n’a pas pu assembler la vidéo',
      tips: [
        'Vérifie que la vidéo source est un vrai MP4/ MOV accessible publiquement.',
        'Assure-toi que REAL_RENDER_ENABLED est bien à true sur Render.',
        'Confirme que le serveur dispose de ffmpeg/ffprobe (script install-ffmpeg exécuté).'
      ]
    };
  }
  if (lower.includes('cloudinary')) {
    return {
      title: 'Upload Cloudinary échoué',
      tips: [
        'Recontrôle les variables CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET.',
        'Vérifie que le fichier généré n’a pas été supprimé avant l’upload.',
        'Tu peux tester la même requête depuis Postman vers /api/upload pour valider tes clés.'
      ]
    };
  }
  if (lower.includes('scène') || lower.includes('scene')) {
    return {
      title: 'Analyse vidéo impossible',
      tips: [
        'Utilise un MP4 avec du mouvement (pas un flux YouTube / page HTML).',
        'Si tu utilises une URL externe, assure-toi qu’elle pointe vers un fichier direct.',
        'Tu peux aussi désactiver l’API Vision (VISION_API_URL) pour revenir au fallback local.'
      ]
    };
  }
  if (lower.includes('upload') || lower.includes('fetch')) {
    return {
      title: 'Problème réseau lors de l’upload',
      tips: [
        'Teste la même action en local (npm run dev:server) pour voir les logs.',
        'Assure-toi que PUBLIC_BASE_URL pointe vers ton domaine Render et pas vers Redis.',
        'Si tu utilises une URL, vérifie qu’elle retourne bien un fichier (200 / OK).'
      ]
    };
  }
  return {
    title: 'Erreur détectée',
    tips: [
      'Relance la génération après avoir vérifié les inputs.',
      'Regarde le message exact ci-dessous et envoie-le si tu as besoin d’aide.',
      'Tu peux aussi copier l’URL /api/status/<jobId> pour voir tous les détails JSON.'
    ]
  };
}

export default function GeneratingStep({ jobInfo }) {
  const jobId = jobInfo?.job?.id;
  const [job, setJob] = useState(jobInfo?.job || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let canceled = false;
    let interval;

    const fetchStatus = async () => {
      try {
        const status = await api.getJobStatus(jobId);
        if (!canceled) {
          setJob(status);
          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
          }
          if (status.status === 'failed') {
            setError(status.error || 'La génération a échoué');
          }
        }
      } catch (err) {
        console.error(err);
        if (!canceled) {
          setError('Impossible de récupérer le statut');
        }
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 2500);

    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, [jobId]);

  const steps = useMemo(() => {
    const source = job?.steps?.length ? job.steps : FALLBACK_STEPS;
    return source.map((step) => ({
      ...step,
      icon: STEP_META[step.name]?.icon || Music,
      label: STEP_META[step.name]?.label || step.name
    }));
  }, [job]);

  const errorHelp = useMemo(() => getErrorHelp(error || job?.error), [error, job?.error]);

  const completed = steps.filter((s) => s.status === 'done').length;
  const progress = steps.length
    ? Math.round((completed / steps.length) * 100)
    : 0;
  const currentStep = steps.findIndex((s) => s.status === 'running');
  const statusBadge =
    job?.status === 'completed'
      ? 'Terminé'
      : job?.status === 'failed'
      ? 'Erreur'
      : 'En cours';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">
          {job?.status === 'completed'
            ? 'Montage terminé !'
            : job?.status === 'failed'
            ? 'Erreur lors de la génération'
            : 'Génération en cours...'}
        </h2>
        <p className="text-gray-400">
          {job?.status === 'completed'
            ? 'Tu peux retrouver la vidéo dans ton dashboard.'
            : job?.status === 'failed'
            ? error
            : 'L\'IA peaufine ton montage professionnel'}
        </p>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide px-3 py-1 rounded-full bg-white/10 text-white/80">
          <span className={`w-2 h-2 rounded-full ${job?.status === 'failed' ? 'bg-red-400' : job?.status === 'completed' ? 'bg-green-400' : 'bg-blue-400 animate-pulse'}`} />
          {statusBadge}
        </div>
      </div>

      {/* Progress circle */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              transition={{ duration: 0.1 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{Math.round(progress)}%</div>
              {job?.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
              ) : job?.status === 'failed' ? (
                <span className="text-sm text-red-400 font-semibold">Erreur</span>
              ) : (
                <Loader2 className="w-6 h-6 text-blue-400 mx-auto animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'done';
          const isCurrent = step.status === 'running' || (!isCompleted && currentStep === -1 && index === 0);
          const statusText =
            step.status === 'done'
              ? 'Terminée'
              : step.status === 'running'
              ? 'En cours'
              : step.status === 'error'
              ? 'Erreur'
              : 'En attente';

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? 'border-blue-500 bg-blue-500/10'
                  : isCompleted
                  ? 'border-green-500/30 bg-green-500/5'
                  : step.status === 'error'
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isCurrent
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                  : isCompleted
                  ? 'bg-green-600'
                  : step.status === 'error'
                  ? 'bg-red-600'
                  : 'bg-white/10'
              }`}>
                {isCurrent ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Icon className={`w-6 h-6 ${
                    isCompleted ? 'text-white' : step.status === 'error' ? 'text-white' : 'text-gray-400'
                  }`} />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`font-medium ${
                  isCurrent || isCompleted ? 'text-white' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
                <span className="text-xs text-gray-400">{statusText}</span>
                {step.status === 'error' && step.error && (
                  <span className="text-xs text-red-300 mt-1">
                    {step.error}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {job?.status === 'failed' && error && (
        <div className="max-w-xl mx-auto w-full rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          <p className="font-semibold text-red-200 mb-1">Détail de l’erreur</p>
          <p>{error}</p>
        </div>
      )}

      {job?.status === 'failed' && errorHelp && (
        <div className="max-w-xl mx-auto w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200 space-y-2">
          <p className="font-semibold text-white">{errorHelp.title}</p>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {errorHelp.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {jobId && (
        <div className="text-center text-gray-500 text-sm">
          Job ID : <span className="font-mono text-white/80">{jobId}</span>
        </div>
      )}
    </motion.div>
  );
}