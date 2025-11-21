import React, { useMemo, useState } from 'react';
const randomId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9));
import { motion } from "framer-motion";
import { Upload, Music, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";

export default function UploadStep({
  onNext,
  musicData,
  setMusicData,
  introVideos,
  setIntroVideos,
  formData,
  setFormData
}) {
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const audioDuration = useMemo(() => {
    return musicData?.durationSeconds || null;
  }, [musicData]);

  const updateAudioSelection = (updates = {}) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        audioSelection: {
          ...prev.audioSelection,
          ...updates
        }
      };
      return next;
    });
  };

  const handleLocalAudioMetadata = (file) => {
    return new Promise((resolve) => {
      try {
        const objectUrl = URL.createObjectURL(file);
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.src = objectUrl;
        audio.onloadedmetadata = () => {
          const duration = audio.duration || 0;
          URL.revokeObjectURL(objectUrl);
          resolve(duration);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        };
      } catch (err) {
        console.error('Audio metadata error', err);
        resolve(null);
      }
    });
  };

  const handleMusicUpload = async (file) => {
    if (!file) return;
    
    // Accepter audio ET vidéo (on extraira l'audio de la vidéo)
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isAudio && !isVideo) {
      alert('Veuillez sélectionner un fichier audio ou vidéo');
      return;
    }

    setUploadingMusic(true);
    try {
      // Calculer la durée localement d'abord
      let duration = null;
      if (isAudio) {
        duration = await handleLocalAudioMetadata(file);
      } else if (isVideo) {
        // Pour les vidéos, essayer d'extraire la durée
        duration = await new Promise((resolve) => {
          try {
            const objectUrl = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = objectUrl;
            video.onloadedmetadata = () => {
              const dur = video.duration || 0;
              URL.revokeObjectURL(objectUrl);
              resolve(dur);
            };
            video.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(null);
            };
          } catch (err) {
            console.error('Video metadata error', err);
            resolve(null);
          }
        });
      }

      const uploaded = await api.uploadFile(file);
      
      // Utiliser la durée du serveur si disponible, sinon celle calculée localement
      const serverDuration = uploaded.duration_seconds;
      const roundedDuration = serverDuration 
        ? Math.round(serverDuration) 
        : (duration ? Math.round(duration) : null);
      
      setMusicData({
        file_url: uploaded.file_url,
        public_url: uploaded.public_url,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        mime_type: file.type,
        durationSeconds: roundedDuration
      });

      if (roundedDuration) {
        const safeEnd = Math.min(
          roundedDuration,
          formData.durationSeconds || roundedDuration
        );
        updateAudioSelection({
          start: 0,
          end: safeEnd,
          autoBeatAlign: true
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload du fichier: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setUploadingMusic(false);
    }
  };

  const handleIntroUpload = async (files) => {
    const fileArray = Array.from(files || []);
    if (!fileArray.length) return;
    if (introVideos.length + fileArray.length > 3) {
      alert('Maximum 3 vidéos d\'introduction');
      return;
    }

    setUploadingIntro(true);
    try {
      const uploads = [];
      for (const file of fileArray) {
        if (!file.type.startsWith('video/')) {
          alert(`${file.name} n'est pas une vidéo`);
          continue;
        }
        const uploaded = await api.uploadFile(file);
        uploads.push({
          id: randomId(),
          file_url: uploaded.file_url,
          public_url: uploaded.public_url,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          mime_type: file.type
        });
      }
      setIntroVideos([...introVideos, ...uploads]);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'upload des vidéos');
    } finally {
      setUploadingIntro(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMusicUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Upload ta musique</h2>
        <p className="text-gray-400">Commence par télécharger le fichier audio pour ton edit</p>
      </div>

      {!musicData ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
            dragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
        >
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => handleMusicUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadingMusic}
          />
          
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Upload className="w-10 h-10 text-white" />
            </div>
            
            <div>
              <p className="text-white font-semibold mb-1">
                {uploadingMusic ? 'Upload en cours...' : 'Clique ou glisse un fichier'}
              </p>
              <p className="text-gray-400 text-sm">Audio (MP3, WAV, M4A) ou Vidéo (MP4, MOV) jusqu'à 100MB</p>
              <p className="text-gray-500 text-xs mt-1">L'audio sera extrait automatiquement des vidéos</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <button
            onClick={() => setMusicData(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{musicData.name}</p>
              <p className="text-gray-400 text-sm">
                {musicData.size}
                {musicData.durationSeconds
                  ? ` • ${musicData.durationSeconds}s`
                  : ''}
              </p>
            </div>
          </div>

          {audioDuration ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Point de départ</span>
                  <span>{formData.audioSelection.start.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(
                    0,
                    (formData.audioSelection.end ?? audioDuration) - 1
                  )}
                  step="0.1"
                  value={formData.audioSelection.start}
                  onChange={(e) =>
                    updateAudioSelection({
                      start: Math.min(
                        parseFloat(e.target.value),
                        (formData.audioSelection.end ?? audioDuration) - 0.5
                      )
                    })
                  }
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Point de fin</span>
                  <span>
                    {(formData.audioSelection.end ?? audioDuration).toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min={formData.audioSelection.start + 0.5}
                  max={audioDuration}
                  step="0.1"
                  value={formData.audioSelection.end ?? audioDuration}
                  onChange={(e) =>
                    updateAudioSelection({
                      end: parseFloat(e.target.value)
                    })
                  }
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.audioSelection.autoBeatAlign}
                    onChange={(e) =>
                      updateAudioSelection({
                        autoBeatAlign: e.target.checked
                      })
                    }
                    className="rounded bg-transparent text-purple-500"
                  />
                  Alignement automatique sur les beats
                </label>
                <span className="text-xs text-gray-500">
                  Segment :{' '}
                  {(
                    (formData.audioSelection.end ?? audioDuration) -
                    formData.audioSelection.start
                  ).toFixed(1)}
                  s
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-gray-500">
              Durée inconnue — le découpage précis sera proposé après analyse.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Intro parlée (optionnel)</p>
            <p className="text-gray-400 text-sm">
              Ajoute 1 à 3 vidéos où quelqu'un parle pour introduire ton montage
            </p>
          </div>
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white">
            {uploadingIntro ? 'Upload...' : 'Ajouter'}
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(e) => handleIntroUpload(e.target.files)}
              disabled={uploadingIntro}
            />
          </label>
        </div>

        {introVideos.length > 0 ? (
          <div className="space-y-3">
            {introVideos.map((video) => (
              <div key={video.id} className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{video.name}</p>
                  <p className="text-gray-400 text-xs">{video.size}</p>
                </div>
                <button
                  onClick={() =>
                    setIntroVideos(introVideos.filter((item) => item.id !== video.id))
                  }
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-gray-400 text-sm">
            Aucune intro importée. L'IA déterminera si elle doit en générer une.
          </div>
        )}
      </div>

      <Button
        onClick={onNext}
        disabled={!musicData || uploadingMusic || uploadingIntro}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuer
      </Button>
    </motion.div>
  );
}