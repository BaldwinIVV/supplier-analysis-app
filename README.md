# Application d'Analyse des Performances Fournisseurs

Une application complète pour analyser les performances des fournisseurs avec intelligence artificielle, génération automatique de messages et interface moderne.

## 🚀 Fonctionnalités

- **Authentification sécurisée** : Login/Register avec JWT
- **Dashboard interactif** : KPIs visuels et graphiques
- **Upload de fichiers** : Support Excel/CSV avec validation
- **Analyse IA** : Intégration OpenAI pour analyse automatique
- **Génération de messages** : Messages personnalisés pour fournisseurs, acheteurs et direction
- **Historique complet** : Suivi de toutes les analyses
- **Interface responsive** : Design moderne avec Tailwind CSS

## 🛠️ Stack Technologique

### Frontend
- React 18
- Tailwind CSS
- Lucide React (icônes)
- React Router
- Axios
- Chart.js

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Multer (upload)
- XLSX (Excel parsing)
- OpenAI API

## 📁 Structure du Projet

```
supplier-performance-app/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── contexts/        # Contextes React
│   │   ├── utils/           # Utilitaires
│   │   └── assets/          # Ressources statiques
│   ├── public/
│   └── package.json
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/     # Contrôleurs
│   │   ├── middleware/      # Middleware
│   │   ├── models/          # Modèles Prisma
│   │   ├── routes/          # Routes API
│   │   ├── services/        # Services métier
│   │   └── utils/           # Utilitaires
│   ├── uploads/             # Fichiers uploadés
│   ├── config/              # Configuration
│   └── package.json
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd supplier-performance-app
```

### 2. Configuration de la base de données
```bash
# Créer la base de données PostgreSQL
createdb supplier_performance_db

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
```

### 3. Installation Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Installation Frontend
```bash
cd ../frontend
npm install
npm start
```

### 5. Configuration des variables d'environnement

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/supplier_performance_db"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📖 Utilisation

1. **Inscription/Connexion** : Créez un compte ou connectez-vous
2. **Upload de fichiers** : Téléchargez vos fichiers Excel/CSV de données fournisseurs
3. **Analyse automatique** : L'IA analyse automatiquement les performances
4. **Visualisation** : Consultez les KPIs et graphiques sur le dashboard
5. **Génération de messages** : Générez des messages personnalisés pour chaque partie prenante
6. **Historique** : Consultez l'historique de toutes vos analyses

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run start        # Démarrage en production
npm run migrate      # Migration de la base de données
```

### Frontend
```bash
npm start            # Démarrage en mode développement
npm run build        # Build de production
npm test             # Tests
```

## 📊 Format des Données

L'application accepte les fichiers Excel/CSV avec les colonnes suivantes :
- `fournisseur` : Nom du fournisseur
- `produit` : Produit fourni
- `quantite` : Quantité livrée
- `qualite` : Note de qualité (1-10)
- `delai` : Délai de livraison en jours
- `prix` : Prix unitaire
- `date_livraison` : Date de livraison

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub. 