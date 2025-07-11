import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Trash2, Play, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Analysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnalyses();
  }, [filter]);

  const fetchAnalyses = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/analysis', { params });
      setAnalyses(response.data.data.analyses);
    } catch (error) {
      toast.error('Erreur lors du chargement des analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      return;
    }

    try {
      await axios.delete(`/api/analysis/${id}`);
      toast.success('Analyse supprimée avec succès');
      fetchAnalyses();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleRunAnalysis = async (id) => {
    try {
      await axios.post(`/api/analysis/${id}/run`);
      toast.success('Analyse lancée avec succès');
      fetchAnalyses();
    } catch (error) {
      toast.error('Erreur lors du lancement de l\'analyse');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analyses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos analyses de fournisseurs
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/analysis/new"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle analyse
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="PROCESSING">En cours</option>
          <option value="COMPLETED">Terminé</option>
          <option value="FAILED">Échoué</option>
        </select>
      </div>

      {/* Analyses List */}
      <div className="card">
        <div className="card-body">
          {analyses.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune analyse</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre première analyse.
              </p>
              <div className="mt-6">
                <Link
                  to="/analysis/new"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle analyse
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseurs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {analysis.title}
                        </div>
                        {analysis.description && (
                          <div className="text-sm text-gray-500">
                            {analysis.description.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getStatusBadge(analysis.status)}`}>
                          {getStatusText(analysis.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {analysis._count?.suppliers || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/analysis/${analysis.id}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Voir
                        </Link>
                        {analysis.status === 'PENDING' && (
                          <button
                            onClick={() => handleRunAnalysis(analysis.id)}
                            className="text-success-600 hover:text-success-900 inline-flex items-center"
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Lancer
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(analysis.id)}
                          className="text-danger-600 hover:text-danger-900 inline-flex items-center"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'badge-success';
    case 'PROCESSING':
      return 'badge-warning';
    case 'FAILED':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'Terminé';
    case 'PROCESSING':
      return 'En cours';
    case 'FAILED':
      return 'Échoué';
    case 'PENDING':
      return 'En attente';
    default:
      return status;
  }
};

export default Analysis; 