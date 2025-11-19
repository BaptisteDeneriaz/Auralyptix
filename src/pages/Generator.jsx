import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from "framer-motion";
import UploadStep from '../components/generator/UploadStep';
import ThemeStep from '../components/generator/ThemeStep';
import GeneratingStep from '../components/generator/GeneratingStep';
import { api } from '@/api/client';

export default function Generator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [musicData, setMusicData] = useState(null);
  const [introVideos, setIntroVideos] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    style: 'dynamic',
    customPrompt: '',
    referenceUrl: '',
    brief: '',
    durationSeconds: 30,
    audioSelection: {
      start: 0,
      end: null,
      autoBeatAlign: true
    }
  });

  const handleGenerate = async () => {
    if (!musicData?.file_url) {
      alert('Merci de téléverser une musique avant de générer.');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        theme: formData.theme,
        style: formData.style,
        custom_prompt: formData.brief || formData.customPrompt,
        duration_seconds: formData.durationSeconds,
        audio_segment: {
          start: formData.audioSelection.start,
          end: formData.audioSelection.end,
          auto_beat_align: formData.audioSelection.autoBeatAlign
        },
        music_url: musicData.file_url,
        music_name: musicData.name,
        music_public_url: musicData.public_url || musicData.file_url,
        intro_videos: introVideos.map((video) => ({
          url: video.public_url || video.file_url,
          name: video.name,
          mime_type: video.mime_type
        })),
        reference_video_url: formData.referenceUrl
      };

      const response = await api.generateEdit(payload);
      setJobInfo(response);

      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1200);
    } catch (error) {
      console.error('Error creating edit:', error);
      alert('Erreur lors de la génération de l\'edit');
      setStep(2);
    }
  };

  const handleThemeSubmit = () => {
    if (!musicData?.file_url) {
      alert('Ajoute une musique avant de générer');
      setStep(1);
      return;
    }
    setStep(3);
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === s
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-110'
                    : step > s
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all ${
                    step > s ? 'bg-green-600' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            {step === 1 && 'Étape 1 : Upload musique + intro'}
            {step === 2 && 'Étape 2 : Brief & style'}
            {step === 3 && 'Étape 3 : Génération IA'}
          </p>
        </div>

        {/* Step content */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <UploadStep
                key="upload"
                onNext={() => setStep(2)}
                musicData={musicData}
                setMusicData={setMusicData}
                introVideos={introVideos}
                setIntroVideos={setIntroVideos}
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {step === 2 && (
              <ThemeStep
                key="theme"
                onNext={handleThemeSubmit}
                onBack={() => setStep(1)}
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {step === 3 && (
              <GeneratingStep
                key="generating"
                onComplete={() => {}}
                jobInfo={jobInfo}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}