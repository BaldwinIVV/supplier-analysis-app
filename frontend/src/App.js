import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, TrendingUp, AlertTriangle, Clock, Target, Users, Mail, BarChart3, Download, LogOut, User, Home, History, X, Calendar, Plus, Menu, ChevronRight, AlertCircle, FileText, Trash2, Eye, Brain } from 'lucide-react';

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

  // NOUVEAU: État pour la gestion des fichiers multiples
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // URL de l'API backend
  const API_URL = 'https://supplier-analysis-app.onrender.com';

  // NOUVEAU: Fonction pour lire le contenu d'un fichier
  const readFileContent = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  // NOUVEAU: Fonction d'analyse IA pour un fichier spécifique
  const analyzeFileWithAI = async (fileData) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const fileContent = await readFileContent(fileData.file);
      
      const prompt = `Analyze this supplier data and return JSON with this exact structure:
{
  "supplier_name": "string",
  "on_time_rate": number,
  "quality_rate": number,
  "total_orders": number,
  "total_cost_issues": number,
  "risk_level": "FAIBLE/MODÉRÉ/ÉLEVÉ",
  "supplier_message": "message for supplier",
  "buyer_message": "message for procurement team", 
  "management_message": "executive summary",
  "created_at": "2024-01-15"
}

File content: ${fileContent}

Return ONLY valid JSON.`;

      const response = await window.claude.complete(prompt);
      const aiResults = JSON.parse(response);
      
      // Mettre à jour le fichier comme analysé
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'analyzed', analysisResults: aiResults } : f
      ));

      // Mettre à jour les résultats principaux pour afficher immédiatement
      setAnalysisResults(aiResults);
      navigateTo('results');
      
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'error' } : f
      ));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // NOUVEAU: Analyser un fichier spécifique
  const analyzeSpecificFile = async (fileData) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileData.id ? { ...f, status: 'analyzing' } : f
    ));
    await analyzeFileWithAI(fileData);
  };

  // NOUVEAU: Supprimer un fichier
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // NOUVEAU: Formater la taille de fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Données pour les modales KPI avec graphiques réels
  const getKPIDetails = (kpiType) => {
    switch (kpiType) {
      case 'delivery':
        return {
          title: 'Delivery Performance Analysis',
          subtitle: 'Monthly punctuality trends and delivery metrics',
          data: [
            { month: 'Jan', onTime: 82, late: 18, target: 95 },
            { month: 'Feb', onTime: 85, late: 15, target: 95 },
            { month: 'Mar', onTime: 87, late: 13, target: 95 },
            { month: 'Apr', onTime: 90, late: 10, target: 95 },
            { month: 'May', onTime: 88, late: 12, target: 95 },
            { month: 'Jun', onTime: 91, late: 9, target: 95 }
          ],
          insights: [
            'Consistent improvement in delivery performance over the past 6 months',
            'Current performance of 91% is approaching the 95% target',
            'March showed slight decline, recommend process review for Q2'
          ]
        };
      case 'quality':
        return {
          title: 'Quality Assessment',
          subtitle: 'Product quality distribution and defect analysis',
          data: [
            { category: 'Compliant', value: 94, color: '#10b981' },
            { category: 'Minor Issues', value: 4, color: '#f59e0b' },
            { category: 'Major Defects', value: 2, color: '#ef4444' }
          ],
          insights: [
            'Quality rate of 94% exceeds industry benchmark of 90%',
            'Defects are primarily minor and non-critical',
            'Quality control processes are well-established and effective'
          ]
        };
      case 'orders':
        return {
          title: 'Order Volume Analysis',
          subtitle: 'Order quantity trends and capacity utilization',
          data: [
            { month: 'Jan', orders: 18, capacity: 25 },
            { month: 'Feb', orders: 22, capacity: 25 },
            { month: 'Mar', orders: 20, capacity: 25 },
            { month: 'Apr', orders: 25, capacity: 25 },
            { month: 'May', orders: 21, capacity: 25 },
            { month: 'Jun', orders: 19, capacity: 25 }
          ],
          insights: [
            'Average of 21 orders per month with stable demand pattern',
            'Peak activity occurred in April at full capacity',
            'Overall demand remains within supplier capacity limits'
          ]
        };
      case 'costs':
        return {
          title: 'Cost Impact Analysis',
          subtitle: 'Breakdown of problem-related costs by category',
          data: [
            { category: 'Late Deliveries', amount: 8420, percentage: 55 },
            { category: 'Quality Issues', amount: 4200, percentage: 27 },
            { category: 'Non-compliance', amount: 2100, percentage: 14 },
            { category: 'Other', amount: 700, percentage: 4 }
          ],
          insights: [
            'Late deliveries represent the highest cost impact at €8,420',
            'Target reduction of 20% achievable through delivery optimization',
            'Cost trend has been declining since April improvements'
          ]
        };
      default:
        return null;
    }
  };

  // Simple chart components
  const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.onTime || d.orders || 0, d.target || 0)));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-8 text-xs text-gray-600">{item.month}</div>
            <div className="flex-1 flex space-x-1">
              <div className="flex-1 bg-gray-100 rounded-sm h-6 relative overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-sm transition-all duration-500"
                  style={{ width: `${((item.onTime || item.orders) / maxValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                  {item.onTime || item.orders}
                </div>
              </div>
              {item.target && (
                <div className="w-12 text-xs text-gray-500 flex items-center">
                  Target: {item.target}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PieChart = ({ data }) => {
    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded" style={{backgroundColor: `${item.color}10`}}>
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded"
                style={{backgroundColor: item.color}}
              />
              <span className="text-sm font-medium">{item.category}</span>
            </div>
            <span className="text-sm font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  const CostChart = ({ data }) => {
    const maxAmount = Math.max(...data.map(d => d.amount));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.category}</span>
              <span className="font-semibold">€{item.amount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.amount / maxAmount) * 100}%` }}
              />
            </div>
            <div className="text-right text-xs text-gray-500">{item.percentage}%</div>
          </div>
        ))}
      </div>
    );
  };

  // Fonctions pour les modales avec animations
  const openKPIModal = (kpiType) => {
    setSelectedKPI(getKPIDetails(kpiType));
    setShowKPIModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeKPIModal = () => {
    setShowKPIModal(false);
    setSelectedKPI(null);
    document.body.style.overflow = 'unset';
  };

  // Navigation avec transitions
  const navigateTo = (view) => {
    setPageTransition(true);
    setTimeout(() => {
      setCurrentView(view);
      setPageTransition(false);
    }, 150);
  };

  // Fonctions d'authentification (simulées pour le développement)
  const handleLogin = async (email, password) => {
    // Simulation d'authentification pour le développement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Accepter n'importe quel email/password pour les tests
    if (email && password) {
      const mockUser = {
        id: 1,
        email: email,
        firstName: email.split('@')[0] || 'User',
        lastName: 'Demo',
        role: 'Admin'
      };
      
      setUser(mockUser);
      localStorage.setItem('token', 'demo-token-' + Date.now());
      setCurrentView('dashboard');
      setError(null);
      return true;
    } else {
      setError('Please enter email and password');
      return false;
    }
  };

  const handleRegister = async (userData) => {
    // Simulation d'inscription pour le développement  
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: 1,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'User'
    };
    
    setUser(mockUser);
    localStorage.setItem('token', 'demo-token-' + Date.now());
    setCurrentView('dashboard');
    setError(null);
    return true;
  };

  const loadAnalysisHistory = async (token) => {
    // Simulation de chargement d'historique
    console.log('Loading analysis history...');
    // Pour l'instant, on garde un historique vide
    // L'historique se remplira avec les analyses IA
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentView('login');
    setAnalysisResults(null);
    setAnalysisHistory([]);
    setUploadedFiles([]); // NOUVEAU: Reset des fichiers
  };

  // MODIFIÉ: Gestion des fichiers multiples
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      status: 'uploaded',
      analysisResults: null
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadProgress(0);
    setIsAnalyzing(false);
  };

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const mockEvent = { target: { files } };
      handleFileUpload(mockEvent);
    }
  };

  const onSubmitLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    try {
      await handleLogin(email, password);
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onSubmitRegister = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoggingIn(false);
      return;
    }
    
    try {
      await handleRegister({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
      });
    } catch (err) {
      setError('Registration failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Vérifier l'authentification au chargement (simplifié)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token.startsWith('demo-token-')) {
      // Reconnecter automatiquement l'utilisateur demo
      setUser({
        id: 1,
        email: 'demo@test.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'Admin'
      });
      setCurrentView('dashboard');
    }
  }, []);

  // Interface de connexion style original
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your SupplierFlow account
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-6">
              {!isRegisterMode ? (
                <form className="space-y-6" onSubmit={onSubmitLogin}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isLoggingIn ? 'Signing in...' : 'Sign in'}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={onSubmitRegister}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {isRegisterMode 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              {!isRegisterMode && (
                <div className="mt-6 rounded-md bg-gray-50 p-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Pour tester :</p>
                    <p>Email : n'importe quel email</p>
                    <p>Password : n'importe quel mot de passe</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block relative flex-1 bg-gray-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-32 w-32 text-gray-300 mb-8" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Supplier Performance Analytics
              </h3>
              <p className="text-gray-500 max-w-md">
                Transform your supplier data into actionable insights with AI-powered analysis and automated reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale style original
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-200 flex flex-col`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-gray-900" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-xl">SupplierFlow</span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => navigateTo('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${
              currentView === 'dashboard' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Home className="h-5 w-5" />
            {sidebarOpen && <span>Dashboard</span>}
            {sidebarOpen && currentView === 'dashboard' && <ChevronRight className="h-4 w-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => navigateTo('history')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${
              currentView === 'history' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <History className="h-5 w-5" />
            {sidebarOpen && <span>Analysis History</span>}
            {sidebarOpen && currentView === 'history' && <ChevronRight className="h-4 w-4 ml-auto" />}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              {analysisResults && (
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-auto transition-opacity duration-300 ${pageTransition ? 'opacity-0' : 'opacity-100'}`}>
          {currentView === 'dashboard' && (
            <div className="max-w-4xl mx-auto py-8 px-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-12 animate-in fade-in duration-700">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Supplier Performance Analysis
                </h1>
                <p className="text-xl text-gray-600">
                  Upload your Excel files for AI-powered insights and automated recommendations
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Zone d'upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div 
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="transform transition-all duration-300 hover:scale-110">
                    <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors duration-300 ${
                      isDragging ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload your supplier data
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Drag and drop your files here, or click to browse (multiple files supported)
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    Choose files
                  </label>
                </div>
              </div>

              {/* NOUVEAU: Liste des fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleString()}
                            </p>
                            {file.status === 'analyzed' && file.analysisResults && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Analysis complete - {file.analysisResults.supplier_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'uploaded' && (
                            <button
                              onClick={() => analyzeSpecificFile(file)}
                              disabled={isAnalyzing}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Brain className="h-3 w-3 mr-1" />
                              Analyze with AI
                            </button>
                          )}
                          {file.status === 'analyzing' && (
                            <div className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600">
                              <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Analyzing...
                            </div>
                          )}
                          {file.status === 'analyzed' && (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                ✓ Analyzed
                              </span>
                              <button
                                onClick={() => {
                                  setAnalysisResults(file.analysisResults);
                                  navigateTo('results');
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Results
                              </button>
                            </div>
                          )}
                          {file.status === 'error' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                              ✗ Error
                            </span>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Excel Template */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Excel Template
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Required columns:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {['Order number', 'Expected date', 'Actual date', 'Quality status', 'Amount', 'Issues encountered'].map((item, index) => (
                        <li key={index} className="flex items-center animate-in slide-in-from-left duration-300" style={{animationDelay: `${index * 100}ms`}}>
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md">
                      <Download className="h-4 w-4 mr-2" />
                      Download template
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading overlay pendant l'analyse */}
              {isAnalyzing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
                  <div className="bg-white rounded-lg p-8 max-w-md mx-4 transform animate-in zoom-in-95 duration-300">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        AI is analyzing your data...
                      </h3>
                      <p className="text-gray-600">
                        Processing supplier performance data with Claude AI
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'history' && (
            <div className="max-w-6xl mx-auto py-8 px-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Analysis History</h1>
              
              {analysisHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No analyses performed yet.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                          Risk Level
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

          {currentView === 'results' && analysisResults && (
            <div className="max-w-6xl mx-auto py-8 px-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 animate-in fade-in duration-700">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Analysis Results: {analysisResults.supplier_name}
                </h1>
                <p className="text-gray-600">
                  Generated on {new Date(analysisResults.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* KPIs Dashboard */}
              <div className="grid lg:grid-cols-4 gap-6 mb-8">
                {[
                  { key: 'delivery', value: analysisResults.on_time_rate, suffix: '%', label: 'On-time Delivery', icon: Clock, color: 'orange', delay: 0 },
                  { key: 'quality', value: analysisResults.quality_rate, suffix: '%', label: 'Quality Score', icon: Target, color: 'blue', delay: 100 },
                  { key: 'orders', value: analysisResults.total_orders, suffix: '', label: 'Total Orders', icon: BarChart3, color: 'green', delay: 200 },
                  { key: 'costs', value: `€${analysisResults.total_cost_issues}`, suffix: '', label: 'Cost Impact', icon: AlertTriangle, color: 'red', delay: 300 }
                ].map((kpi, index) => {
                  const Icon = kpi.icon;
                  return (
                    <div 
                      key={kpi.key}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105 animate-in slide-in-from-bottom-4"
                      style={{animationDelay: `${kpi.delay}ms`}}
                      onClick={() => openKPIModal(kpi.key)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                          <p className="text-3xl font-bold mt-2 text-gray-900">
                            {kpi.value}{kpi.suffix}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Click for details
                          </p>
                        </div>
                        <div className="transform transition-transform duration-300 hover:scale-110">
                          <Icon className="h-8 w-8 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Generated Messages */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Mail className="h-5 w-5 mr-3" />
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
        </main>
      </div>

      {/* KPI Detail Modal */}
      {showKPIModal && selectedKPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedKPI.title}</h2>
                <p className="text-gray-600 mt-1">{selectedKPI.subtitle}</p>
              </div>
              <button
                onClick={closeKPIModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  {selectedKPI.title === 'Delivery Performance Analysis' && (
                    <BarChart data={selectedKPI.data} />
                  )}
                  {selectedKPI.title === 'Quality Assessment' && (
                    <PieChart data={selectedKPI.data} />
                  )}
                  {selectedKPI.title === 'Order Volume Analysis' && (
                    <BarChart data={selectedKPI.data} />
                  )}
                  {selectedKPI.title === 'Cost Impact Analysis' && (
                    <CostChart data={selectedKPI.data} />
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Key Insights & Recommendations
                </h3>
                <div className="space-y-3">
                  {selectedKPI.insights.map((insight, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Mail className="h-4 w-4 mr-2" />
                  Share Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierAnalysisApp;
