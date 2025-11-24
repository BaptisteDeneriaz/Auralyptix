import React, { useEffect, useState } from 'react';
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

export default function ThemeStep({
  onNext,
  onBack,
  formData,
  setFormData,
  showActions = false
}) {
  const [selectedTheme, setSelectedTheme] = useState(
    formData.themeChoice || formData.theme || ''
  );
  const [customPrompt, setCustomPrompt] = useState(formData.customPrompt || '');
  const [style, setStyle] = useState(formData.style || 'dynamic');
  const [title, setTitle] = useState(formData.title || '');
  const [referenceUrl, setReferenceUrl] = useState(formData.referenceUrl || '');
  const [brief, setBrief] = useState(formData.brief || '');

  useEffect(() => {
    setSelectedTheme(formData.themeChoice || formData.theme || '');
    setCustomPrompt(formData.customPrompt || '');
    setStyle(formData.style || 'dynamic');
    setTitle(formData.title || '');
    setReferenceUrl(formData.referenceUrl || '');
    setBrief(formData.brief || '');
  }, [formData.themeChoice, formData.theme, formData.customPrompt, formData.style, formData.title, formData.referenceUrl, formData.brief]);

  const handleNext = () => {
    if (!selectedTheme || !title) {
      alert('Veuillez choisir un thème et donner un titre');
      return;
    }
    if (selectedTheme === 'custom' && !customPrompt) {
      alert('Veuillez décrire votre thème personnalisé');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      theme:
        selectedTheme === 'custom' ? customPrompt : selectedTheme,
      customPrompt: selectedTheme === 'custom' ? customPrompt : '',
      themeChoice: selectedTheme,
      style,
      title,
      referenceUrl,
      brief
    }));
    onNext?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Compose le brief du montage</h2>
        <p className="text-gray-400">Décris l’univers, le style visuel et les instructions que l’IA devra suivre</p>
      </div>

      {/* Title input */}
      <div className="space-y-2">
        <Label className="text-white">Titre du montage</Label>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setFormData((prev) => ({ ...prev, title: e.target.value }));
          }}
          placeholder="Ex: Montage football 2024"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Theme selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => {
                setSelectedTheme(theme.id);
                setFormData((prev) => ({
                  ...prev,
                  themeChoice: theme.id,
                  theme: theme.id === 'custom' ? customPrompt : theme.id,
                  customPrompt: theme.id === 'custom' ? customPrompt : ''
                }));
              }}
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
            onChange={(e) => {
              setCustomPrompt(e.target.value);
              if (selectedTheme === 'custom') {
                setFormData((prev) => ({
                  ...prev,
                  customPrompt: e.target.value,
                  theme: e.target.value
                }));
              }
            }}
            placeholder="Ex: Couchers de soleil sur l'océan avec des vagues"
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </motion.div>
      )}

      {/* Style selection */}
      <div className="space-y-2">
        <Label className="text-white">Style de montage</Label>
        <Select
          value={style}
          onValueChange={(value) => {
            setStyle(value);
            setFormData((prev) => ({ ...prev, style: value }));
          }}
        >
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
          onChange={(e) => {
            setReferenceUrl(e.target.value);
            setFormData((prev) => ({ ...prev, referenceUrl: e.target.value }));
          }}
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
          onChange={(e) => {
            setBrief(e.target.value);
            setFormData((prev) => ({ ...prev, brief: e.target.value }));
          }}
          placeholder={'Ex: "Mettre l\'accent sur les témoignages"'}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {showActions && (
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
            Générer le montage
          </Button>
        </div>
      )}
    </motion.div>
  );
}