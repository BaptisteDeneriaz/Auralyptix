import React from 'react';
import { motion } from "framer-motion";
import { Play, Music, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DemoSection() {
  return (
    <section id="demo" className="relative py-32 bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Regarde l'IA en action
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            De la musique au montage final en quelques secondes
          </p>
        </motion.div>

        {/* Demo video container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-30"></div>
          
          {/* Video frame */}
          <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-white/10 rounded-3xl p-2 shadow-2xl">
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
              {/* Placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center space-y-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
                  >
                    <Play className="w-12 h-12 text-white ml-1" />
                  </motion.div>
                  <p className="text-xl text-gray-300">Vidéo de démonstration</p>
                  <p className="text-sm text-gray-500">Aperçu du processus de génération</p>
                </div>
              </div>

              {/* Process steps overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-blue-400" />
                    <span className="text-white">Musique</span>
                  </div>
                  <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="text-white">Analyse IA</span>
                  </div>
                  <div className="w-8 h-px bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-pink-400" />
                    <span className="text-white">Résultat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA below video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link to={createPageUrl('Generator')}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/50"
            >
              Essayer maintenant
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}