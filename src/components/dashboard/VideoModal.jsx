import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoModal({ montage, isOpen, onClose }) {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/montage/' + montage.id);
    alert('Lien copié !');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{montage.title}</h2>
                <p className="text-gray-400 text-sm">Thème: {montage.theme} • Style: {montage.style}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video player */}
            <div className="relative aspect-video bg-black">
              {montage.video_url ? (
                <img 
                  src={montage.video_url} 
                  alt={montage.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-400">Aperçu de la vidéo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10">
              <div className="flex flex-wrap gap-3">
                <a 
                  href={montage.video_url}
                  download={`${montage.title}.mp4`}
                  className="flex-1 min-w-[200px]"
                >
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </a>
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="flex-1 min-w-[200px] border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le lien
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Info */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Durée</p>
                  <p className="text-white font-semibold">{montage.duration}s</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Style</p>
                  <p className="text-white font-semibold capitalize">{montage.style}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Créé le</p>
                  <p className="text-white font-semibold">
                    {new Date(montage.created_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Statut</p>
                  <p className="text-green-400 font-semibold">Terminé</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}