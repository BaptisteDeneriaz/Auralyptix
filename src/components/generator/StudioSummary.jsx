import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Waves,
  ClipboardList,
  Clock3,
  AlertTriangle
} from 'lucide-react';

export default function StudioSummary({
  musicData,
  introVideos,
  formData,
  onLaunch,
  launching
}) {
  const hasAudio = Boolean(musicData?.file_url);
  const hasTitle = Boolean(formData.title?.trim());
  const hasTheme = Boolean(formData.theme?.trim());
  const duration = formData.durationSeconds || 30;
  const segmentStart = formData.audioSelection?.start ?? 0;
  const segmentEnd =
    formData.audioSelection?.end ??
    musicData?.durationSeconds ??
    duration;
  const segmentLength = Math.max(0, segmentEnd - segmentStart);

  const checklist = [
    {
      id: 'audio',
      label: 'Piste principale',
      ready: hasAudio,
      detail: hasAudio
        ? `${musicData.name} (${musicData.durationSeconds || '--'}s)`
        : 'Ajoute ta musique ou une vidéo'
    },
    {
      id: 'theme',
      label: 'Brief créatif',
      ready: hasTitle && hasTheme,
      detail: hasTitle
        ? `« ${formData.title || 'Sans titre'} »`
        : 'Donne un titre et un thème'
    },
    {
      id: 'timeline',
      label: 'Plan de montage',
      ready: Boolean(duration),
      detail: `${duration}s ciblés • segment ${segmentLength.toFixed(1)}s`
    },
    {
      id: 'intro',
      label: 'Intro parlée (optionnel)',
      ready: introVideos.length > 0,
      optional: true,
      detail:
        introVideos.length > 0
          ? `${introVideos.length} vidéo(s) chargée(s)`
          : 'Tu peux ajouter jusqu’à 3 intros'
    }
  ];

  const blockers = checklist.filter(
    (item) => !item.optional && !item.ready
  );
  const canLaunch = blockers.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6"
    >
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200">
              Studio Control
            </p>
            <h3 className="text-2xl font-bold text-white">
              Prêt à lancer le montage ?
            </h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3">
          Vérifie chaque module, choisis la durée idéale puis lance la
          génération. L’IA alignera les coupes sur la musique et tes
          instructions créatives.
        </p>
      </div>

      <div className="space-y-4">
        {checklist.map((item) => {
          const Icon =
            item.id === 'audio'
              ? Waves
              : item.id === 'theme'
              ? ClipboardList
              : item.id === 'timeline'
              ? Clock3
              : AlertTriangle;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                item.ready
                  ? 'border-green-500/30 bg-green-500/5'
                  : item.optional
                  ? 'border-white/10 bg-white/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.ready
                    ? 'bg-green-500/30 text-green-200'
                    : item.optional
                    ? 'bg-white/10 text-gray-300'
                    : 'bg-amber-500/20 text-amber-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {item.label}
                  {item.optional && (
                    <span className="text-xs text-gray-400 ml-2">
                      (optionnel)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {blockers.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-sm text-amber-100">
          Complète les éléments manquants avant de lancer le montage :
          {blockers.map((item) => ` ${item.label.toLowerCase()}`).join(', ')}.
        </div>
      )}

      <Button
        onClick={onLaunch}
        disabled={!canLaunch || launching}
        className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {launching ? 'Préparation du studio...' : 'Lancer le montage'}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        Durée cible : <span className="text-white">{duration}s</span> •
        Segment utilisé :{' '}
        <span className="text-white">{segmentLength.toFixed(1)}s</span>
      </div>
    </motion.div>
  );
}

