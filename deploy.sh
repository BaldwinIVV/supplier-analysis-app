#!/bin/bash

# Script de déploiement pour l'application d'analyse des performances fournisseurs
# Usage: ./deploy.sh [production|staging|development]

set -e

ENVIRONMENT=${1:-development}
echo "🚀 Déploiement en mode: $ENVIRONMENT"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    print_step "Vérification des prérequis..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker n'est pas installé - déploiement local uniquement"
    fi
    
    print_message "Prérequis vérifiés avec succès"
}

# Installation des dépendances
install_dependencies() {
    print_step "Installation des dépendances..."
    
    # Backend
    print_message "Installation des dépendances backend..."
    cd backend
    npm ci --only=production
    cd ..
    
    # Frontend
    print_message "Installation des dépendances frontend..."
    cd frontend
    npm ci --only=production
    cd ..
    
    print_message "Dépendances installées avec succès"
}

# Configuration de l'environnement
setup_environment() {
    print_step "Configuration de l'environnement..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Copier les fichiers de configuration de production
        if [ -f "backend/env.production" ]; then
            cp backend/env.production backend/.env
            print_message "Configuration de production appliquée"
        else
            print_warning "Fichier env.production non trouvé, utilisation de env.example"
            cp backend/env.example backend/.env
        fi
        
        # Configuration frontend
        if [ -f "frontend/env.example" ]; then
            cp frontend/env.example frontend/.env
            print_message "Configuration frontend appliquée"
        fi
    else
        # Configuration de développement
        if [ ! -f "backend/.env" ]; then
            cp backend/env.example backend/.env
            print_message "Configuration de développement appliquée"
        fi
        
        if [ ! -f "frontend/.env" ]; then
            cp frontend/env.example frontend/.env
            print_message "Configuration frontend appliquée"
        fi
    fi
}

# Build de l'application
build_application() {
    print_step "Build de l'application..."
    
    # Build backend
    print_message "Build du backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    print_message "Build du frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_message "Build terminé avec succès"
}

# Déploiement Docker
deploy_docker() {
    if command -v docker &> /dev/null; then
        print_step "Déploiement avec Docker..."
        
        # Build des images
        print_message "Build des images Docker..."
        docker-compose build
        
        # Démarrage des services
        print_message "Démarrage des services..."
        docker-compose up -d
        
        print_message "Déploiement Docker terminé"
    else
        print_warning "Docker non disponible, déploiement local"
        deploy_local
    fi
}

# Déploiement local
deploy_local() {
    print_step "Déploiement local..."
    
    # Démarrer le backend
    print_message "Démarrage du backend..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Attendre que le backend soit prêt
    sleep 5
    
    # Démarrer le frontend
    print_message "Démarrage du frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    print_message "Application démarrée localement"
    print_message "Backend: http://localhost:5000"
    print_message "Frontend: http://localhost:3000"
    
    # Attendre l'interruption
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Migration de la base de données
migrate_database() {
    print_step "Migration de la base de données..."
    
    cd backend
    
    # Vérifier si Prisma est installé
    if [ -d "node_modules/.prisma" ]; then
        print_message "Génération du client Prisma..."
        npx prisma generate
        
        print_message "Migration de la base de données..."
        npx prisma db push
        
        print_message "Base de données migrée avec succès"
    else
        print_warning "Prisma non trouvé, migration ignorée"
    fi
    
    cd ..
}

# Tests
run_tests() {
    if [ "$ENVIRONMENT" != "production" ]; then
        print_step "Exécution des tests..."
        
        # Tests backend
        print_message "Tests backend..."
        cd backend
        npm test -- --passWithNoTests
        cd ..
        
        # Tests frontend
        print_message "Tests frontend..."
        cd frontend
        npm test -- --passWithNoTests --watchAll=false
        cd ..
        
        print_message "Tests terminés"
    else
        print_message "Tests ignorés en production"
    fi
}

# Nettoyage
cleanup() {
    print_step "Nettoyage..."
    
    # Supprimer les fichiers temporaires
    find . -name "*.log" -delete
    find . -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
    
    print_message "Nettoyage terminé"
}

# Fonction principale
main() {
    print_message "Début du déploiement pour l'environnement: $ENVIRONMENT"
    
    check_prerequisites
    setup_environment
    install_dependencies
    run_tests
    build_application
    migrate_database
    cleanup
    
    if [ "$ENVIRONMENT" = "production" ]; then
        deploy_docker
    else
        deploy_local
    fi
    
    print_message "✅ Déploiement terminé avec succès!"
}

# Exécution du script
main "$@" 