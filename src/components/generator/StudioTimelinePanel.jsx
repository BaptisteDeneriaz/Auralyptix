import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function StudioTimelinePanel({
  musicData,
  formData,
  setFormData
}) {
  const audioDuration =
    musicData?.durationSeconds ||
    formData.audioSelection?.end ||
    formData.durationSeconds ||
    30;
  const start = formData.audioSelection?.start ?? 0;
  const end =
    formData.audioSelection?.end ??
    audioDuration;
  const segmentLength = Math.max(0, end - start);

  const handleDurationChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      durationSeconds: value
    }));
  };

  const handleAutoAlignToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      audioSelection: {
        ...prev.audioSelection,
        autoBeatAlign: checked
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
          Timeline
        </p>
        <h2 className="text-3xl font-bold text-white">
          Planifie ton montage
        </h2>
        <p className="text-gray-400 mt-2">
          Ajuste la durée cible et visualise le segment audio utilisé pour
          caler les coupes. Les points clés s’aligneront automatiquement
          sur les beats détectés.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-lg">
            {formData.durationSeconds || 30}s
          </span>
          <span className="text-sm text-gray-400">
            Durée totale du montage
          </span>
        </div>
        <Slider
          value={[formData.durationSeconds || 30]}
          min={5}
          max={120}
          step={5}
          onValueChange={(val) => handleDurationChange(val[0])}
          className="[&_[role=slider]]:h-8 [&_[role=slider]]:w-8"
        />
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90, 120].map((value) => (
            <button
              key={value}
              onClick={() => handleDurationChange(value)}
              type="button"
              className={`px-3 py-1 rounded-full text-sm border transition ${
                (formData.durationSeconds || 30) === value
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'border-white/20 text-gray-300 hover:border-white/40'
              }`}
            >
              {value}s
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 border border-white/10 rounded-3xl p-5 bg-black/20">
        <div className="flex items-center justify-between">
          <p className="text-white font-medium">Segment audio utilisé</p>
          <span className="text-sm text-gray-400">
            {start.toFixed(1)}s → {end.toFixed(1)}s ({segmentLength.toFixed(1)}s)
          </span>
        </div>

        <div className="relative h-16 flex items-center">
          <div className="absolute inset-0 rounded-full bg-white/5" />
          <div className="absolute inset-0">
            <div
              className="absolute h-full bg-gradient-to-r from-blue-600/40 to-purple-600/40 rounded-full border border-blue-400/40"
              style={{
                left: `${(start / audioDuration) * 100}%`,
                width: `${((segmentLength || 0.001) / audioDuration) * 100}%`
              }}
            />
          </div>
          <div className="relative w-full flex justify-between text-xs text-gray-500 px-4">
            <span>0s</span>
            <span>{Math.round(audioDuration)}s</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
          <div>
            <p className="text-white font-medium">
              Alignement intelligent
            </p>
            <p className="text-sm text-gray-400">
              Caler automatiquement les coupes sur les beats détectés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-300 text-sm">Auto</Label>
            <Switch
              checked={formData.audioSelection?.autoBeatAlign ?? true}
              onCheckedChange={handleAutoAlignToggle}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

