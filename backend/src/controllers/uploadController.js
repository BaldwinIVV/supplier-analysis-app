const multer = require('multer');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// Parser Excel file - VERSION CORRIGÉE
const parseExcelFile = (filePath) => {
  try {
    console.log('Parsing Excel file:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Conversion en JSON avec headers en première ligne
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,  // Utiliser la première ligne comme header
      defval: '',  // Valeur par défaut pour les cellules vides
      raw: false   // Convertir les valeurs en string pour un traitement uniforme
    });

    console.log('Raw Excel data:', jsonData);

    if (jsonData.length < 2) {
      throw new Error('Le fichier doit contenir au moins un en-tête et une ligne de données');
    }

    const headers = jsonData[0].map(h => h.toString().toLowerCase().trim().replace(/\s+/g, '_'));
    const rows = jsonData.slice(1);

    console.log('Processed headers:', headers);
    console.log('Number of data rows:', rows.length);

    const suppliers = rows.map((row, index) => {
      const supplier = {};
      headers.forEach((header, headerIndex) => {
        supplier[header] = row[headerIndex] || '';
      });
      
      console.log(`Row ${index + 1}:`, supplier);
      return supplier;
    });

    return suppliers;

  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Erreur lors du parsing du fichier Excel: ${error.message}`);
  }
};

// Parser CSV file - VERSION CORRIGÉE
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    console.log('Parsing CSV file:', filePath);
    
    fs.createReadStream(filePath)
      .pipe(csv({
        separator: ',',
        skipEmptyLines: true,
        skipLinesWithError: true
      }))
      .on('data', (data) => {
        // Normaliser les noms de colonnes
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
          normalizedData[normalizedKey] = data[key] || '';
        });
        results.push(normalizedData);
        console.log('CSV row parsed:', normalizedData);
      })
      .on('end', () => {
        console.log('CSV parsing completed. Total rows:', results.length);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        reject(new Error(`Erreur lors du parsing du fichier CSV: ${error.message}`));
      });
  });
};

// Valider les données des fournisseurs - VERSION AMÉLIORÉE
const validateSupplierData = (suppliers) => {
  const requiredFields = ['fournisseur', 'produit', 'quantite', 'qualite', 'delai', 'prix', 'date_livraison'];
  const errors = [];

  console.log('Validating supplier data:', suppliers.length, 'suppliers');

  suppliers.forEach((supplier, index) => {
    const rowErrors = [];

    // Vérification des champs requis
    requiredFields.forEach(field => {
      const value = supplier[field];
      if (value === undefined || value === null || value === '' || value === 0 && field !== 'quantite') {
        rowErrors.push(`Champ '${field}' manquant ou vide`);
      }
    });

    // Validation spécifique des types avec conversion
    if (supplier.quantite !== undefined && supplier.quantite !== '') {
      const quantite = Number(supplier.quantite);
      if (isNaN(quantite) || quantite <= 0) {
        rowErrors.push(`Quantité doit être un nombre positif (valeur: ${supplier.quantite})`);
      }
    }

    if (supplier.qualite !== undefined && supplier.qualite !== '') {
      const qualite = Number(supplier.qualite);
      if (isNaN(qualite) || qualite < 0 || qualite > 10) {
        rowErrors.push(`Qualité doit être un nombre entre 0 et 10 (valeur: ${supplier.qualite})`);
      }
    }

    if (supplier.delai !== undefined && supplier.delai !== '') {
      const delai = Number(supplier.delai);
      if (isNaN(delai) || delai < 0) {
        rowErrors.push(`Délai doit être un nombre positif (valeur: ${supplier.delai})`);
      }
    }

    if (supplier.prix !== undefined && supplier.prix !== '') {
      const prix = Number(supplier.prix);
      if (isNaN(prix) || prix <= 0) {
        rowErrors.push(`Prix doit être un nombre positif (valeur: ${supplier.prix})`);
      }
    }

    if (supplier.date_livraison !== undefined && supplier.date_livraison !== '') {
      const dateStr = supplier.date_livraison.toString();
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        rowErrors.push(`Date de livraison invalide (valeur: ${supplier.date_livraison})`);
      }
    }

    if (rowErrors.length > 0) {
      errors.push(`Ligne ${index + 2}: ${rowErrors.join(', ')}`); // +2 car index 0 = ligne 2 du fichier
    }
  });

  console.log('Validation completed. Errors found:', errors.length);
  return errors;
};

// Nettoyer et convertir les données pour la base de données
const cleanSupplierData = (suppliers) => {
  return suppliers.map(supplier => {
    try {
      // Nettoyer et convertir les données
      const cleaned = {
        name: supplier.fournisseur.toString().trim(),
        product: supplier.produit.toString().trim(),
        quantity: parseInt(supplier.quantite),
        quality: parseFloat(supplier.qualite),
        deliveryDelay: parseInt(supplier.delai),
        price: parseFloat(supplier.prix),
        deliveryDate: new Date(supplier.date_livraison)
      };

      console.log('Cleaned supplier data:', cleaned);
      return cleaned;
    } catch (error) {
      console.error('Error cleaning supplier data:', error, supplier);
      throw new Error(`Erreur lors du nettoyage des données du fournisseur: ${supplier.fournisseur}`);
    }
  });
};

// Upload et traiter le fichier - VERSION CORRIGÉE
const uploadFile = async (req, res) => {
  try {
    console.log('File upload started');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Données de validation invalides'
      });
    }

    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const { analysisId } = req.body;
    const userId = req.user.id;

    console.log('Analysis ID:', analysisId, 'User ID:', userId);

    // Vérifier que l'analyse existe et appartient à l'utilisateur
    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId }
    });

    if (!analysis) {
      console.log('Analysis not found');
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    let suppliers = [];

    // Parser le fichier selon son type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    console.log('File extension:', fileExtension);
    
    try {
      if (fileExtension === '.csv') {
        suppliers = await parseCSVFile(req.file.path);
      } else if (['.xlsx', '.xls'].includes(fileExtension)) {
        suppliers = parseExcelFile(req.file.path);
      } else {
        throw new Error('Type de fichier non supporté');
      }

      console.log('Parsed suppliers count:', suppliers.length);
      
      if (suppliers.length === 0) {
        throw new Error('Aucune donnée trouvée dans le fichier');
      }

    } catch (parseError) {
      console.error('File parsing error:', parseError);
      // Supprimer le fichier uploadé
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: `Erreur de parsing: ${parseError.message}`
      });
    }

    // Valider les données
    const validationErrors = validateSupplierData(suppliers);
    if (validationErrors.length > 0) {
      console.log('Validation errors found:', validationErrors);
      // Supprimer le fichier uploadé
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation dans le fichier',
        errors: validationErrors.slice(0, 10) // Limiter à 10 erreurs pour l'affichage
      });
    }

    // Nettoyer et transformer les données pour la base de données
    let supplierData;
    try {
      supplierData = cleanSupplierData(suppliers).map(supplier => ({
        ...supplier,
        analysisId
      }));
      
      console.log('Cleaned supplier data count:', supplierData.length);

    } catch (cleanError) {
      console.error('Data cleaning error:', cleanError);
      // Supprimer le fichier uploadé
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        success: false,
        message: `Erreur lors du nettoyage des données: ${cleanError.message}`
      });
    }

    // Sauvegarder les fournisseurs en base de données
    try {
      const createdSuppliers = await prisma.supplier.createMany({
        data: supplierData
      });

      console.log('Suppliers created successfully:', createdSuppliers.count);

      // Supprimer le fichier temporaire
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(200).json({
        success: true,
        message: `${createdSuppliers.count} fournisseurs importés avec succès`,
        data: {
          importedCount: createdSuppliers.count,
          analysisId,
          suppliers: supplierData.map(s => ({
            name: s.name,
            product: s.product,
            quality: s.quality,
            performance: null
          }))
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Supprimer le fichier en cas d'erreur
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde en base de données'
      });
    }

  } catch (error) {
    console.error('General upload error:', error);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'upload du fichier'
    });
  }
};

// Obtenir les templates de fichiers
const getTemplates = async (req, res) => {
  try {
    const templates = {
      excel: {
        headers: ['fournisseur', 'produit', 'quantite', 'qualite', 'delai', 'prix', 'date_livraison'],
        description: 'Format Excel (.xlsx, .xls) avec en-têtes en première ligne',
        example: [
          {
            fournisseur: 'Fournisseur A',
            produit: 'Produit 1',
            quantite: 100,
            qualite: 8.5,
            delai: 5,
            prix: 150.50,
            date_livraison: '2024-01-15'
          },
          {
            fournisseur: 'Fournisseur B',
            produit: 'Produit 2',
            quantite: 200,
            qualite: 7.8,
            delai: 3,
            prix: 120.00,
            date_livraison: '2024-01-10'
          }
        ]
      },
      csv: {
        headers: 'fournisseur,produit,quantite,qualite,delai,prix,date_livraison',
        description: 'Format CSV avec virgules comme séparateur',
        example: 'Fournisseur A,Produit 1,100,8.5,5,150.50,2024-01-15\nFournisseur B,Produit 2,200,7.8,3,120.00,2024-01-10'
      }
    };

    res.status(200).json({
      success: true,
      data: { templates }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des templates'
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getTemplates
};
