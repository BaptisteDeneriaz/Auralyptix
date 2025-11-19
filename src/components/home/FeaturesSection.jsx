import React from 'react';
import { motion } from "framer-motion";
import { Sparkles, Music, Zap, Film, Download, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "Génération automatique",
    description: "L'IA crée ton montage complet en analysant ta musique et ton thème",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Music,
    title: "Analyse des beats",
    description: "Détection précise des beats pour synchroniser parfaitement les transitions",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Effets dynamiques",
    description: "Velocity, zoom, shake, chromatic, flash - tous les effets modernes",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Film,
    title: "Recherche de clips",
    description: "Récupération automatique de clips haute qualité selon ton thème",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Download,
    title: "Export optimisé",
    description: "Format parfait pour TikTok, Instagram Reels et YouTube Shorts",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: Palette,
    title: "Styles personnalisables",
    description: "Choisis parmi des dizaines de styles d'edit ou crée le tien",
    gradient: "from-pink-500 to-rose-500"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Tout ce dont tu as besoin
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Des fonctionnalités puissantes pour créer des edits dignes des meilleurs créateurs
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative h-full bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300`}></div>
                  
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}