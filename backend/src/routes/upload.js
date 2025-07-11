const express = require('express');
const { body } = require('express-validator');
const { upload, uploadFile, getTemplates } = require('../controllers/uploadController');

const router = express.Router();

// Validation middleware
const uploadValidation = [
  body('analysisId')
    .notEmpty()
    .withMessage('ID d\'analyse requis')
];

// Routes
router.post('/file', uploadValidation, upload.single('file'), uploadFile);
router.get('/templates', getTemplates);

module.exports = router; 