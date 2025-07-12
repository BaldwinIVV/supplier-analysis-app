require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: [
    'https://supplier-analysis-frontend1.onrender.com',
    'https://claude.ai',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Middleware de sécurité et optimisation
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes d'authentification simplifiées
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      });
    }

    // Mock response pour test
    const mockUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      createdAt: new Date().toISOString()
    };

    const mockToken = 'bearer_' + Buffer.from(email + ':' + Date.now()).toString('base64');

    res.json({
      success: true,
      message: 'Compte créé avec succès',
      user: mockUser,
      token: mockToken
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});

// Route de connexion simplifiée
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Mock response
    const mockUser = {
      id: 1,
      firstName: 'Demo',
      lastName: 'User',
      email,
      createdAt: new Date().toISOString()
    };

    const mockToken = 'bearer_' + Buffer.from(email + ':' + Date.now()).toString('base64');

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: mockUser,
      token: mockToken
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// Route d'analyse de fichiers
app.post('/api/analyze', async (req, res) => {
  try {
    console.log('Analyse de fichier demandée');
    
    // Simulation d'analyse IA avec des données réalistes
    const mockAnalysis = {
      supplier_name: "Fournisseur Test Excel",
      total_orders: 125,
      on_time_rate: 87,
      quality_rate: 94,
      total_cost_issues: 15420,
      risk_level: "MODÉRÉ",
      created_at: new Date().toISOString(),
      supplier_message: "Cher partenaire,\n\nSuite à notre analyse de vos performances, nous constatons un taux de livraison à temps de 87%, ce qui est bon mais peut être amélioré. Votre taux de qualité de 94% est excellent.\n\nRecommandations :\n- Améliorer la ponctualité pour atteindre 95%\n- Maintenir le niveau de qualité actuel\n- Réduire les coûts liés aux problèmes\n\nCordialement,\nÉquipe Achats",
      buyer_message: "Analyse du fournisseur :\n\n✅ Points forts :\n- Excellent taux de qualité (94%)\n- Volume de commandes stable (125)\n- Relation commerciale établie\n\n⚠️ Points d'amélioration :\n- Taux de ponctualité à améliorer (87% vs objectif 95%)\n- Coût des problèmes à surveiller (15,4K€)\n\n📋 Actions recommandées :\n- Suivi mensuel des délais\n- Plan d'action conjoint\n- Revue trimestrielle",
      management_message: "SYNTHÈSE FOURNISSEUR\n\n📊 Performances globales : SATISFAISANTES\n\n🔢 KPIs :\n- 125 commandes traitées\n- 87% de ponctualité (objectif : 95%)\n- 94% de qualité (excellent)\n- 15,4K€ de coûts problèmes\n\n🎯 Niveau de risque : MODÉRÉ\n\n💼 Recommandation stratégique :\nMaintenir la relation commerciale avec plan d'amélioration sur les délais. Fournisseur fiable avec potentiel d'optimisation."
    };

    // Simulation d'un délai d'analyse réaliste
    setTimeout(() => {
      res.json(mockAnalysis);
    }, 3000);

  } catch (error) {
    console.error('Erreur analyse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse du fichier'
    });
  }
});

// Route pour récupérer l'historique des analyses
app.get('/api/analyses', async (req, res) => {
  try {
    // Mock historique
    const mockHistory = [
      {
        id: 1,
        supplier_name: "Fournisseur Test Excel",
        total_orders: 125,
        on_time_rate: 87,
        quality_rate: 94,
        risk_level: "MODÉRÉ",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        supplier_name: "Fournisseur Demo",
        total_orders: 89,
        on_time_rate: 95,
        quality_rate: 98,
        risk_level: "FAIBLE",
        created_at: new Date(Date.now() - 24*60*60*1000).toISOString()
      }
    ];

    res.json(mockHistory);

  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
});

// Route de vérification du token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    // Mock verification
    const mockUser = {
      id: 1,
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@test.com'
    };

    res.json({
      success: true,
      user: mockUser
    });

  } catch (error) {
    console.error('Erreur vérification:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
