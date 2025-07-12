import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, TrendingUp, AlertTriangle, Clock, Target, Users, Mail, BarChart3, Download, LogOut, User, Home, History, X, Calendar, Package, Euro, CheckCircle, XCircle, AlertCircle, Plus, Menu, Search, ChevronRight, Brain, Zap, Shield, Eye, Lightbulb, Star, Bell, TrendingDown, Activity, ArrowRight, DollarSign, MessageSquare, Bot, Sparkles } from 'lucide-react';

const SupplierAnalysisApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);

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

  // États pour les fonctionnalités IA
  const [aiPredictions, setAiPredictions] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [advancedInsights, setAdvancedInsights] = useState(null);
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);

  // URL de l'API backend
  const API_URL = 'https://supplier-analysis-app.onrender.com';

  // Génération des données IA simulées
  const generateAIFeatures = (supplierData) => {
    const predictions = {
      riskForecast: {
        nextMonthDelay: 85,
        confidence: 92,
        factors: ['Seasonal demand increase', 'Past performance trend', 'Weather conditions']
      },
      costPrediction: {
        estimatedIssues: 12500,
        breakdown: {
          delays: 7500,
          quality: 3000,
          compliance: 2000
        },
        trend: 'increasing'
      },
      performanceTrend: {
        direction: 'declining',
        percentage: -15,
        period: '3 months',
        recommendation: 'Immediate intervention required'
      }
    };

    const alerts = [
      {
        id: 1,
        type: 'critical',
        title: 'Risque de rupture détecté',
        message: 'Le fournisseur XYZ montre des signes de défaillance imminente',
        timestamp: new Date(),
        urgent: true
      },
      {
        id: 2,
        type: 'warning',
        title: 'Performance sous la normale',
        message: 'Taux de livraison à temps en baisse de 12% ce mois',
        timestamp: new Date(Date.now() - 3600000),
        urgent: false
      },
      {
        id: 3,
        type: 'info',
        title: 'Manager notifié automatiquement',
        message: 'Escalade automatique activée pour le fournisseur ABC',
        timestamp: new Date(Date.now() - 7200000),
        urgent: false
      }
    ];

    const recs = [
      {
        id: 1,
        priority: 'high',
        action: 'Contactez le fournisseur sous 48h',
        impact: 'Éviter rupture de stock',
        effort: 'low',
        savings: 8500
      },
      {
        id: 2,
        priority: 'medium',
        action: 'Négociez -10% sur les coûts de livraison',
        impact: 'Réduction des coûts',
        effort: 'medium',
        savings: 15000
      },
      {
        id: 3,
        priority: 'medium',
        action: '3 fournisseurs de backup recommandés',
        impact: 'Diversification des risques',
        effort: 'high',
        savings: 25000
      }
    ];

    const insights = {
      seasonal: {
        pattern: 'Pic de problèmes en décembre chaque année',
        impact: 'Augmentation de 40% des retards',
        suggestion: 'Anticiper avec commandes avancées'
      },
      correlations: {
        discovered: 'Qualité liée à la météo',
        confidence: 87,
        detail: 'Performance diminue de 23% lors de fortes pluies'
      },
      benchmarking: {
        position: 'Top 15% du secteur',
        score: 847,
        improvement: 'Potentiel +5% avec optimisations'
      }
    };

    setAiPredictions(predictions);
    setSmartAlerts(alerts);
    setRecommendations(recs);
    setAdvancedInsights(insights);
  };

  // Fonctions existantes simplifiées
  const handleLogin = async (email, password) => {
    // Simulation pour la démo
    setUser({ email, firstName: 'Demo User' });
    setCurrentView('dashboard');
    return true;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setAnalysisResults(null);
    setAnalysisHistory([]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    // Simulation d'analyse
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    setTimeout(() => {
      const mockResults = {
        supplier_name: 'TechCorp Industries',
        on_time_rate: 87,
        quality_rate: 94,
        total_orders: 142,
        total_cost_issues: '15,240',
        created_at: new Date().toISOString(),
        supplier_message: 'Cher partenaire, nos analyses montrent des opportunités d\'amélioration...',
        buyer_message: 'Équipe procurement, voici les recommandations prioritaires...',
        management_message: 'Résumé exécutif : Performance globale satisfaisante avec axes d\'amélioration...'
      };

      setUploadProgress(100);
      setTimeout(() => {
        setAnalysisResults(mockResults);
        generateAIFeatures(mockResults);
        setCurrentView('results');
        setIsAnalyzing(false);
        setUploadProgress(0);
      }, 500);
    }, 3000);
  };

  const navigateTo = (view) => {
    setPageTransition(true);
    setTimeout(() => {
      setCurrentView(view);
      setPageTransition(false);
    }, 150);
  };

  // Interface de connexion style ChatGPT
  if (!user) {
    return (
      <div className="flex h-screen bg-white">
        {/* Section gauche - Formulaire */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your SupplierFlow AI account
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-6">
              {!isRegisterMode ? (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="flex w-full justify-center rounded-lg bg-green-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center text-gray-500">
                  Registration form would go here
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {isRegisterMode 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              {!isRegisterMode && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2 text-gray-900">Demo account:</p>
                    <p>Email: demo@supplierflow.ai</p>
                    <p>Password: Demo123!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Section droite - Illustration */}
        <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-6">
                  <Brain className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered Supplier Intelligence
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Transform your supplier data into predictive insights with advanced AI analytics and automated decision support.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-700">
                  <Sparkles className="h-4 w-4 text-green-600 mr-2" />
                  Predictive Analytics
                </div>
                <div className="flex items-center text-gray-700">
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  Risk Detection
                </div>
                <div className="flex items-center text-gray-700">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mr-2" />
                  Smart Recommendations
                </div>
                <div className="flex items-center text-gray-700">
                  <Bell className="h-4 w-4 text-red-600 mr-2" />
                  Proactive Alerts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale style ChatGPT
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar style ChatGPT */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 transition-all duration-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-xl text-white">SupplierFlow AI</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => navigateTo('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
              currentView === 'dashboard' 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Home className="h-5 w-5" />
            {sidebarOpen && <span>New Analysis</span>}
          </button>

          <button
            onClick={() => navigateTo('history')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
              currentView === 'history' 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <History className="h-5 w-5" />
            {sidebarOpen && <span>History</span>}
          </button>

          {/* Fonctionnalités IA */}
          {analysisResults && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {sidebarOpen ? 'AI Features' : '---'}
              </div>
              
              <button
                onClick={() => setShowPredictionsModal(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Brain className="h-5 w-5" />
                {sidebarOpen && <span>Predictions</span>}
                {sidebarOpen && <Star className="h-3 w-3 ml-auto text-yellow-500" />}
              </button>

              <button
                onClick={() => setShowAlertsPanel(!showAlertsPanel)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {sidebarOpen && <span>Smart Alerts</span>}
                {smartAlerts.filter(a => a.urgent).length > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                )}
              </button>

              <button
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Lightbulb className="h-5 w-5" />
                {sidebarOpen && <span>Recommendations</span>}
                {sidebarOpen && <Star className="h-3 w-3 ml-auto text-yellow-500" />}
              </button>

              <button
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Eye className="h-5 w-5" />
                {sidebarOpen && <span>Advanced Insights</span>}
                {sidebarOpen && <Star className="h-3 w-3 ml-auto text-yellow-500" />}
              </button>
            </>
          )}
        </nav>

        {/* Alertes dans la sidebar */}
        {showAlertsPanel && sidebarOpen && (
          <div className="px-3 pb-4 border-t border-gray-700 pt-4">
            <div className="space-y-2">
              {smartAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`p-2 rounded text-xs ${
                  alert.type === 'critical' ? 'bg-red-900 text-red-100' :
                  alert.type === 'warning' ? 'bg-yellow-900 text-yellow-100' :
                  'bg-blue-900 text-blue-100'
                }`}>
                  <div className="font-medium">{alert.title}</div>
                  <div className="opacity-75">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profil utilisateur */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-300" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.firstName || user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header style ChatGPT */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              {smartAlerts.filter(a => a.urgent).length > 0 && (
                <div className="flex items-center px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                  <Bell className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-700 font-medium">
                    {smartAlerts.filter(a => a.urgent).length} urgent alerts
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {currentView === 'dashboard' && (
            <div className="max-w-3xl mx-auto py-8 px-6">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  AI Supplier Analysis
                </h1>
                <p className="text-xl text-gray-600">
                  Upload your supplier data for intelligent insights and predictions
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Zone d'upload style ChatGPT */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 shadow-sm">
                <div 
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                    isDragging 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileUpload({ target: { files } });
                    }
                  }}
                >
                  <Upload className={`mx-auto h-12 w-12 mb-4 ${
                    isDragging ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload supplier data
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Drag and drop your Excel file here, or click to browse
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
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 cursor-pointer transition-all duration-200"
                  >
                    Choose file
                  </label>
                </div>
              </div>

              {/* Fonctionnalités IA preview */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Brain, title: 'Predictive Analytics', desc: 'Future risk predictions', color: 'blue' },
                  { icon: Lightbulb, title: 'Smart Recommendations', desc: 'AI-driven action items', color: 'yellow' },
                  { icon: Bell, title: 'Proactive Alerts', desc: 'Real-time monitoring', color: 'red' },
                  { icon: Eye, title: 'Advanced Insights', desc: 'Hidden patterns discovery', color: 'purple' }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                    <feature.icon className={`mx-auto h-8 w-8 mb-3 text-${feature.color}-600`} />
                    <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Modal d'analyse */}
              {isAnalyzing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
                    <div className="relative mb-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs font-medium text-gray-600">{Math.round(uploadProgress)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      AI is analyzing your data...
                    </h3>
                    <p className="text-gray-600">
                      Generating predictions and insights
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'results' && analysisResults && (
            <div className="max-w-6xl mx-auto py-8 px-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  AI Analysis: {analysisResults.supplier_name}
                </h1>
                <p className="text-gray-600">
                  Complete analysis with predictive insights
                </p>
              </div>

              {/* KPIs principaux */}
              <div className="grid lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'On-time Delivery', value: `${analysisResults.on_time_rate}%`, icon: Clock, color: 'blue' },
                  { label: 'Quality Score', value: `${analysisResults.quality_rate}%`, icon: Target, color: 'green' },
                  { label: 'Total Orders', value: analysisResults.total_orders, icon: Package, color: 'purple' },
                  { label: 'Cost Impact', value: `€${analysisResults.total_cost_issues}`, icon: DollarSign, color: 'red' }
                ].map((kpi, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                        <p className={`text-3xl font-bold mt-2 text-${kpi.color}-600`}>
                          {kpi.value}
                        </p>
                      </div>
                      <kpi.icon className={`h-8 w-8 text-${kpi.color}-600`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Fonctionnalités IA - Section principale */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* 1. Prédictions Intelligentes */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Brain className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900">Prédictions Intelligentes</h2>
                    <div className="flex ml-auto">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  
                  {aiPredictions && (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-semibold text-red-900">Risques futurs</span>
                        </div>
                        <p className="text-red-800">
                          "Ce fournisseur aura <span className="font-bold">{aiPredictions.riskForecast.nextMonthDelay}% de chance de retard</span> le mois prochain"
                        </p>
                        <p className="text-xs text-red-600 mt-1">Confiance: {aiPredictions.riskForecast.confidence}%</p>
                      </div>

                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <DollarSign className="h-5 w-5 text-orange-600 mr-2" />
                          <span className="font-semibold text-orange-900">Coûts prévisionnels</span>
                        </div>
                        <p className="text-orange-800">
                          "Budget prévu pour les problèmes : <span className="font-bold">€{aiPredictions.costPrediction.estimatedIssues.toLocaleString()}</span>"
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <TrendingDown className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="font-semibold text-yellow-900">Tendances</span>
                        </div>
                        <p className="text-yellow-800">
                          "Performance en déclin de <span className="font-bold">{aiPredictions.performanceTrend.percentage}%</span> sur {aiPredictions.performanceTrend.period}"
                        </p>
                      </div>

                      <button 
                        onClick={() => setShowPredictionsModal(true)}
                        className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails complets
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Recommandations Actionnables */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Lightbulb className="h-6 w-6 text-yellow-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900">Recommandations Actionnables</h2>
                    <div className="flex ml-auto">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className={`p-4 rounded-lg border ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`font-semibold ${
                            rec.priority === 'high' ? 'text-red-900' :
                            rec.priority === 'medium' ? 'text-yellow-900' :
                            'text-green-900'
                          }`}>
                            {rec.priority === 'high' ? 'Actions prioritaires' :
                             rec.priority === 'medium' ? 'Optimisations' : 'Alternatives'}
                          </span>
                          <span className="text-xs bg-white px-2 py-1 rounded">
                            €{rec.savings.toLocaleString()} économies
                          </span>
                        </div>
                        <p className={`${
                          rec.priority === 'high' ? 'text-red-800' :
                          rec.priority === 'medium' ? 'text-yellow-800' :
                          'text-green-800'
                        }`}>
                          "{rec.action}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Alertes et Insights */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Alertes Proactives */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Bell className="h-6 w-6 text-red-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900">Alertes Proactives</h2>
                    <div className="flex ml-auto">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {smartAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          {alert.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />}
                          {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />}
                          {alert.type === 'info' && <Bell className="h-5 w-5 text-blue-600 mr-2" />}
                          <span className={`font-semibold ${
                            alert.type === 'critical' ? 'text-red-900' :
                            alert.type === 'warning' ? 'text-yellow-900' :
                            'text-blue-900'
                          }`}>
                            {alert.title}
                          </span>
                          {alert.urgent && (
                            <span className="ml-auto bg-red-600 text-white text-xs px-2 py-1 rounded">URGENT</span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          alert.type === 'critical' ? 'text-red-800' :
                          alert.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          "{alert.message}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights Avancés */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Eye className="h-6 w-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900">Insights Avancés</h2>
                    <div className="flex ml-auto">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  
                  {advancedInsights && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-semibold text-purple-900">Analyse saisonnière</span>
                        </div>
                        <p className="text-purple-800">
                          "{advancedInsights.seasonal.pattern}"
                        </p>
                        <p className="text-xs text-purple-600 mt-1">{advancedInsights.seasonal.suggestion}</p>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Activity className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-semibold text-green-900">Corrélations cachées</span>
                        </div>
                        <p className="text-green-800">
                          "{advancedInsights.correlations.discovered}"
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Confiance: {advancedInsights.correlations.confidence}%
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Target className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-semibold text-blue-900">Benchmarking</span>
                        </div>
                        <p className="text-blue-800">
                          "Vous êtes dans le <span className="font-bold">{advancedInsights.benchmarking.position}</span> du secteur"
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{advancedInsights.benchmarking.improvement}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages IA générés */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-3" />
                  AI-Generated Communications
                </h2>
                
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      For Supplier
                    </h3>
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {analysisResults.supplier_message}
                      </pre>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResults.supplier_message)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-600" />
                      For Procurement Team
                    </h3>
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {analysisResults.buyer_message}
                      </pre>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResults.buyer_message)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                      Executive Summary
                    </h3>
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {analysisResults.management_message}
                      </pre>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(analysisResults.management_message)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'history' && (
            <div className="max-w-6xl mx-auto py-8 px-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Analysis History</h1>
              
              {analysisHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No analyses performed yet.</p>
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start your first analysis
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          On-time Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quality
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AI Risk Level
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
          )}
        </main>
      </div>

      {/* Modal des prédictions détaillées */}
      {showPredictionsModal && aiPredictions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Brain className="h-6 w-6 mr-3 text-blue-600" />
                  Prédictions Intelligentes Détaillées
                </h2>
                <p className="text-gray-600 mt-1">Analyse prédictive avancée par IA</p>
              </div>
              <button
                onClick={() => setShowPredictionsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Prédiction des risques */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Analyse des Risques Futurs
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-red-700 mb-2">
                      {aiPredictions.riskForecast.nextMonthDelay}%
                    </div>
                    <p className="text-red-800">Probabilité de retard le mois prochain</p>
                    <div className="mt-4">
                      <div className="w-full bg-red-200 rounded-full h-3">
                        <div 
                          className="bg-red-600 h-3 rounded-full"
                          style={{ width: `${aiPredictions.riskForecast.nextMonthDelay}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Facteurs de risque identifiés :</h4>
                    <ul className="space-y-1">
                      {aiPredictions.riskForecast.factors.map((factor, index) => (
                        <li key={index} className="flex items-center text-red-800">
                          <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prédiction des coûts */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Prévision des Coûts d'Impact
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-orange-700 mb-2">
                      €{aiPredictions.costPrediction.estimatedIssues.toLocaleString()}
                    </div>
                    <p className="text-orange-800">Budget estimé pour les problèmes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-3">Répartition prévisionnelle :</h4>
                    <div className="space-y-2">
                      {Object.entries(aiPredictions.costPrediction.breakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-orange-800 capitalize">{key}</span>
                          <span className="font-semibold text-orange-900">€{value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tendance performance */}
              <div className="bg-gradient-to-r from-yellow-50 to-red-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Évolution de la Performance
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-yellow-700 mb-2">
                      {aiPredictions.performanceTrend.percentage}%
                    </div>
                    <p className="text-yellow-800">Déclin sur {aiPredictions.performanceTrend.period}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-yellow-200 border border-yellow-400 rounded-lg p-4">
                      <p className="text-yellow-900 font-medium">
                        ⚠️ {aiPredictions.performanceTrend.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions recommandées */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Actions Recommandées par l'IA
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button className="p-4 bg-white border border-blue-200 rounded-lg text-left hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-blue-900">Action Immédiate</div>
                    <div className="text-blue-700 text-sm">Contacter le fournisseur dans les 24h</div>
                  </button>
                  <button className="p-4 bg-white border border-blue-200 rounded-lg text-left hover:bg-blue-50 transition-colors">
                    <div className="font-semibold text-blue-900">Planification</div>
                    <div className="text-blue-700 text-sm">Réviser les contrats avant fin de mois</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierAnalysisApp;
