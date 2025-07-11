# 🚀 Démarrage Rapide - Analyse Fournisseurs

## Installation Express (5 minutes)

### 1. Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 2. Installation automatique
```bash
# Cloner le projet (si pas déjà fait)
git clone <repository-url>
cd supplier-performance-app

# Installation automatique
./install.sh
```

### 3. Configuration
```bash
# Configurer les variables d'environnement
cd backend
cp env.example .env
# Éditer .env avec vos clés API
```

### 4. Démarrage
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## Utilisation Rapide

### 1. Créer un compte
- Accédez à http://localhost:3000
- Cliquez sur "Créer un compte"
- Remplissez le formulaire

### 2. Créer une analyse
- Connectez-vous
- Cliquez sur "Nouvelle analyse"
- Donnez un titre et description

### 3. Uploader des données
- Utilisez le fichier d'exemple : `examples/sample_data.csv`
- Ou créez votre propre fichier avec les colonnes :
  - fournisseur, produit, quantite, qualite, delai, prix, date_livraison

### 4. Lancer l'analyse IA
- Cliquez sur "Lancer l'analyse"
- Attendez quelques secondes
- Consultez les résultats et messages générés

## Structure des Données

Format CSV/Excel requis :
```csv
fournisseur,produit,quantite,qualite,delai,prix,date_livraison
Fournisseur A,Produit 1,100,8.5,5,150.50,2024-01-15
Fournisseur B,Produit 2,75,7.2,8,120.00,2024-01-20
```

## Variables d'Environnement

Backend (.env) :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/supplier_performance_db"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=5000
NODE_ENV=development
```

## Déploiement Docker

```bash
# Avec Docker Compose
docker-compose up -d

# Ou build manuel
docker build -t supplier-backend ./backend
docker build -t supplier-frontend ./frontend
```

## Support

- 📖 Documentation complète : README.md
- 🐛 Issues : GitHub Issues
- 💬 Support : Contactez l'équipe 