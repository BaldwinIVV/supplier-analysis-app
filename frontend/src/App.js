import React, { useState, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, TrendingUp, AlertTriangle, Clock, Target, 
  Users, Mail, BarChart3, Download, LogOut, User, Home, History, 
  X, Calendar, Package, Euro, CheckCircle, XCircle, AlertCircle, 
  Plus, Menu, Search, ChevronRight, Brain, Zap, Bell, TrendingDown,
  Shield, Eye, MessageSquare, ArrowRight, Star, Lightbulb
} from 'lucide-react';

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
  const [aiInsights, setAiInsights] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

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

  // Génération des insights IA premium
  const generateAIInsights = (analysisData) => {
    return {
      predictions: {
        title: "AI Predictions - Next 3 Months",
        items: [
          {
            type: "risk",
            icon: AlertTriangle,
            color: "red",
            probability: 85,
            title: "Late Delivery Risk",
            description: "High probability of delays in Q4 due to seasonal patterns",
            impact: "High",
            timeframe: "Next 30 days"
          },
          {
            type: "cost",
            icon: Euro,
            color: "orange",
            probability: 73,
            title: "Cost Increase Forecast",
            description: "Expected €12,500 budget increase for quality issues",
            impact: "Medium",
            timeframe: "Next quarter"
          },
          {
            type: "performance",
            icon: TrendingDown,
            color: "yellow",
            probability: 67,
            title: "Performance Decline",
            description: "15% performance drop predicted based on historical trends",
            impact: "Medium",
            timeframe: "Next 60 days"
          }
        ]
      },
      recommendations: {
        title: "Smart Recommendations",
        items: [
          {
            priority: "urgent",
            icon: Zap,
            title: "Contact supplier within 48h",
            description: "Schedule performance review meeting to address quality concerns",
            effort: "Low",
            impact: "High",
            savings: "€8,400"
          },
          {
            priority: "high",
            icon: Shield,
            title: "Activate backup suppliers",
            description: "3 pre-qualified alternatives ready for immediate activation",
            effort: "Medium",
            impact: "High",
            savings: "Risk mitigation"
          },
          {
            priority: "medium",
            icon: TrendingUp,
            title: "Negotiate delivery terms",
            description: "Renegotiate SLA for 10% cost reduction on rush orders",
            effort: "Medium",
            impact: "Medium",
            savings: "€5,200/year"
          }
        ]
      },
      alerts: {
        title: "Proactive Alerts",
        items: [
          {
            level: "critical",
            icon: Bell,
            title: "Supply chain disruption detected",
            description: "Weather patterns affecting main supplier region",
            action: "Activate contingency plan",
            eta: "24 hours"
          },
          {
            level: "warning",
            icon: Eye,
            title: "Performance threshold breach",
            description: "On-time delivery dropped below 90% target",
            action: "Manager notification sent",
            eta: "Real-time"
          },
          {
            level: "info",
            icon: Lightbulb,
            title: "Optimization opportunity",
            description: "Bulk order timing could save 8% on costs",
            action: "Review purchasing calendar",
            eta: "This week"
          }
        ]
      },
      insights: {
        title: "Advanced Analytics",
        items: [
          {
            type: "seasonal",
            icon: Calendar,
            title: "Seasonal Pattern Detected",
            description: "December shows 40% increase in quality issues historically",
            insight: "Plan additional quality controls for Q4",
            confidence: 94
          },
          {
            type: "correlation",
            icon: Brain,
            title: "Hidden Correlation Found",
            description: "Delivery performance correlates with regional weather patterns",
            insight: "Weather-based delivery scheduling recommended",
            confidence: 87
          },
          {
            type: "benchmark",
            icon: Star,
            title: "Industry Benchmark",
            description: "Your supplier management ranks in top 15% of industry",
            insight: "Excellence in supplier diversity and risk management",
            confidence: 91
          }
        ]
      }
    };
  };

  // URL de l'API backend
  const API_URL = 'https://supplier-analysis-app.onrender.com';

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

  // Fonctions d'authentification
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        navigateTo('dashboard');
        loadAnalysisHistory(data.token);
        return true;
      } else {
        setError(data.message || 'Authentication failed');
        return false;
      }
    } catch (error) {
      setError('Connection error');
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        navigateTo('dashboard');
        return true;
      } else {
        setError(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError('Connection error');
      return false;
    }
  };

  const loadAnalysisHistory = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/analyses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
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

    // Animation de progression simulée
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      
      // Compléter la progression
      setUploadProgress(100);
      
      if (response.ok) {
        setTimeout(() => {
          setAnalysisResults(data);
          setAiInsights(generateAIInsights(data));
          navigateTo('results');
          loadAnalysisHistory(token);
        }, 500);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (error) {
      setError('File processing error');
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setUploadProgress(0);
        clearInterval(progressInterval);
      }, 1000);
    }
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
    await handleLogin(email, password);
    setIsLoggingIn(false);
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
    await handleRegister({
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      password: registerData.password,
    });
    setIsLoggingIn(false);
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Invalid token');
      })
      .then(data => {
        setUser(data.user);
        navigateTo('dashboard');
        loadAnalysisHistory(token);
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  // Interface de connexion style ChatGPT
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6 transform transition-all duration-300 hover:scale-110">
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
              <div className="mb-4 rounded-md bg-red-50 p-4 transition-all duration-300">
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
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
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
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
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
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
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
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
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
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
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
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
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
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="flex w-full justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                  >
                    {isLoggingIn ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {isRegisterMode 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              {!isRegisterMode && (
                <div className="mt-6 rounded-md bg-gray-50 p-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Demo account:</p>
                    <p>Email: demo@test.com</p>
                    <p>Password: Demo123!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block relative flex-1 bg-gray-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-32 w-32 text-gray-300 mb-8 transform transition-all duration-300 hover:scale-110" />
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

  // Interface principale style ChatGPT avec animations
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar avec animations */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110">
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

          {analysisResults && (
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 transform hover:scale-105 ${
                showAIPanel ? 'bg-purple-800 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Brain className="h-5 w-5" />
              {sidebarOpen && <span>AI Insights</span>}
              {sidebarOpen && <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">NEW</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110">
              <User className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content avec animations */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header animé */}
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
                <>
                  <button
                    onClick={() => setShowAIPanel(!showAIPanel)}
                    className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                      showAIPanel 
                        ? 'border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Insights
                    <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">NEW</span>
                  </button>
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Analysis
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area avec transitions */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${pageTransition ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          {currentView === 'dashboard' && (
            <div className="max-w-4xl mx-auto py-8 px-6">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Supplier Performance Analysis
                </h1>
                <p className="text-xl text-gray-600">
                  Upload your Excel file for AI-powered insights and automated recommendations
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4 animate-pulse">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

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
                    Drag and drop your file here, or click to browse
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
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                  >
                    Choose file
                  </label>
                </div>
              </div>

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
                        <li key={index} className="flex items-center">
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

              {isAnalyzing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 max-w-md mx-4 transform transition-all duration-300">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs font-medium text-gray-600">{Math.round(uploadProgress)}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Analyzing your data...
                      </h3>
                      <p className="text-gray-600">
                        Our AI is processing your supplier performance data
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'results' && analysisResults && (
            <div className="max-w-6xl mx-auto py-8 px-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Analysis Results: {analysisResults.supplier_name}
                </h1>
                <p className="text-gray-600">
                  Generated on {new Date(analysisResults.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* KPIs Dashboard avec animations */}
              <div className="grid lg:grid-cols-4 gap-6 mb-8">
                <div 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => openKPIModal('delivery')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">On-time Delivery</p>
                      <p className="text-3xl font-bold mt-2 text-orange-600">
                        {analysisResults.on_time_rate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Click for details</p>
                    </div>
                    <div className="transform transition-transform duration-300 hover:scale-110">
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => openKPIModal('quality')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Quality Score</p>
                      <p className="text-3xl font-bold mt-2 text-blue-600">
                        {analysisResults.quality_rate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Click for details</p>
                    </div>
                    <div className="transform transition-transform duration-300 hover:scale-110">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => openKPIModal('orders')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold mt-2 text-green-600">
                        {analysisResults.total_orders}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Click for details</p>
                    </div>
                    <div className="transform transition-transform duration-300 hover:scale-110">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => openKPIModal('costs')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cost Impact</p>
                      <p className="text-3xl font-bold mt-2 text-red-600">
                        €{analysisResults.total_cost_issues}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Click for details</p>
                    </div>
                    <div className="transform transition-transform duration-300 hover:scale-110">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel IA Premium */}
              {showAIPanel && aiInsights && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6 mb-8 transform transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Intelligence</h2>
                        <p className="text-purple-600">Advanced predictions and recommendations</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAIPanel(false)}
                      className="p-2 hover:bg-white rounded-full transition-all duration-200"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Prédictions IA */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-purple-600" />
                      {aiInsights.predictions.title}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {aiInsights.predictions.items.map((prediction, index) => (
                        <PredictionCard key={index} prediction={prediction} />
                      ))}
                    </div>
                  </div>

                  {/* Recommandations */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
                      {aiInsights.recommendations.title}
                    </h3>
                    <div className="space-y-4">
                      {aiInsights.recommendations.items.map((recommendation, index) => (
                        <RecommendationCard key={index} recommendation={recommendation} />
                      ))}
                    </div>
                  </div>

                  {/* Alertes Proactives */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-purple-600" />
                      {aiInsights.alerts.title}
                    </h3>
                    <div className="space-y-3">
                      {aiInsights.alerts.items.map((alert, index) => (
                        <AlertCard key={index} alert={alert} />
                      ))}
                    </div>
                  </div>

                  {/* Insights Avancés */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-purple-600" />
                      {aiInsights.insights.title}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {aiInsights.insights.items.map((insight, index) => (
                        <InsightCard key={index} insight={insight} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Generated Messages avec animations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Mail className="h-5 w-5 mr-3" />
                  AI-Generated Communications
                </h2>
                
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4 transform transition-all duration-300 hover:shadow-md hover:scale-105">
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
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 transform transition-all duration-300 hover:shadow-md hover:scale-105">
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
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 transform transition-all duration-300 hover:shadow-md hover:scale-105">
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
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
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
                      {analysisHistory.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
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

      {/* KPI Detail Modal avec animations */}
      {showKPIModal && selectedKPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedKPI.title}</h2>
                <p className="text-gray-600 mt-1">{selectedKPI.subtitle}</p>
              </div>
              <button
                onClick={closeKPIModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Chart Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
                <div className="bg-gray-50 rounded-lg p-6 transform transition-all duration-300 hover:shadow-inner">
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

              {/* Insights Section */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-md">
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                  <Mail className="h-4 w-4 mr-2" />
                  Share Report
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
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
