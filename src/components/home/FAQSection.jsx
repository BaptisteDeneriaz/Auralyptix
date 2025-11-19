import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Comment fonctionne l'IA ?",
    answer: "Auralyptix analyse ta musique pour détecter les beats et les transitions. Ensuite, la plateforme recherche automatiquement des clips vidéo correspondant à ton thème et synchronise le tout avec des effets dynamiques (velocity, zoom, shake, etc.) pour créer un montage professionnel."
  },
  {
    question: "Puis-je utiliser mes propres clips vidéo ?",
    answer: "Actuellement, l'IA récupère automatiquement des clips haute qualité depuis Internet. La fonctionnalité d'upload de clips personnels sera disponible dans une prochaine mise à jour pour les abonnés Pro et Unlimited."
  },
  {
    question: "Est-ce vraiment gratuit ?",
    answer: "Oui ! Le plan Starter est 100% gratuit et te permet de créer jusqu'à 5 edits par mois en qualité HD. C'est parfait pour tester l'outil et voir si ça correspond à tes besoins avant de passer à un plan payant."
  },
  {
    question: "Quelles plateformes sont supportées ?",
    answer: "Auralyptix optimise automatiquement tes edits pour TikTok, Instagram Reels et YouTube Shorts. Le format vertical 9:16 est utilisé par défaut et la qualité d'export est adaptée aux exigences de chaque plateforme."
  },
  {
    question: "Combien de temps prend la génération d'un edit ?",
    answer: "En moyenne, l'IA génère ton edit en 10 à 30 secondes selon la longueur de ta musique et la complexité des effets demandés. Les abonnés Unlimited bénéficient d'une priorité de rendu pour un traitement encore plus rapide."
  },
  {
    question: "Puis-je modifier l'edit après génération ?",
    answer: "Pour le moment, l'IA génère un edit final optimisé. Si le résultat ne te convient pas, tu peux relancer la génération avec des paramètres différents. Un éditeur manuel est prévu dans les futures mises à jour."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-32 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-400">
            Tout ce que tu dois savoir sur Auralyptix
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-400 leading-relaxed pr-8">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">Tu as d'autres questions ?</p>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Contacte notre équipe →
          </button>
        </motion.div>
      </div>
    </section>
  );
}