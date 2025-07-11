const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.model = 'gpt-4';
  }

  // Analyser les performances des fournisseurs
  async analyzeSupplierPerformance(suppliers) {
    try {
      const supplierData = suppliers.map(s => ({
        name: s.name,
        product: s.product,
        quantity: s.quantity,
        quality: s.quality,
        deliveryDelay: s.deliveryDelay,
        price: s.price,
        deliveryDate: s.deliveryDate
      }));

      const prompt = `
        Analyse les performances des fournisseurs suivants et fournis une évaluation détaillée :
        
        Données des fournisseurs :
        ${JSON.stringify(supplierData, null, 2)}
        
        Veuillez analyser :
        1. La qualité globale (note sur 10)
        2. La ponctualité des livraisons
        3. La compétitivité des prix
        4. La catégorisation de chaque fournisseur (EXCELLENT, GOOD, AVERAGE, POOR, CRITICAL)
        5. Les points forts et faibles de chaque fournisseur
        6. Des recommandations d'amélioration
        
        Réponds au format JSON suivant :
        {
          "globalAnalysis": {
            "overallQuality": number,
            "averageDeliveryDelay": number,
            "priceCompetitiveness": number,
            "totalSuppliers": number
          },
          "supplierAnalysis": [
            {
              "name": "string",
              "category": "EXCELLENT|GOOD|AVERAGE|POOR|CRITICAL",
              "performanceScore": number,
              "strengths": ["string"],
              "weaknesses": ["string"],
              "recommendations": ["string"]
            }
          ],
          "summary": "string"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse des performances fournisseurs. Fournis des analyses précises et détaillées basées sur les données fournies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      return analysis;

    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error('Erreur lors de l\'analyse IA');
    }
  }

  // Générer des messages personnalisés
  async generateMessages(supplierAnalysis, analysisType) {
    try {
      const prompt = `
        Génère des messages personnalisés pour ${analysisType} basés sur cette analyse de fournisseurs :
        
        ${JSON.stringify(supplierAnalysis, null, 2)}
        
        Génère 3 types de messages :
        1. Message pour les fournisseurs (encouragement, feedback, demandes d'amélioration)
        2. Message pour les acheteurs (résumé des performances, recommandations)
        3. Message pour la direction (synthèse stratégique, actions à entreprendre)
        
        Réponds au format JSON :
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
            content: "Tu es un expert en communication professionnelle. Génère des messages clairs, constructifs et adaptés au destinataire."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const messages = JSON.parse(completion.choices[0].message.content);
      return messages;

    } catch (error) {
      console.error('Message generation error:', error);
      throw new Error('Erreur lors de la génération des messages');
    }
  }

  // Analyser les tendances
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
        
        Réponds au format JSON :
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
            content: "Tu es un analyste de données spécialisé dans les tendances fournisseurs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const trends = JSON.parse(completion.choices[0].message.content);
      return trends;

    } catch (error) {
      console.error('Trend analysis error:', error);
      throw new Error('Erreur lors de l\'analyse des tendances');
    }
  }

  // Calculer le score de performance
  calculatePerformanceScore(supplier) {
    const qualityWeight = 0.4;
    const deliveryWeight = 0.3;
    const priceWeight = 0.3;

    // Normaliser les valeurs
    const qualityScore = supplier.quality / 10;
    const deliveryScore = Math.max(0, 1 - (supplier.deliveryDelay / 30)); // 30 jours max
    const priceScore = 1 - (supplier.price / 1000); // Normaliser sur 1000€ max

    const performanceScore = (
      qualityScore * qualityWeight +
      deliveryScore * deliveryWeight +
      priceScore * priceWeight
    ) * 100;

    return Math.round(performanceScore);
  }

  // Catégoriser un fournisseur
  categorizeSupplier(performanceScore) {
    if (performanceScore >= 85) return 'EXCELLENT';
    if (performanceScore >= 70) return 'GOOD';
    if (performanceScore >= 50) return 'AVERAGE';
    if (performanceScore >= 30) return 'POOR';
    return 'CRITICAL';
  }
}

module.exports = new AIService(); 