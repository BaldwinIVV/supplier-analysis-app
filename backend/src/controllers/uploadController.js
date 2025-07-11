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

// Parser Excel file
const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      throw new Error('Le fichier doit contenir au moins un en-tête et une ligne de données');
    }

    const headers = data[0];
    const rows = data.slice(1);

    return rows.map(row => {
      const supplier = {};
      headers.forEach((header, index) => {
        supplier[header.toLowerCase().replace(/\s+/g, '_')] = row[index];
      });
      return supplier;
    });

  } catch (error) {
    throw new Error(`Erreur lors du parsing du fichier Excel: ${error.message}`);
  }
};

// Parser CSV file
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normaliser les noms de colonnes
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
          normalizedData[normalizedKey] = data[key];
        });
        results.push(normalizedData);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(new Error(`Erreur lors du parsing du fichier CSV: ${error.message}`));
      });
  });
};

// Valider les données des fournisseurs
const validateSupplierData = (suppliers) => {
  const requiredFields = ['fournisseur', 'produit', 'quantite', 'qualite', 'delai', 'prix', 'date_livraison'];
  const errors = [];

  suppliers.forEach((supplier, index) => {
    const rowErrors = [];

    requiredFields.forEach(field => {
      if (!supplier[field] && supplier[field] !== 0) {
        rowErrors.push(`Champ '${field}' manquant`);
      }
    });

    if (rowErrors.length > 0) {
      errors.push(`Ligne ${index + 1}: ${rowErrors.join(', ')}`);
    }

    // Validation des types
    if (supplier.quantite && isNaN(supplier.quantite)) {
      errors.push(`Ligne ${index + 1}: Quantité doit être un nombre`);
    }

    if (supplier.qualite && (isNaN(supplier.qualite) || supplier.qualite < 0 || supplier.qualite > 10)) {
      errors.push(`Ligne ${index + 1}: Qualité doit être un nombre entre 0 et 10`);
    }

    if (supplier.delai && isNaN(supplier.delai)) {
      errors.push(`Ligne ${index + 1}: Délai doit être un nombre`);
    }

    if (supplier.prix && isNaN(supplier.prix)) {
      errors.push(`Ligne ${index + 1}: Prix doit être un nombre`);
    }

    if (supplier.date_livraison && isNaN(Date.parse(supplier.date_livraison))) {
      errors.push(`Ligne ${index + 1}: Date de livraison invalide`);
    }
  });

  return errors;
};

// Upload et traiter le fichier
const uploadFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Données de validation invalides'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const { analysisId } = req.body;
    const userId = req.user.id;

    // Vérifier que l'analyse existe et appartient à l'utilisateur
    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    let suppliers = [];

    // Parser le fichier selon son type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExtension === '.csv') {
      suppliers = await parseCSVFile(req.file.path);
    } else {
      suppliers = parseExcelFile(req.file.path);
    }

    // Valider les données
    const validationErrors = validateSupplierData(suppliers);
    if (validationErrors.length > 0) {
      // Supprimer le fichier uploadé
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation dans le fichier',
        errors: validationErrors
      });
    }

    // Transformer et sauvegarder les fournisseurs
    const supplierData = suppliers.map(supplier => ({
      name: supplier.fournisseur,
      product: supplier.produit,
      quantity: parseInt(supplier.quantite),
      quality: parseFloat(supplier.qualite),
      deliveryDelay: parseInt(supplier.delai),
      price: parseFloat(supplier.prix),
      deliveryDate: new Date(supplier.date_livraison),
      analysisId
    }));

    const createdSuppliers = await prisma.supplier.createMany({
      data: supplierData
    });

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: `${createdSuppliers.count} fournisseurs importés avec succès`,
      data: {
        importedCount: createdSuppliers.count,
        analysisId
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
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
        example: [
          {
            fournisseur: 'Fournisseur A',
            produit: 'Produit 1',
            quantite: 100,
            qualite: 8.5,
            delai: 5,
            prix: 150.50,
            date_livraison: '2024-01-15'
          }
        ]
      },
      csv: {
        headers: 'fournisseur,produit,quantite,qualite,delai,prix,date_livraison',
        example: 'Fournisseur A,Produit 1,100,8.5,5,150.50,2024-01-15'
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