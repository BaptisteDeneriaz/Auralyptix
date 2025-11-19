import React from 'react';
import { motion } from "framer-motion";
import { Upload, Sparkles, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload ta musique",
    description: "Télécharge la musique que tu veux utiliser pour ton edit. N'importe quel format audio.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Choisis un thème",
    description: "Sélectionne un thème (football, voitures, anime...) ou donne un prompt personnalisé à l'IA.",
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    icon: Download,
    title: "Télécharge ton edit",
    description: "L'IA génère ton montage en quelques secondes. Télécharge-le et partage-le directement !",
    color: "from-pink-500 to-orange-500"
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-20 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl"></div>
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
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Trois étapes simples pour créer des edits professionnels
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connector line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-px">
                    <div className={`h-full bg-gradient-to-r ${step.color} opacity-30`}></div>
                  </div>
                )}

                {/* Step card */}
                <div className="relative group">
                  {/* Number badge */}
                  <div className="absolute -top-6 -left-6 z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-8 pt-12 backdrop-blur-xl group-hover:border-white/20 transition-all duration-300 h-full">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Pas besoin de compétences en montage</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}