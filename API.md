# 📚 Documentation API - Analyse Fournisseurs

## Base URL
```
http://localhost:5000/api
```

## Authentification
Toutes les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## Endpoints

### 🔐 Authentification

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Se connecter avec email et mot de passe.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "token": "jwt_token"
  }
}
```

#### GET /auth/me
Obtenir les informations de l'utilisateur connecté.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### 📊 Analyses

#### POST /analysis
Créer une nouvelle analyse.

**Body:**
```json
{
  "title": "Analyse Q1 2024",
  "description": "Analyse des performances fournisseurs du premier trimestre"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Analyse créée avec succès",
  "data": {
    "analysis": {
      "id": "analysis_id",
      "title": "Analyse Q1 2024",
      "description": "Analyse des performances fournisseurs du premier trimestre",
      "status": "PENDING",
      "userId": "user_id",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### GET /analysis
Obtenir la liste des analyses de l'utilisateur.

**Query Parameters:**
- `page` (number): Numéro de page (défaut: 1)
- `limit` (number): Nombre d'éléments par page (défaut: 10)
- `status` (string): Filtrer par statut (PENDING, PROCESSING, COMPLETED, FAILED)

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "id": "analysis_id",
        "title": "Analyse Q1 2024",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00Z",
        "_count": {
          "suppliers": 10,
          "messages": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### GET /analysis/:id
Obtenir les détails d'une analyse spécifique.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "analysis_id",
      "title": "Analyse Q1 2024",
      "description": "Description de l'analyse",
      "status": "COMPLETED",
      "suppliers": [
        {
          "id": "supplier_id",
          "name": "Fournisseur A",
          "product": "Produit 1",
          "quality": 8.5,
          "deliveryDelay": 5,
          "price": 150.50,
          "performance": 85,
          "category": "EXCELLENT"
        }
      ],
      "messages": [
        {
          "id": "message_id",
          "type": "SUPPLIER",
          "content": "{\"subject\":\"...\",\"content\":\"...\"}",
          "recipient": "Fournisseurs"
        }
      ]
    }
  }
}
```

#### POST /analysis/:id/run
Lancer l'analyse IA sur une analyse existante.

**Response:**
```json
{
  "success": true,
  "message": "Analyse terminée avec succès",
  "data": {
    "analysis": {
      "globalAnalysis": {
        "overallQuality": 8.2,
        "averageDeliveryDelay": 6.5,
        "priceCompetitiveness": 7.8,
        "totalSuppliers": 10
      },
      "supplierAnalysis": [
        {
          "name": "Fournisseur A",
          "category": "EXCELLENT",
          "performanceScore": 85,
          "strengths": ["Qualité élevée", "Délais respectés"],
          "weaknesses": ["Prix légèrement élevé"],
          "recommendations": ["Maintenir la qualité", "Négocier les prix"]
        }
      ]
    },
    "messages": {
      "supplierMessage": {
        "subject": "Feedback sur vos performances",
        "content": "Message personnalisé...",
        "tone": "encouraging"
      }
    }
  }
}
```

#### DELETE /analysis/:id
Supprimer une analyse.

**Response:**
```json
{
  "success": true,
  "message": "Analyse supprimée avec succès"
}
```

### 📈 Statistiques

#### GET /analysis/stats
Obtenir les statistiques globales de l'utilisateur.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAnalyses": 25,
    "completedAnalyses": 20,
    "pendingAnalyses": 3,
    "failedAnalyses": 2,
    "totalSuppliers": 150,
    "averagePerformance": 78.5
  }
}
```

### 📤 Upload

#### POST /upload/file
Uploader un fichier Excel/CSV avec les données fournisseurs.

**Form Data:**
- `file`: Fichier Excel (.xlsx, .xls) ou CSV
- `analysisId`: ID de l'analyse

**Response:**
```json
{
  "success": true,
  "message": "10 fournisseurs importés avec succès",
  "data": {
    "importedCount": 10,
    "analysisId": "analysis_id"
  }
}
```

#### GET /upload/templates
Obtenir les templates de fichiers.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": {
      "excel": {
        "headers": ["fournisseur", "produit", "quantite", "qualite", "delai", "prix", "date_livraison"],
        "example": [
          {
            "fournisseur": "Fournisseur A",
            "produit": "Produit 1",
            "quantite": 100,
            "qualite": 8.5,
            "delai": 5,
            "prix": 150.50,
            "date_livraison": "2024-01-15"
          }
        ]
      },
      "csv": {
        "headers": "fournisseur,produit,quantite,qualite,delai,prix,date_livraison",
        "example": "Fournisseur A,Produit 1,100,8.5,5,150.50,2024-01-15"
      }
    }
  }
}
```

### 👥 Fournisseurs

#### GET /supplier/analysis/:analysisId
Obtenir tous les fournisseurs d'une analyse.

**Response:**
```json
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "id": "supplier_id",
        "name": "Fournisseur A",
        "product": "Produit 1",
        "quantity": 100,
        "quality": 8.5,
        "deliveryDelay": 5,
        "price": 150.50,
        "performance": 85,
        "category": "EXCELLENT"
      }
    ]
  }
}
```

#### GET /supplier/stats
Obtenir les statistiques des fournisseurs.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSuppliers": 150,
    "categoryBreakdown": {
      "excellent": 45,
      "good": 60,
      "average": 30,
      "poor": 10,
      "critical": 5
    },
    "averages": {
      "quality": 7.8,
      "deliveryDelay": 6.2,
      "price": 165.30
    }
  }
}
```

### 💬 Messages

#### GET /message/analysis/:analysisId
Obtenir tous les messages d'une analyse.

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id",
        "type": "SUPPLIER",
        "content": {
          "subject": "Feedback sur vos performances",
          "content": "Message personnalisé...",
          "tone": "encouraging"
        },
        "recipient": "Fournisseurs",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Données de validation invalides |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur interne |

## Exemples d'Utilisation

### cURL
```bash
# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'

# Créer une analyse
curl -X POST http://localhost:5000/api/analysis \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Analyse Test","description":"Description test"}'
```

### JavaScript (Fetch)
```javascript
// Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'Password123'
  })
});

const { data: { token } } = await loginResponse.json();

// Créer une analyse
const analysisResponse = await fetch('/api/analysis', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Analyse Test',
    description: 'Description test'
  })
});
``` 