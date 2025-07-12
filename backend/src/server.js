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
