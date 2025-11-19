import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Gamepad2, Car, Film, Dumbbell, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const themes = [
  { id: 'football', label: 'Football', icon: Dumbbell, gradient: 'from-green-500 to-emerald-500' },
  { id: 'cars', label: 'Voitures', icon: Car, gradient: 'from-red-500 to-orange-500' },
  { id: 'anime', label: 'Anime', icon: Film, gradient: 'from-purple-500 to-pink-500' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'art', label: 'Art', icon: Palette, gradient: 'from-yellow-500 to-orange-500' },
  { id: 'custom', label: 'Personnalisé', icon: Sparkles, gradient: 'from-indigo-500 to-purple-500' }
];

export default function ThemeStep({ onNext, onBack, formData, setFormData }) {
  const [selectedTheme, setSelectedTheme] = useState(formData.theme || '');
  const [customPrompt, setCustomPrompt] = useState(formData.customPrompt || '');
  const [style, setStyle] = useState(formData.style || 'dynamic');
  const [title, setTitle] = useState(formData.title || '');
  const [referenceUrl, setReferenceUrl] = useState(formData.referenceUrl || '');
  const [brief, setBrief] = useState(formData.brief || '');
  const [duration, setDuration] = useState(formData.durationSeconds || 30);

  const handleNext = () => {
    if (!selectedTheme || !title) {
      alert('Veuillez choisir un thème et donner un titre');
      return;
    }
    if (selectedTheme === 'custom' && !customPrompt) {
      alert('Veuillez décrire votre thème personnalisé');
      return;
    }

    setFormData({
      ...formData,
      theme: selectedTheme === 'custom' ? customPrompt : selectedTheme,
      customPrompt: selectedTheme === 'custom' ? customPrompt : '',
      style,
      title,
      referenceUrl,
      brief,
      durationSeconds: duration
    });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Choisis ton thème</h2>
        <p className="text-gray-400">Sélectionne un thème ou crée le tien</p>
      </div>

      {/* Title input */}
      <div className="space-y-2">
        <Label className="text-white">Titre de l'edit</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Mon edit football 2024"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Duration selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Durée de l'edit</Label>
            <p className="text-xs text-gray-500">
              Choisis entre 5s et 120s (recommandé : 30s pour TikTok)
            </p>
          </div>
          <span className="text-white font-semibold text-lg">
            {duration}s
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
          className="w-full accent-purple-500"
        />
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90, 120].map((value) => (
            <button
              key={value}
              onClick={() => setDuration(value)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                duration === value
                  ? 'bg-purple-600 text-white border-transparent'
                  : 'border-white/20 text-gray-300 hover:border-white/40'
              }`}
              type="button"
            >
              {value}s
            </button>
          ))}
        </div>
      </div>

      {/* Audio segment summary */}
      {formData.audioSelection && (
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-300">
            Segment audio sélectionné&nbsp;:
            <span className="text-white font-semibold ml-2">
              {(formData.audioSelection.start ?? 0).toFixed(1)}s →{' '}
              {(
                formData.audioSelection.end ??
                formData.durationSeconds ??
                duration
              ).toFixed(1)}s
            </span>
            <span className="text-gray-400 ml-2">
              ({Math.max(
                0,
                (formData.audioSelection.end ??
                  formData.durationSeconds ??
                  duration) -
                  (formData.audioSelection.start ?? 0)
              ).toFixed(1)}{' '}
              s)
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Alignement automatique sur les beats :{' '}
            {formData.audioSelection.autoBeatAlign ? 'activé' : 'désactivé'}
          </p>
        </div>
      )}

      {/* Theme selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${theme.gradient} p-3`}>
                <Icon className="w-full h-full text-white" />
              </div>
              <p className="text-white font-semibold text-center">{theme.label}</p>
            </button>
          );
        })}
      </div>

      {/* Custom prompt */}
      {selectedTheme === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <Label className="text-white">Décris ton thème</Label>
          <Input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ex: Couchers de soleil sur l'océan avec des vagues"
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </motion.div>
      )}

      {/* Style selection */}
      <div className="space-y-2">
        <Label className="text-white">Style de montage</Label>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dynamic">Dynamique (effets intenses)</SelectItem>
            <SelectItem value="smooth">Smooth (transitions douces)</SelectItem>
            <SelectItem value="aggressive">Agressif (hard cuts)</SelectItem>
            <SelectItem value="cinematic">Cinématique (mood)</SelectItem>
            <SelectItem value="minimal">Minimal (épuré)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reference video URL */}
      <div className="space-y-2">
        <Label className="text-white">Vidéo de référence (TikTok / YouTube)</Label>
        <Input
          value={referenceUrl}
          onChange={(e) => setReferenceUrl(e.target.value)}
          placeholder="https://www.tiktok.com/..."
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
        <p className="text-xs text-gray-500">
          L'IA analysera le rythme, les transitions et la colorimétrie de cette vidéo.
        </p>
      </div>

      {/* Creative brief */}
      <div className="space-y-2">
        <Label className="text-white">Brief / Instructions supplémentaires</Label>
        <Input
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={'Ex: "Mettre l\'accent sur les témoignages"'}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/10 py-6 text-lg rounded-xl"
        >
          Retour
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl"
        >
          Générer l'edit
        </Button>
      </div>
    </motion.div>
  );
}