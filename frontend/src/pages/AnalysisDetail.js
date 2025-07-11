import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Download, MessageSquare } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalysisDetail = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`/api/analysis/${id}`);
      setAnalysis(response.data.data.analysis);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      await axios.post(`/api/analysis/${id}/run`);
      toast.success('Analyse lancée avec succès');
      fetchAnalysis();
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

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Analyse non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">
          L'analyse que vous recherchez n'existe pas.
        </p>
        <div className="mt-6">
          <Link to="/analysis" className="btn-primary">
            Retour aux analyses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/analysis"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{analysis.title}</h1>
            <p className="text-sm text-gray-500">
              Créée le {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {analysis.status === 'PENDING' && (
            <button
              onClick={handleRunAnalysis}
              className="btn-success inline-flex items-center"
            >
              <Play className="mr-2 h-4 w-4" />
              Lancer l'analyse
            </button>
          )}
          <span className={`badge ${getStatusBadge(analysis.status)}`}>
            {getStatusText(analysis.status)}
          </span>
        </div>
      </div>

      {/* Description */}
      {analysis.description && (
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{analysis.description}</p>
          </div>
        </div>
      )}

      {/* Suppliers */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Fournisseurs ({analysis.suppliers?.length || 0})
          </h3>
        </div>
        <div className="card-body">
          {analysis.suppliers && analysis.suppliers.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qualité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Délai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysis.suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.quality}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.deliveryDelay} jours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.performance ? `${Math.round(supplier.performance)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {supplier.category && (
                          <span className={`badge ${getCategoryBadge(supplier.category)}`}>
                            {getCategoryText(supplier.category)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun fournisseur dans cette analyse</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {analysis.messages && analysis.messages.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Messages Générés ({analysis.messages.length})
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {analysis.messages.map((message) => {
                const content = JSON.parse(message.content);
                return (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {getMessageTypeText(message.type)}
                      </h4>
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">{content.subject}</p>
                      <p className="line-clamp-3">{content.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
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

const getCategoryBadge = (category) => {
  switch (category) {
    case 'EXCELLENT':
      return 'badge-success';
    case 'GOOD':
      return 'badge-info';
    case 'AVERAGE':
      return 'badge-warning';
    case 'POOR':
    case 'CRITICAL':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

const getCategoryText = (category) => {
  switch (category) {
    case 'EXCELLENT':
      return 'Excellent';
    case 'GOOD':
      return 'Bon';
    case 'AVERAGE':
      return 'Moyen';
    case 'POOR':
      return 'Mauvais';
    case 'CRITICAL':
      return 'Critique';
    default:
      return category;
  }
};

const getMessageTypeText = (type) => {
  switch (type) {
    case 'SUPPLIER':
      return 'Fournisseur';
    case 'BUYER':
      return 'Acheteur';
    case 'MANAGEMENT':
      return 'Direction';
    default:
      return type;
  }
};

export default AnalysisDetail; 