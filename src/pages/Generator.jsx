import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Music, Sparkles, Clock3 } from 'lucide-react';
import UploadStep from '../components/generator/UploadStep';
import ThemeStep from '../components/generator/ThemeStep';
import GeneratingStep from '../components/generator/GeneratingStep';
import StudioSummary from '../components/generator/StudioSummary';
import StudioTimelinePanel from '../components/generator/StudioTimelinePanel';
import { api } from '@/api/client';

const studioModules = [
  {
    id: 'sources',
    label: 'Sources audio',
    description: 'Musique principale + intros parlées',
    icon: Music
  },
  {
    id: 'brief',
    label: 'Brief créatif',
    description: 'Titre, univers, références',
    icon: Sparkles
  },
  {
    id: 'timeline',
    label: 'Timeline & durée',
    description: 'Segment audio, alignement beats',
    icon: Clock3
  }
];

export default function Generator() {
  const [mode, setMode] = useState('studio');
  const [activeModule, setActiveModule] = useState('sources');
  const [launching, setLaunching] = useState(false);
  const [musicData, setMusicData] = useState(null);
  const [introVideos, setIntroVideos] = useState([]);
  const [sourceVideo, setSourceVideo] = useState(null);
  const [audioPresets, setAudioPresets] = useState([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [jobInfo, setJobInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    themeChoice: '',
    style: 'dynamic',
    customPrompt: '',
    referenceUrl: '',
    brief: '',
    scenePlan: '',
    videoMode: 'upload',
    durationSeconds: 30,
    audioSelection: {
      start: 0,
      end: null,
      autoBeatAlign: true
    }
  });

  useEffect(() => {
    let mounted = true;
    setAudioLoading(true);
    api
      .getAudioLibrary()
      .then((data) => {
        if (!mounted) return;
        setAudioPresets(data?.presets || []);
      })
      .catch((error) => {
        console.error('Audio library fetch failed:', error);
      })
      .finally(() => {
        if (mounted) setAudioLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const moduleStatus = useMemo(
    () => ({
      sources: Boolean(musicData?.file_url),
      brief: Boolean(formData.title && formData.theme),
      timeline: Boolean(formData.durationSeconds)
    }),
    [musicData, formData.title, formData.theme, formData.durationSeconds]
  );

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'brief':
        return (
          <ThemeStep
            key="brief-panel"
            formData={formData}
            setFormData={setFormData}
            showActions={false}
          />
        );
      case 'timeline':
        return (
          <StudioTimelinePanel
            key="timeline-panel"
            musicData={musicData}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 'sources':
      default:
        return (
          <UploadStep
            key="sources-panel"
            musicData={musicData}
            setMusicData={setMusicData}
            introVideos={introVideos}
            setIntroVideos={setIntroVideos}
            sourceVideo={sourceVideo}
            setSourceVideo={setSourceVideo}
            audioPresets={audioPresets}
            audioLoading={audioLoading}
            formData={formData}
            setFormData={setFormData}
            showContinueButton={false}
          />
        );
    }
  };

  const handleGenerate = async () => {
    if (!musicData?.file_url) {
      alert('Merci de téléverser une musique avant de générer le montage.');
      setActiveModule('sources');
      return;
    }
    if (!formData.title || !formData.theme) {
      alert('Ajoute un titre et un thème pour ton montage.');
      setActiveModule('brief');
      return;
    }

    setLaunching(true);
    try {
      const payload = {
        title: formData.title,
        theme: formData.theme,
        style: formData.style,
        custom_prompt: formData.brief || formData.customPrompt,
        video_mode: formData.videoMode,
        scene_plan: formData.scenePlan,
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
        reference_video_url: formData.referenceUrl,
        source_video: sourceVideo
          ? {
              url: sourceVideo.public_url || sourceVideo.file_url,
              public_url: sourceVideo.public_url || sourceVideo.file_url,
              name: sourceVideo.name,
              mime_type: sourceVideo.mime_type,
              duration: sourceVideo.durationSeconds
            }
          : null
      };

      const response = await api.generateMontage(payload);
      setJobInfo(response);
      setMode('render');
    } catch (error) {
      console.error('Error creating montage:', error);
      alert('Erreur lors de la génération du montage');
    } finally {
      setLaunching(false);
    }
  };

  if (mode === 'render') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <GeneratingStep jobInfo={jobInfo} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="mb-10 lg:mb-12 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-200">
            Auralyptix Studio
          </p>
          <h1 className="text-4xl lg:text-5xl font-semibold text-white">
            Construis ton montage comme dans un studio miniature
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Organise tes sources, écris ton brief, verrouille la timeline puis
            lance la génération IA. Chaque module sauvegarde automatiquement
            tes réglages.
          </p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr_320px] gap-6 lg:gap-8">
          <aside className="space-y-4">
            {studioModules.map((module) => {
              const Icon = module.icon;
              const active = activeModule === module.id;
              const ready = moduleStatus[module.id];
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all duration-200 ${
                    active
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          active
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-white/10 text-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {module.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        ready ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {ready ? 'OK' : 'TODO'}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all ${
                        ready
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-white/20'
                      }`}
                      style={{ width: ready ? '100%' : active ? '60%' : '25%' }}
                    />
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl min-h-[520px]">
            <AnimatePresence mode="wait">{renderActiveModule()}</AnimatePresence>
          </div>

          <StudioSummary
            musicData={musicData}
            introVideos={introVideos}
            formData={formData}
            onLaunch={handleGenerate}
            launching={launching}
          />
        </div>
      </div>
    </div>
  );
}