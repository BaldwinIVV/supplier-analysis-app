import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, TrendingUp, AlertTriangle, Clock, Target, Users, Mail, BarChart3, Download, LogOut, User, Home, History, X, Calendar, Package, Euro, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SupplierAnalysisApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showKPIModal, setShowKPIModal] = useState(false);

  // URL de l'API backend déployée sur Render
  const API_URL = 'https://supplier-analysis-app.onrender.com';

  // Fonction d'authentification
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setCurrentView('dashboard');
        loadAnalysisHistory(data.token);
        return true;
      } else {
        setError(data.message || 'Erreur de connexion');
        return false;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion au serveur');
      return false;
    }
  };

  // Fonction d'inscription
  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setCurrentView('dashboard');
        return true;
      } else {
        setError(data.message || 'Erreur d\'inscription');
        return false;
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError('Erreur de connexion au serveur');
      return false;
    }
  };

  // Charger l'historique des analyses
  const loadAnalysisHistory = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/analyses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentView('login');
    setAnalysisResults(null);
    setAnalysisHistory([]);
  };

  // Données mockées pour les graphiques détaillés
  const getKPIDetails = (kpiType) => {
    switch (kpiType) {
      case 'delivery':
        return {
          title: 'Analyse des Livraisons',
          subtitle: 'Performances de ponctualité par mois',
          data: [
            { mois: 'Jan', ponctuel: 82, retard: 18 },
            { mois: 'Fév', ponctuel: 85, retard: 15 },
            { mois: 'Mar', ponctuel: 87, retard: 13 },
            { mois: 'Avr', ponctuel: 90, retard: 10 },
            { mois: 'Mai', ponctuel: 88, retard: 12 },
            { mois: 'Jun', ponctuel: 91, retard: 9 }
          ],
          insights: [
            '📈 Amélioration constante depuis janvier',
            '🎯 Objectif 95% presque atteint en juin',
            '⚠️ Attention aux pics de retard en mars'
          ]
        };
      case 'quality':
        return {
          title: 'Analyse Qualité',
          subtitle: 'Répartition des problèmes qualité',
          data: [
            { name: 'Conformité', value: 94, color: '#10B981' },
            { name: 'Défauts mineurs', value: 4, color: '#F59E0B' },
            { name: 'Défauts majeurs', value: 2, color: '#EF4444' }
          ],
          insights: [
            '✅ Excellent taux de conformité (94%)',
            '🔧 Défauts principalement mineurs',
            '📋 Processus qualité bien maîtrisé'
          ]
        };
      case 'orders':
        return {
          title: 'Volume des Commandes',
          subtitle: 'Évolution du nombre de commandes',
          data: [
            { mois: 'Jan', commandes: 18, statut: 'Stable' },
            { mois: 'Fév', commandes: 22, statut: 'Croissance' },
            { mois: 'Mar', commandes: 20, statut: 'Légère baisse' },
            { mois: 'Avr', commandes: 25, statut: 'Pic' },
            { mois: 'Mai', commandes: 21, statut: 'Normalisation' },
            { mois: 'Jun', commandes: 19, statut: 'Stable' }
          ],
          insights: [
            '📊 Moyenne de 21 commandes/mois',
            '📈 Pic d\'activité en avril',
            '🔄 Tendance stable globalement'
          ]
        };
      case 'costs':
        return {
          title: 'Analyse des Coûts',
          subtitle: 'Répartition des coûts par type de problème',
          data: [
            { type: 'Retards livraison', cout: 8420, pourcentage: 55 },
            { type: 'Défauts qualité', cout: 4200, pourcentage: 27 },
            { type: 'Non-conformités', cout: 2100, pourcentage: 14 },
            { type: 'Autres', cout: 700, pourcentage: 4 }
          ],
          insights: [
            '💰 Principal coût : retards de livraison',
            '🎯 Objectif : réduire de 20% d\'ici 3 mois',
            '📉 Tendance à la baisse depuis avril'
          ]
        };
      default:
        return null;
    }
  };

  // Fonction pour ouvrir la modale KPI
  const openKPIModal = (kpiType) => {
    setSelectedKPI(getKPIDetails(kpiType));
    setShowKPIModal(true);
  };

  // Fermer la modale
  const closeKPIModal = () => {
    setShowKPIModal(false);
    setSelectedKPI(null);
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResults(data);
        setCurrentView('results');
        loadAnalysisHistory(token);
      } else {
        setError(data.message || 'Erreur lors de l\'analyse');
      }
    } catch (error) {
      console.error('Erreur traitement:', error);
      setError('Erreur lors du traitement du fichier');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // États pour la connexion/inscription
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Interface de connexion
  const renderLoginView = () => {

    const onSubmitLogin = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setError(null);
      const success = await handleLogin(email, password);
      setIsLoggingIn(false);
    };

    const onSubmitRegister = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setError(null);

      if (registerData.password !== registerData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setIsLoggingIn(false);
        return;
      }

      const success = await handleRegister({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
      });
      setIsLoggingIn(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              SupplierFlow
            </h1>
            <p className="text-gray-600">
              Analyse intelligente des performances fournisseurs
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!isRegisterMode ? (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                onClick={onSubmitLogin}
                disabled={isLoggingIn}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
              >
                {isLoggingIn ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                onClick={onSubmitRegister}
                disabled={isLoggingIn}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
              >
                {isLoggingIn ? 'Création...' : 'Créer un compte'}
              </button>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isRegisterMode ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>

          {!isRegisterMode && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Compte de démonstration :</p>
              <p className="text-xs text-gray-500">Email : demo@test.com</p>
              <p className="text-xs text-gray-500">Mot de passe : Demo123!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modale KPI détaillée */}
      {showKPIModal && selectedKPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedKPI.title}</h2>
                <p className="text-gray-600">{selectedKPI.subtitle}</p>
              </div>
              <button
                onClick={closeKPIModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Graphiques selon le type de KPI */}
              {selectedKPI.title === 'Analyse des Livraisons' && (
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Graphique des livraisons par mois</p>
                      <p className="text-sm text-gray-500">87% de ponctualité moyenne</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedKPI.title === 'Analyse Qualité' && (
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Répartition qualité</p>
                      <div className="flex justify-center gap-4 mt-2 text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✅ 94% Conforme</span>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">❌ 6% Non-conforme</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedKPI.title === 'Volume des Commandes' && (
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Évolution des commandes</p>
                      <p className="text-sm text-gray-500">125 commandes au total</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedKPI.title === 'Analyse des Coûts' && (
                <div className="mb-6">
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Euro className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Répartition des coûts</p>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Retards livraison:</span>
                          <span className="font-semibold">8,420€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Défauts qualité:</span>
                          <span className="font-semibold">4,200€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Non-conformités:</span>
                          <span className="font-semibold">2,100€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Insights et Recommandations
                </h3>
                <div className="space-y-2">
                  {selectedKPI.insights.map((insight, index) => (
                    <p key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      {insight}
                    </p>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </button>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  Partager le rapport
                </button>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programmer un suivi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    );
  };

  // Navigation
  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">SupplierFlow</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="h-4 w-4 inline mr-1" />
              Accueil
            </button>
            
            <button
              onClick={() => setCurrentView('history')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentView === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="h-4 w-4 inline mr-1" />
              Historique
            </button>
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{user?.firstName || user?.email}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 inline mr-1" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard principal
  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Analyse des Performances Fournisseurs
        </h2>
        <p className="text-gray-600 text-lg">
          Uploadez votre fichier Excel pour une analyse automatique et des recommandations personnalisées
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Glissez votre fichier Excel ici
          </h3>
          <p className="text-gray-500 mb-4">
            Formats supportés : Excel (.xlsx, .xls) et CSV (.csv)
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            id="file-upload"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Choisir un fichier
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
          Template Excel recommandé
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Colonnes requises :</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Numéro commande</li>
              <li>• Date prévue</li>
              <li>• Date réelle</li>
              <li>• Statut qualité</li>
              <li>• Montant</li>
              <li>• Problèmes rencontrés</li>
            </ul>
          </div>
          <div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le template
            </button>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Analyse en cours...
              </h3>
              <p className="text-gray-600">
                Notre IA analyse vos données de performance fournisseur
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Historique des analyses
  const renderHistory = () => (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Historique des Analyses</h2>
      
      {analysisHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune analyse effectuée pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ponctualité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risque
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysisHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.supplier_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.total_orders}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.on_time_rate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quality_rate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.risk_level === 'FAIBLE' ? 'bg-green-100 text-green-800' :
                      item.risk_level === 'MODÉRÉ' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Résultats d'analyse
  const renderResults = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Analyse - {analysisResults.supplier_name}
          </h2>
          <p className="text-gray-600">
            {new Date(analysisResults.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Nouvelle analyse
        </button>
      </div>

      {/* KPIs Dashboard */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => openKPIModal('delivery')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Livraisons à temps</p>
              <p className="text-2xl font-bold text-orange-600">
                {analysisResults.on_time_rate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">📈 Cliquez pour détails</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => openKPIModal('quality')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score qualité</p>
              <p className="text-2xl font-bold text-blue-600">
                {analysisResults.quality_rate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">📊 Cliquez pour détails</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => openKPIModal('orders')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commandes totales</p>
              <p className="text-2xl font-bold text-green-600">
                {analysisResults.total_orders}
              </p>
              <p className="text-xs text-gray-500 mt-1">📦 Cliquez pour détails</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => openKPIModal('costs')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coût des problèmes</p>
              <p className="text-2xl font-bold text-red-600">
                {analysisResults.total_cost_issues}€
              </p>
              <p className="text-xs text-gray-500 mt-1">💰 Cliquez pour détails</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Generated Messages */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-blue-600" />
          Messages générés automatiquement
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Pour le fournisseur
            </h4>
            <textarea
              className="w-full h-40 text-sm border rounded p-2 resize-none"
              value={analysisResults.supplier_message}
              readOnly
            />
            <button 
              onClick={() => navigator.clipboard.writeText(analysisResults.supplier_message)}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Copier
            </button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              Pour l'acheteur
            </h4>
            <textarea
              className="w-full h-40 text-sm border rounded p-2 resize-none"
              value={analysisResults.buyer_message}
              readOnly
            />
            <button 
              onClick={() => navigator.clipboard.writeText(analysisResults.buyer_message)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Copier
            </button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
              Pour la direction
            </h4>
            <textarea
              className="w-full h-40 text-sm border rounded p-2 resize-none"
              value={analysisResults.management_message}
              readOnly
            />
            <button 
              onClick={() => navigator.clipboard.writeText(analysisResults.management_message)}
              className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
            >
              Copier
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier si le token est valide
      fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Token invalide');
      })
      .then(data => {
        setUser(data.user);
        setCurrentView('dashboard');
        loadAnalysisHistory(token);
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  // Interface principale
  if (!user) {
    return renderLoginView();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <div className="py-6">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'history' && renderHistory()}
        {currentView === 'results' && renderResults()}
      </div>
    </div>
  );
};

export default SupplierAnalysisApp;
