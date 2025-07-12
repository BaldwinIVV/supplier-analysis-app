import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload, FileSpreadsheet, Clock, Target, BarChart3, AlertTriangle, ChevronRight,
  Brain, Star, Lightbulb, Bell, Eye, Menu, User, Home, History, Plus
} from 'lucide-react';

// Nouveau composant de détail KPI avec onglets
const KPIDetailView = ({ kpiType, details, aiData, onBack }) => {
  const [activeTab, setActiveTab] = useState('graphique');

  const renderGraphique = () => {
    // Choix du graphique selon kpiType
    if (kpiType === 'livraison') {
      return <BarChart data={details.data} />;
    }
    if (kpiType === 'qualite') {
      return <PieChart data={details.data} />;
    }
    if (kpiType === 'commandes') {
      return <BarChart data={details.data.map(d => ({ month: d.month, orders: d.orders }))} />;
    }
    if (kpiType === 'couts') {
      return <CostChart data={details.data} />;
    }
    return null;
  };

  const renderPrevisions = () => {
    // Exemples de prévisions IA adaptées
    if (kpiType === 'livraison') {
      return (
        <div>
          <p>Probabilité de retard le mois prochain : <strong>{aiData.riskForecast.nextMonthDelay}%</strong></p>
          <p>Confiance : {aiData.riskForecast.confidence}%</p>
        </div>
      );
    }
    if (kpiType === 'couts') {
      return (
        <div>
          <p>Coûts prévus : <strong>€{aiData.costPrediction.estimatedIssues.toLocaleString()}</strong></p>
          <p>Tendance : {aiData.costPrediction.trend}</p>
        </div>
      );
    }
    return <p>Aucune prévision disponible.</p>;
  };

  const renderAnalyse = () => (
    <div>
      {details.insights.map((ins, i) => (
        <p key={i}>• {ins}</p>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 flex items-center text-blue-600 hover:underline">
        ← Retour
      </button>
      <h2 className="text-2xl font-bold mb-4">Détails : {details.title}</h2>
      <div className="border-b mb-6">
        {['graphique', 'prévisions', 'analyse'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px ${activeTab === tab ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
          >
            {tab === 'graphique' ? 'Graphique'
              : tab === 'prévisions' ? 'Prévisions futures'
              : 'Analyse des périodes'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'graphique' && renderGraphique()}
        {activeTab === 'prévisions' && renderPrevisions()}
        {activeTab === 'analyse' && renderAnalyse()}
      </div>
    </div>
  );
};

// Composants graphiques simplifiés
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.onTime || d.orders || 0));
  return (
    <div className="space-y-3">
      {data.map((d,i) => (
        <div key={i} className="flex items-center">
          <div className="w-8 text-xs text-gray-600">{d.month}</div>
          <div className="flex-1 bg-gray-100 rounded h-4 relative overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${((d.onTime||d.orders)/max)*100}%`}} />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
              {d.onTime || d.orders}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
const PieChart = ({ data }) => (
  <div className="space-y-2">
    {data.map((d,i) => (
      <div key={i} className="flex justify-between p-2 rounded" style={{ backgroundColor: d.color + '20' }}>
        <span>{d.category}</span><span>{d.value}%</span>
      </div>
    ))}
  </div>
);
const CostChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div className="space-y-3">
      {data.map((d,i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span>{d.category}</span><span>€{d.amount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(d.amount/max)*100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const SupplierAnalysisApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [aiPredictions, setAiPredictions] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedKPI, setSelectedKPI] = useState(null);

  // Importez vos autres états et fonctions (auth, history, etc.) ici...

  // Lecture du fichier Excel et envoi à l'API OpenAI
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setExcelData(json);
      // appel vers votre backend qui interroge OpenAI
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${process.env.REACT_APP_API_URL}/api/openai/process`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data: json })
        });
        const result = await resp.json();
        setAnalysisResults(result.kpis);
        setAiPredictions(result.aiFeatures);
        setError(null);
        setCurrentView('results');
      } catch (err) {
        setError('Erreur lors de l'analyse OpenAI');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Ouvre la page de détail KPI
  const openKPIPage = (key) => {
    const map = {
      delivery: 'livraison',
      quality: 'qualite',
      orders: 'commandes',
      costs: 'couts'
    };
    const kpiType = map[key];
    const details = getKPIDetails(kpiType); // fonction existante mise à jour en français
    setSelectedKPI({ key: kpiType, details });
    setCurrentView('kpiDetail');
  };

  // Traduction des KPI dans le tableau de bord
  const kpis = analysisResults && [
    { key: 'delivery', label: 'Livraison à temps', value: `${analysisResults.on_time_rate}%`, icon: Clock },
    { key: 'quality',  label: 'Score qualité',    value: `${analysisResults.quality_rate}%`, icon: Target },
    { key: 'orders',   label: 'Total commandes',  value: analysisResults.total_orders, icon: BarChart3 },
    { key: 'costs',    label: 'Impact coût',       value: `€${analysisResults.total_cost_issues.toLocaleString()}`, icon: AlertTriangle }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar, Header, etc. (inchangés) */}

      <main className="flex-1 overflow-auto p-6">
        {currentView === 'dashboard' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Analyse Fournisseur</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map(k => {
                const Icon = k.icon;
                return (
                  <button key={k.key} onClick={() => openKPIPage(k.key)}
                    className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{k.label}</p>
                        <p className="text-2xl font-bold mt-2">{k.value}</p>
                      </div>
                      <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Zone de téléversement Excel */}
            <div className="mt-8">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </>
        )}

        {currentView === 'kpiDetail' && selectedKPI && (
          <KPIDetailView
            kpiType={selectedKPI.key}
            details={selectedKPI.details}
            aiData={aiPredictions}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {/* Autres vues (login, history, results) inchangées ou à ajuster */}
      </main>
    </div>
  );
};

export default SupplierAnalysisApp;
