import React from 'react';
import { Sparkles, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-black border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Auralyptix</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Crée des montages professionnels en quelques secondes grâce à l'intelligence artificielle.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Tarifs
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('demo')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Démo
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('faq')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#help" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#tutorials" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Tutoriels
                </a>
              </li>
              <li>
                <a href="#status" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Statut
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#licenses" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Licences
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social links and copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm">
            © 2024 Auralyptix. Tous droits réservés.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
            >
              <Twitter className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
            >
              <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
            >
              <Youtube className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            </a>
            <a 
              href="mailto:contact@auralyptix.com" 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group"
            >
              <Mail className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}