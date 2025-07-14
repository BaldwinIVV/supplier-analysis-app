const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.model = 'gpt-4';
  }

  // Analyser les performances des fournisseurs - VERSION CORRIGÉE
  async analyzeSupplierPerformance(suppliers) {
    try {
      console.log('Starting AI analysis for', suppliers.length, 'suppliers');

      // Valider et nettoyer les données d'entrée
      const validSuppliers = suppliers.filter(s => {
        const isValid = s && s.name && s.product && 
                       typeof s.quality === 'number' && 
                       typeof s.deliveryDelay === 'number' && 
                       typeof s.price === 'number' &&
                       typeof s.quantity === 'number';
        
        if (!isValid) {
          console.warn('Invalid supplier data filtered out:', s);
        }
        return isValid;
      });

      console.log('Valid suppliers for analysis:', validSuppliers.length);

      if (validSuppliers.length === 0) {
        throw new Error('Aucun fournisseur valide trouvé pour l\'analyse');
      }

      // Préparer les données pour l'IA
      const supplierData = validSuppliers.map(s => ({
        name: s.name,
        product: s.product,
        quantity: s.quantity,
        quality: s.quality,
        deliveryDelay: s.deliveryDelay,
        price: s.price,
        deliveryDate: s.deliveryDate
      }));

      console.log('Prepared data for AI:', supplierData);

      const prompt = `
        Analyse les performances des fournisseurs suivants et fournis une évaluation détaillée :
        
        Données des fournisseurs :
        ${JSON.stringify(supplierData, null, 2)}
        
        Instructions d'analyse :
        1. Évalue la qualité globale (moyenne pondérée)
        2. Analyse la ponctualité des livraisons (délai moyen)
        3. Évalue la compétitivité des prix
        4. Catégorise chaque fournisseur selon ces critères :
           - EXCELLENT: qualité ≥ 8.5, délai ≤ 3 jours, prix compétitif
           - GOOD: qualité ≥ 7.0, délai ≤ 7 jours, prix raisonnable
           - AVERAGE: qualité ≥ 5.0, délai ≤ 14 jours
           - POOR: qualité ≥ 3.0, délai ≤ 21 jours
           - CRITICAL: qualité < 3.0 ou délai > 21 jours
        5. Identifie les points forts et faibles
        6. Propose des recommandations concrètes
        
        IMPORTANT : Réponds UNIQUEMENT avec du JSON valide, sans texte supplémentaire.
        
        Format de réponse requis :
        {
          "globalAnalysis": {
            "overallQuality": number,
            "averageDeliveryDelay": number,
            "priceCompetitiveness": number,
            "totalSuppliers": number,
            "bestSupplier": "string",
            "worstSupplier": "string"
          },
          "supplierAnalysis": [
            {
              "name": "string",
              "category": "EXCELLENT|GOOD|AVERAGE|POOR|CRITICAL",
              "performanceScore": number,
              "qualityScore": number,
              "deliveryScore": number,
              "priceScore": number,
              "strengths": ["string"],
              "weaknesses": ["string"],
              "recommendations": ["string"]
            }
          ],
          "summary": "string"
        }
      `;

      console.log('Sending request to OpenAI...');

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse des performances fournisseurs. Tu dois répondre UNIQUEMENT avec du JSON valide, sans aucun texte supplémentaire. Tes analyses sont précises, objectives et basées sur les données fournies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const responseContent = completion.choices[0].message.content.trim();
      console.log('OpenAI response received, length:', responseContent.length);

      // Nettoyer la réponse au cas où il y aurait du texte supplémentaire
      let jsonString = responseContent;
      
      // Extraire le JSON si il y a du texte avant/après
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== 0) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      }

      console.log('Parsing AI response...');
      const analysis = JSON.parse(jsonString);

      // Valider la structure de la réponse
      if (!analysis.globalAnalysis || !analysis.supplierAnalysis || !Array.isArray(analysis.supplierAnalysis)) {
        console.error('Invalid AI response structure:', analysis);
        throw new Error('Structure de réponse IA invalide');
      }

      // Calculer les scores de performance si manquants
      analysis.supplierAnalysis.forEach((supplier, index) => {
        if (!supplier.performanceScore) {
          supplier.performanceScore = this.calculatePerformanceScore(validSuppliers[index]);
        }
        
        // S'assurer que la catégorie est définie
        if (!supplier.category) {
          supplier.category = this.categorizeSupplier(supplier.performanceScore);
        }
      });

      console.log('AI analysis completed successfully');
      return analysis;

    } catch (error) {
      console.error('AI Analysis error:', error);
      
      // Fallback: analyse basique si l'IA échoue
      if (error.message.includes('OpenAI') || error.message.includes('JSON')) {
        console.log('Falling back to basic analysis...');
        return this.performBasicAnalysis(suppliers);
      }
      
      throw new Error(`Erreur lors de l'analyse IA: ${error.message}`);
    }
  }

  // Analyse de fallback en cas d'échec de l'IA
  performBasicAnalysis(suppliers) {
    console.log('Performing basic analysis for', suppliers.length, 'suppliers');
    
    const validSuppliers = suppliers.filter(s => s && s.name && typeof s.quality === 'number');
    
    const globalAnalysis = {
      overallQuality: validSuppliers.reduce((sum, s) => sum + s.quality, 0) / validSuppliers.length,
      averageDeliveryDelay: validSuppliers.reduce((sum, s) => sum + s.deliveryDelay, 0) / validSuppliers.length,
      priceCompetitiveness: 7.5, // Score par défaut
      totalSuppliers: validSuppliers.length,
      bestSupplier: validSuppliers.sort((a, b) => b.quality - a.quality)[0]?.name || '',
      worstSupplier: validSuppliers.sort((a, b) => a.quality - b.quality)[0]?.name || ''
    };

    const supplierAnalysis = validSuppliers.map(supplier => {
      const performanceScore = this.calculatePerformanceScore(supplier);
      const category = this.categorizeSupplier(performanceScore);
      
      return {
        name: supplier.name,
        category,
        performanceScore,
        qualityScore: supplier.quality * 10,
        deliveryScore: Math.max(0, 100 - supplier.deliveryDelay * 5),
        priceScore: 75, // Score par défaut
        strengths: this.getStrengths(supplier),
        weaknesses: this.getWeaknesses(supplier),
        recommendations: this.getRecommendations(supplier, category)
      };
    });

    return {
      globalAnalysis,
      supplierAnalysis,
      summary: `Analyse de ${validSuppliers.length} fournisseurs effectuée. Qualité moyenne: ${globalAnalysis.overallQuality.toFixed(1)}/10, Délai moyen: ${globalAnalysis.averageDeliveryDelay.toFixed(1)} jours.`
    };
  }

  // Générer des messages personnalisés - VERSION CORRIGÉE
  async generateMessages(supplierAnalysis, analysisTitle) {
    try {
      console.log('Generating personalized messages...');

      const prompt = `
        Génère des messages professionnels pour l'analyse "${analysisTitle}" basés sur ces résultats :
        
        ${JSON.stringify(supplierAnalysis, null, 2)}
        
        Génère 3 types de messages en français :
        1. Message pour les FOURNISSEURS (constructif, encourageant, avec demandes d'amélioration)
        2. Message pour les ACHETEURS (résumé des performances, recommandations d'actions)
        3. Message pour la DIRECTION (synthèse stratégique, décisions à prendre)
        
        IMPORTANT : Réponds UNIQUEMENT avec du JSON valide.
        
        Format requis :
        {
          "supplierMessage": {
            "subject": "string",
            "content": "string",
            "tone": "professional|encouraging|firm"
          },
          "buyerMessage": {
            "subject": "string", 
            "content": "string",
            "keyPoints": ["string"]
          },
          "managementMessage": {
            "subject": "string",
            "content": "string",
            "actionItems": ["string"],
            "priority": "high|medium|low"
          }
        }
      `;

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Tu es un expert en communication d'entreprise. Génère des messages clairs, professionnels et adaptés au public cible. Réponds UNIQUEMENT avec du JSON valide."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      const responseContent = completion.choices[0].message.content.trim();
      
      // Nettoyer et extraire le JSON
      let jsonString = responseContent;
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== 0) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      }

      const messages = JSON.parse(jsonString);
      
      console.log('Messages generated successfully');
      return messages;

    } catch (error) {
      console.error('Message generation error:', error);
      
      // Messages de fallback
      return {
        supplierMessage: {
          subject: `Retour sur l'analyse ${analysisTitle}`,
          content: `Cher partenaire,\n\nSuite à notre analyse de vos performances, nous souhaitons partager avec vous nos observations et recommandations.\n\nNous restons à votre disposition pour discuter de ces points.\n\nCordialement,\nÉquipe Achats`,
          tone: "professional"
        },
        buyerMessage: {
          subject: `Résultats de l'analyse ${analysisTitle}`,
          content: `L'analyse des fournisseurs a été complétée. Veuillez consulter les résultats détaillés et les recommandations d'actions dans le rapport.\n\nActions recommandées à suivre selon les priorités établies.`,
          keyPoints: ["Consulter le rapport détaillé", "Identifier les actions prioritaires", "Planifier les suivis"]
        },
        managementMessage: {
          subject: `Synthèse stratégique - ${analysisTitle}`,
          content: `L'analyse des performances fournisseurs est terminée. Les résultats montrent des opportunités d'optimisation de notre chaîne d'approvisionnement.\n\nRecommandations stratégiques en pièce jointe.`,
          actionItems: ["Réviser la stratégie fournisseurs", "Optimiser les processus", "Renforcer les partenariats"],
          priority: "medium"
        }
      };
    }
  }

  // Calculer le score de performance - MÉTHODE AMÉLIORÉE
  calculatePerformanceScore(supplier) {
    try {
      const qualityWeight = 0.4;
      const deliveryWeight = 0.3;
      const priceWeight = 0.3;

      // Normaliser les valeurs (0-1)
      const qualityScore = Math.max(0, Math.min(1, supplier.quality / 10));
      
      // Score de livraison (inversé car moins de délai = mieux)
      const deliveryScore = Math.max(0, Math.min(1, 1 - (supplier.deliveryDelay / 30)));
      
      // Score de prix (assumant que des prix plus bas sont meilleurs, normalisé sur 1000€)
      const priceScore = Math.max(0, Math.min(1, 1 - (supplier.price / 1000)));

      const performanceScore = (
        qualityScore * qualityWeight +
        deliveryScore * deliveryWeight +
        priceScore * priceWeight
      ) * 100;

      return Math.round(Math.max(0, Math.min(100, performanceScore)));
    } catch (error) {
      console.error('Error calculating performance score:', error);
      return 50; // Score par défaut
    }
  }

  // Catégoriser un fournisseur
  categorizeSupplier(performanceScore) {
    if (performanceScore >= 85) return 'EXCELLENT';
    if (performanceScore >= 70) return 'GOOD';
    if (performanceScore >= 50) return 'AVERAGE';
    if (performanceScore >= 30) return 'POOR';
    return 'CRITICAL';
  }

  // Obtenir les points forts d'un fournisseur
  getStrengths(supplier) {
    const strengths = [];
    
    if (supplier.quality >= 8.5) strengths.push('Qualité excellente');
    if (supplier.quality >= 7.5) strengths.push('Bonne qualité');
    if (supplier.deliveryDelay <= 3) strengths.push('Livraisons très rapides');
    if (supplier.deliveryDelay <= 7) strengths.push('Délais respectés');
    if (supplier.quantity >= 100) strengths.push('Volume important');
    
    return strengths.length > 0 ? strengths : ['Fournisseur stable'];
  }

  // Obtenir les points faibles d'un fournisseur
  getWeaknesses(supplier) {
    const weaknesses = [];
    
    if (supplier.quality < 5) weaknesses.push('Qualité insuffisante');
    if (supplier.deliveryDelay > 14) weaknesses.push('Délais trop longs');
    if (supplier.deliveryDelay > 7) weaknesses.push('Délais à améliorer');
    if (supplier.price > 200) weaknesses.push('Prix élevé');
    if (supplier.quantity < 50) weaknesses.push('Volume faible');
    
    return weaknesses.length > 0 ? weaknesses : ['Points d\'amélioration mineurs'];
  }

  // Obtenir les recommandations pour un fournisseur
  getRecommendations(supplier, category) {
    const recommendations = [];
    
    switch (category) {
      case 'EXCELLENT':
        recommendations.push('Maintenir le niveau d\'excellence');
        recommendations.push('Explorer des partenariats stratégiques');
        break;
      case 'GOOD':
        recommendations.push('Optimiser les processus');
        recommendations.push('Viser l\'excellence');
        break;
      case 'AVERAGE':
        recommendations.push('Plan d\'amélioration nécessaire');
        recommendations.push('Suivi régulier requis');
        break;
      case 'POOR':
        recommendations.push('Action corrective urgente');
        recommendations.push('Révision du contrat');
        break;
      case 'CRITICAL':
        recommendations.push('Évaluation de la relation');
        recommendations.push('Recherche d\'alternatives');
        break;
    }
    
    return recommendations;
  }

  // Analyser les tendances (méthode existante améliorée)
  async analyzeTrends(historicalData) {
    try {
      const prompt = `
        Analyse les tendances dans ces données historiques de fournisseurs :
        
        ${JSON.stringify(historicalData, null, 2)}
        
        Identifie :
        1. Les tendances de qualité
        2. Les tendances de délais de livraison
        3. Les tendances de prix
        4. Les fournisseurs qui s'améliorent ou se détériorent
        5. Les saisonnalités possibles
        
        Réponds UNIQUEMENT avec du JSON valide :
        {
          "trends": {
            "quality": "improving|stable|declining",
            "delivery": "improving|stable|declining", 
            "pricing": "increasing|stable|decreasing"
          },
          "insights": ["string"],
          "recommendations": ["string"]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Tu es un analyste de données spécialisé dans les tendances fournisseurs. Réponds UNIQUEMENT avec du JSON valide."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const responseContent = completion.choices[0].message.content.trim();
      
      // Nettoyer et extraire le JSON
      let jsonString = responseContent;
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== 0) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      }

      const trends = JSON.parse(jsonString);
      return trends;

    } catch (error) {
      console.error('Trend analysis error:', error);
      
      // Réponse par défaut
      return {
        trends: {
          quality: "stable",
          delivery: "stable",
          pricing: "stable"
        },
        insights: ["Données insuffisantes pour une analyse de tendance"],
        recommendations: ["Collecter plus de données historiques"]
      };
    }
  }
}

module.exports = new AIService();
