import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";
import { Plus, Play, Download, Trash2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VideoModal from '../components/dashboard/VideoModal';
import { api } from '@/api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);

  const { data: edits = [], isLoading, refetch } = useQuery({
    queryKey: ['edits'],
    queryFn: () => api.listEdits(),
    refetchInterval: 4000
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.listJobs(),
    refetchInterval: 4000
  });

  const activeJobs = jobs.filter((job) =>
    ['queued', 'processing'].includes(job.status)
  );

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet edit ?')) return;
    setDeletingId(id);
    try {
      await api.deleteEdit(id);
      await refetch();
    } catch (error) {
      console.error('Error deleting edit:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Mes Edits</h1>
            <p className="text-gray-400">Tous tes montages créés par l'IA</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('Generator'))}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-6 rounded-xl shadow-lg shadow-blue-500/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel edit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total d'edits</p>
                  <p className="text-3xl font-bold text-white">{edits.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Ce mois-ci</p>
                  <p className="text-3xl font-bold text-white">
                    {edits.filter(e => new Date(e.created_date).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Temps total</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round(edits.reduce((sum, e) => sum + (e.duration || 0), 0) / 60)}m
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeJobs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl text-white font-semibold mb-4">Jobs en cours</h2>
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span className="font-mono text-white/80">{job.id}</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 capitalize">
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {job.steps.map((step) => (
                      <span
                        key={step.name}
                        className={`px-2 py-1 rounded-full border ${
                          step.status === 'done'
                            ? 'border-green-500/30 text-green-300'
                            : step.status === 'running'
                            ? 'border-blue-500/40 text-blue-300'
                            : 'border-white/10 text-gray-400'
                        }`}
                      >
                        {step.name.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edits grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : edits.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center opacity-50">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun edit pour le moment</h3>
            <p className="text-gray-400 mb-6">Crée ton premier edit en quelques secondes</p>
            <Button
              onClick={() => navigate(createPageUrl('Generator'))}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer mon premier edit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {edits.map((edit, index) => (
              <motion.div
                key={edit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group bg-gradient-to-br from-gray-900/50 to-gray-950/50 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    {edit.thumbnail_url ? (
                      <img 
                        src={edit.thumbnail_url} 
                        alt={edit.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {edit.status === 'ready' ? (
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setSelectedEdit(edit)}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
                          >
                            <Play className="w-6 h-6 text-white ml-1" />
                          </button>
                          <a 
                            href={edit.video_url}
                            download={`${edit.title}.mp4`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </a>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-100 text-sm font-semibold">
                          Génération en cours...
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold mb-1 truncate">{edit.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{edit.theme}</span>
                      <span className="text-gray-500">{edit.duration ? `${edit.duration}s` : '--'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        Style : {edit.style}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          edit.status === 'ready'
                            ? 'bg-green-500/10 text-green-300'
                            : edit.status === 'failed'
                            ? 'bg-red-500/10 text-red-300'
                            : 'bg-yellow-500/10 text-yellow-300'
                        }`}
                      >
                        {edit.status || 'processing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className="text-xs text-gray-500">
                        {new Date(edit.created_date).toLocaleDateString('fr-FR')}
                      </span>
                      <button
                        onClick={() => handleDelete(edit.id)}
                        disabled={deletingId === edit.id}
                        className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedEdit && (
        <VideoModal
          edit={selectedEdit}
          isOpen={!!selectedEdit}
          onClose={() => setSelectedEdit(null)}
        />
      )}
    </div>
  );
}