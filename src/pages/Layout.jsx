
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoIcon from '@/components/branding/LogoIcon';

export default function Layout({ children, currentPageName }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition opacity-200"></div>
                <div className="relative bg-black/50 border border-purple-500/30 rounded-2xl p-1.5">
                  <LogoIcon className="w-11 h-11 text-purple-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Auralyptix
                </span>
                <span className="text-xs uppercase tracking-widest text-purple-300/80">
                  Studio vidéo propulsé par l’IA
                </span>
              </div>
            </Link>

            {/* Navigation links - Centré */}
            <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                to={createPageUrl('Home')}
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'Home' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Accueil
              </Link>
              <Link 
                to={createPageUrl('Dashboard')}
                className={`text-sm font-medium transition-colors ${
                  currentPageName === 'Dashboard' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mes montages
              </Link>
              <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Tarifs
              </button>
            </div>

            {/* CTA Button */}
            <Link to={createPageUrl('Generator')}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Créer un montage
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
