const express = require('express');
const { body } = require('express-validator');
const {
  createAnalysis,
  getAnalyses,
  getAnalysis,
  runAnalysis,
  deleteAnalysis,
  getAnalysisStats
} = require('../controllers/analysisController');

const router = express.Router();

// Validation middleware
const createAnalysisValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit contenir entre 3 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
];

// Routes
router.post('/', createAnalysisValidation, createAnalysis);
router.get('/', getAnalyses);
router.get('/stats', getAnalysisStats);
router.get('/:id', getAnalysis);
router.post('/:id/run', runAnalysis);
router.delete('/:id', deleteAnalysis);

module.exports = router; 