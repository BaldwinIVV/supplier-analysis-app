const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Obtenir tous les messages d'une analyse
const getMessages = async (req, res) => {
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

    const messages = await prisma.message.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'desc' }
    });

    // Parser le contenu JSON des messages
    const parsedMessages = messages.map(message => ({
      ...message,
      content: JSON.parse(message.content)
    }));

    res.status(200).json({
      success: true,
      data: { messages: parsedMessages }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Obtenir un message spécifique
const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findFirst({
      where: {
        id,
        analysis: { userId }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Parser le contenu JSON
    const parsedMessage = {
      ...message,
      content: JSON.parse(message.content)
    };

    res.status(200).json({
      success: true,
      data: { message: parsedMessage }
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du message'
    });
  }
};

// Obtenir les messages par type
const getMessagesByType = async (req, res) => {
  try {
    const { analysisId, type } = req.params;
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

    const messages = await prisma.message.findMany({
      where: { 
        analysisId,
        type: type.toUpperCase()
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parser le contenu JSON des messages
    const parsedMessages = messages.map(message => ({
      ...message,
      content: JSON.parse(message.content)
    }));

    res.status(200).json({
      success: true,
      data: { messages: parsedMessages }
    });

  } catch (error) {
    console.error('Get messages by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Routes
router.get('/analysis/:analysisId', getMessages);
router.get('/analysis/:analysisId/type/:type', getMessagesByType);
router.get('/:id', getMessage);

module.exports = router; 