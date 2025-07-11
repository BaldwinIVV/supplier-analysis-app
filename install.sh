#!/bin/bash

echo "🚀 Installation de l'application d'analyse des performances fournisseurs"
echo "=================================================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+"
    exit 1
fi

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé. Veuillez installer PostgreSQL 14+"
    exit 1
fi

echo "✅ Node.js et PostgreSQL sont installés"

# Créer la base de données
echo "📊 Création de la base de données..."
createdb supplier_performance_db 2>/dev/null || echo "Base de données déjà existante"

# Installation du backend
echo "🔧 Installation du backend..."
cd backend

# Copier le fichier d'environnement
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Fichier .env créé. Veuillez configurer vos variables d'environnement."
fi

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la base de données
npx prisma db push

echo "✅ Backend installé avec succès"

# Installation du frontend
echo "🎨 Installation du frontend..."
cd ../frontend

# Installer les dépendances
npm install

echo "✅ Frontend installé avec succès"

# Retour au répertoire racine
cd ..

echo ""
echo "🎉 Installation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Configurez vos variables d'environnement dans backend/.env"
echo "2. Démarrez le backend : cd backend && npm run dev"
echo "3. Démarrez le frontend : cd frontend && npm start"
echo ""
echo "🌐 L'application sera accessible sur :"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo ""
echo "📚 Consultez le README.md pour plus d'informations" 