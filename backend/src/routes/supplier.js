const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Obtenir tous les fournisseurs d'une analyse
const getSuppliers = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user.id;

    // Vérifier que l'analyse appartient à l'utilisateur
    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    const suppliers = await prisma.supplier.findMany({
      where: { analysisId },
      orderBy: { performance: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fournisseurs'
    });
  }
};

// Obtenir les statistiques des fournisseurs
const getSupplierStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalSuppliers,
      excellentSuppliers,
      goodSuppliers,
      averageSuppliers,
      poorSuppliers,
      criticalSuppliers,
      avgQuality,
      avgDeliveryDelay,
      avgPrice
    ] = await Promise.all([
      prisma.supplier.count({
        where: { analysis: { userId } }
      }),
      prisma.supplier.count({
        where: { 
          analysis: { userId },
          category: 'EXCELLENT'
        }
      }),
      prisma.supplier.count({
        where: { 
          analysis: { userId },
          category: 'GOOD'
        }
      }),
      prisma.supplier.count({
        where: { 
          analysis: { userId },
          category: 'AVERAGE'
        }
      }),
      prisma.supplier.count({
        where: { 
          analysis: { userId },
          category: 'POOR'
        }
      }),
      prisma.supplier.count({
        where: { 
          analysis: { userId },
          category: 'CRITICAL'
        }
      }),
      prisma.supplier.aggregate({
        where: { analysis: { userId } },
        _avg: { quality: true }
      }),
      prisma.supplier.aggregate({
        where: { analysis: { userId } },
        _avg: { deliveryDelay: true }
      }),
      prisma.supplier.aggregate({
        where: { analysis: { userId } },
        _avg: { price: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSuppliers,
        categoryBreakdown: {
          excellent: excellentSuppliers,
          good: goodSuppliers,
          average: averageSuppliers,
          poor: poorSuppliers,
          critical: criticalSuppliers
        },
        averages: {
          quality: avgQuality._avg.quality || 0,
          deliveryDelay: avgDeliveryDelay._avg.deliveryDelay || 0,
          price: avgPrice._avg.price || 0
        }
      }
    });

  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Routes
router.get('/analysis/:analysisId', getSuppliers);
router.get('/stats', getSupplierStats);

module.exports = router; 