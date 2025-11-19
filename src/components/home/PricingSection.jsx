import React from 'react';
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const plans = [
  {
    name: "Starter",
    icon: Sparkles,
    price: "Gratuit",
    period: "pour toujours",
    description: "Parfait pour découvrir Auralyptix",
    features: [
      "5 exports par mois",
      "Qualité HD (720p)",
      "Thèmes de base",
      "Effets standards",
      "Watermark Auralyptix"
    ],
    cta: "Commencer gratuitement",
    popular: false,
    gradient: "from-gray-700 to-gray-900"
  },
  {
    name: "Pro",
    icon: Zap,
    price: "19€",
    period: "par mois",
    description: "Pour les créateurs réguliers",
    features: [
      "50 exports par mois",
      "Qualité Full HD (1080p)",
      "Tous les thèmes",
      "Effets avancés (velocity, shake)",
      "Sans watermark",
      "Accès anticipé aux nouveautés"
    ],
    cta: "Devenir Pro",
    popular: true,
    gradient: "from-blue-600 to-purple-600"
  },
  {
    name: "Unlimited",
    icon: Crown,
    price: "49€",
    period: "par mois",
    description: "Pour les professionnels",
    features: [
      "Exports illimités",
      "Qualité 4K",
      "Thèmes personnalisés",
      "Tous les effets premium",
      "Priorité dans le rendu",
      "Support prioritaire",
      "API access"
    ],
    cta: "Passer Unlimited",
    popular: false,
    gradient: "from-purple-600 to-pink-600"
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 bg-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
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
            Des tarifs simples et transparents
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choisis le plan qui correspond à tes besoins
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Plus populaire
                    </div>
                  </div>
                )}

                <Card className={`relative h-full ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-gray-900 to-black border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10'
                } backdrop-blur-xl group hover:scale-105 transition-all duration-300`}>
                  {/* Glow effect */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg blur-xl"></div>
                  )}

                  <CardHeader className="relative text-center pt-8 pb-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${plan.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full text-white" />
                    </div>

                    <CardTitle className="text-2xl text-white mb-2">
                      {plan.name}
                    </CardTitle>

                    <CardDescription className="text-gray-400">
                      {plan.description}
                    </CardDescription>

                    {/* Price */}
                    <div className="mt-6">
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{plan.period}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="relative">
                    {/* Features list */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Link to={createPageUrl('Generator')}>
                      <Button 
                        className={`w-full py-6 text-base rounded-xl transition-all duration-300 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400">
            Tous les plans incluent les mises à jour gratuites • Annulation à tout moment
          </p>
        </motion.div>
      </div>
    </section>
  );
}