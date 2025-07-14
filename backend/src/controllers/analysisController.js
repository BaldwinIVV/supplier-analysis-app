const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const aiService = require('../services/aiService');

const prisma = new PrismaClient();

// Créer une nouvelle analyse
const createAnalysis = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Données de validation invalides'
      });
    }

    const { title, description } = req.body;
    const userId = req.user.id;

    const analysis = await prisma.analysis.create({
      data: {
        title,
        description,
        userId
      },
      include: {
        suppliers: true,
        messages: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Analyse créée avec succès',
      data: { analysis }
    });

  } catch (error) {
    console.error('Create analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'analyse'
    });
  }
};

// Obtenir toutes les analyses d'un utilisateur
const getAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId };

    if (status) {
      where.status = status;
    }

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        include: {
          suppliers: {
            select: {
              id: true,
              name: true,
              category: true,
              performance: true
            }
          },
          messages: {
            select: {
              id: true,
              type: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              suppliers: true,
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.analysis.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        analyses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analyses'
    });
  }
};

// Obtenir une analyse spécifique
const getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        userId
      },
      include: {
        suppliers: {
          orderBy: { performance: 'desc' }
        },
        messages: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: { analysis }
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'analyse'
    });
  }
};

// Exécuter l'analyse IA - VERSION CORRIGÉE
const runAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('Starting AI analysis for analysis:', id);

    // Vérifier que l'analyse existe et appartient à l'utilisateur
    const analysis = await prisma.analysis.findFirst({
      where: { id, userId },
      include: { 
        suppliers: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    if (analysis.suppliers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fournisseur à analyser. Veuillez d\'abord importer des données.'
      });
    }

    console.log('Found', analysis.suppliers.length, 'suppliers for analysis');

    // Mettre à jour le statut à PROCESSING
    await prisma.analysis.update({
      where: { id },
      data: { status: 'PROCESSING' }
    });

    try {
      // Vérifier la qualité des données avant l'analyse
      const validSuppliers = analysis.suppliers.filter(supplier => {
        const isValid = supplier.name && 
                       supplier.product && 
                       typeof supplier.quality === 'number' && 
                       typeof supplier.deliveryDelay === 'number' && 
                       typeof supplier.price === 'number' &&
                       typeof supplier.quantity === 'number';
        
        if (!isValid) {
          console.warn('Invalid supplier data found:', supplier);
        }
        return isValid;
      });

      if (validSuppliers.length === 0) {
        throw new Error('Aucun fournisseur avec des données valides trouvé');
      }

      console.log('Valid suppliers for AI analysis:', validSuppliers.length);

      // Analyser avec l'IA
      const aiAnalysis = await aiService.analyzeSupplierPerformance(validSuppliers);
      console.log('AI analysis completed successfully');

      // Mettre à jour les fournisseurs avec les résultats
      const updatePromises = [];
      
      for (let i = 0; i < validSuppliers.length; i++) {
        const supplier = validSuppliers[i];
        const supplierAnalysis = aiAnalysis.supplierAnalysis.find(
          sa => sa.name === supplier.name
        );

        if (supplierAnalysis) {
          updatePromises.push(
            prisma.supplier.update({
              where: { id: supplier.id },
              data: {
                performance: supplierAnalysis.performanceScore,
                category: supplierAnalysis.category
              }
            })
          );
        } else {
          // Si pas de correspondance dans l'analyse IA, calculer un score basique
          const basicScore = aiService.calculatePerformanceScore(supplier);
          const basicCategory = aiService.categorizeSupplier(basicScore);
          
          updatePromises.push(
            prisma.supplier.update({
              where: { id: supplier.id },
              data: {
                performance: basicScore,
                category: basicCategory
              }
            })
          );
        }
      }

      await Promise.all(updatePromises);
      console.log('Supplier data updated with analysis results');

      // Générer les messages
      const messages = await aiService.generateMessages(aiAnalysis, analysis.title);
      console.log('Messages generated successfully');

      // Sauvegarder les messages
      const messagePromises = [];

      if (messages.supplierMessage) {
        messagePromises.push(
          prisma.message.create({
            data: {
              type: 'SUPPLIER',
              content: JSON.stringify(messages.supplierMessage),
              recipient: 'Fournisseurs',
              analysisId: id
            }
          })
        );
      }

      if (messages.buyerMessage) {
        messagePromises.push(
          prisma.message.create({
            data: {
              type: 'BUYER',
              content: JSON.stringify(messages.buyerMessage),
              recipient: 'Acheteurs',
              analysisId: id
            }
          })
        );
      }

      if (messages.managementMessage) {
        messagePromises.push(
          prisma.message.create({
            data: {
              type: 'MANAGEMENT',
              content: JSON.stringify(messages.managementMessage),
              recipient: 'Direction',
              analysisId: id
            }
          })
        );
      }

      await Promise.all(messagePromises);
      console.log('Messages saved to database');

      // Mettre à jour le statut final avec résumé
      await prisma.analysis.update({
        where: { id },
        data: { 
          status: 'COMPLETED',
          description: aiAnalysis.summary || analysis.description
        }
      });

      console.log('Analysis completed successfully');

      res.status(200).json({
        success: true,
        message: 'Analyse terminée avec succès',
        data: {
          analysis: aiAnalysis,
          messages,
          suppliersUpdated: updatePromises.length,
          messagesCreated: messagePromises.length
        }
      });

    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      
      // En cas d'erreur IA, marquer comme échoué
      await prisma.analysis.update({
        where: { id },
        data: { status: 'FAILED' }
      });

      // Essayer de fournir une analyse basique si possible
      if (analysis.suppliers.length > 0) {
        try {
          console.log('Attempting basic analysis fallback...');
          
          const basicAnalysis = aiService.performBasicAnalysis(analysis.suppliers);
          
          // Mettre à jour les performances avec les calculs basiques
          const basicUpdatePromises = analysis.suppliers.map(supplier => {
            const performanceScore = aiService.calculatePerformanceScore(supplier);
            const category = aiService.categorizeSupplier(performanceScore);
            
            return prisma.supplier.update({
              where: { id: supplier.id },
              data: {
                performance: performanceScore,
                category: category
              }
            });
          });

          await Promise.all(basicUpdatePromises);

          await prisma.analysis.update({
            where: { id },
            data: { 
              status: 'COMPLETED',
              description: 'Analyse basique effectuée (IA indisponible)'
            }
          });

          return res.status(200).json({
            success: true,
            message: 'Analyse basique terminée (IA temporairement indisponible)',
            data: {
              analysis: basicAnalysis,
              messages: null,
              suppliersUpdated: basicUpdatePromises.length,
              fallback: true
            }
          });

        } catch (fallbackError) {
          console.error('Fallback analysis also failed:', fallbackError);
        }
      }

      return res.status(500).json({
        success: false,
        message: `Erreur lors de l'analyse: ${aiError.message}`
      });
    }

  } catch (error) {
    console.error('Run analysis error:', error);
    
    // Mettre à jour le statut en cas d'erreur générale
    try {
      await prisma.analysis.update({
        where: { id: req.params.id },
        data: { status: 'FAILED' }
      });
    } catch (updateError) {
      console.error('Failed to update analysis status:', updateError);
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exécution de l\'analyse'
    });
  }
};

// Supprimer une analyse
const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await prisma.analysis.findFirst({
      where: { id, userId }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    await prisma.analysis.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Analyse supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'analyse'
    });
  }
};

// Obtenir les statistiques des analyses
const getAnalysisStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalAnalyses,
      completedAnalyses,
      pendingAnalyses,
      failedAnalyses,
      totalSuppliers,
      averagePerformance
    ] = await Promise.all([
      prisma.analysis.count({ where: { userId } }),
      prisma.analysis.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.analysis.count({ where: { userId, status: 'PENDING' } }),
      prisma.analysis.count({ where: { userId, status: 'FAILED' } }),
      prisma.supplier.count({
        where: {
          analysis: { userId }
        }
      }),
      prisma.supplier.aggregate({
        where: {
          analysis: { userId },
          performance: { not: null }
        },
        _avg: { performance: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAnalyses,
        completedAnalyses,
        pendingAnalyses,
        failedAnalyses,
        totalSuppliers,
        averagePerformance: averagePerformance._avg.performance || 0
      }
    });

  } catch (error) {
    console.error('Get analysis stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysis,
  runAnalysis,
  deleteAnalysis,
  getAnalysisStats
};
