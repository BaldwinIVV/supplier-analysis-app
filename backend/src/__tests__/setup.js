// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/supplier_performance_test';

// Mock OpenAI
jest.mock('openai', () => {
  return function OpenAI() {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    globalAnalysis: {
                      overallQuality: 8.0,
                      averageDeliveryDelay: 5.0,
                      priceCompetitiveness: 7.5,
                      totalSuppliers: 10
                    },
                    supplierAnalysis: [
                      {
                        name: 'Test Supplier',
                        category: 'EXCELLENT',
                        performanceScore: 85,
                        strengths: ['Qualité élevée'],
                        weaknesses: ['Prix élevé'],
                        recommendations: ['Maintenir la qualité']
                      }
                    ]
                  })
                }
              }
            ]
          })
        }
      }
    };
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id' })
}));

// Mock multer
jest.mock('multer', () => {
  const multerMock = jest.fn().mockReturnValue({
    single: jest.fn().mockReturnValue((req, res, next) => {
      req.file = {
        filename: 'test-file.csv',
        path: '/tmp/test-file.csv',
        mimetype: 'text/csv'
      };
      next();
    })
  });
  multerMock.diskStorage = jest.fn(() => ({
    _handleFile: jest.fn(),
    _removeFile: jest.fn()
  }));
  return multerMock;
});

// Mock XLSX
jest.mock('xlsx', () => ({
  readFile: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        'A1': { v: 'fournisseur' },
        'B1': { v: 'produit' },
        'C1': { v: 'quantite' },
        'D1': { v: 'qualite' },
        'E1': { v: 'delai' },
        'F1': { v: 'prix' },
        'G1': { v: 'date_livraison' },
        'A2': { v: 'Fournisseur A' },
        'B2': { v: 'Produit 1' },
        'C2': { v: 100 },
        'D2': { v: 8.5 },
        'E2': { v: 5 },
        'F2': { v: 150.50 },
        'G2': { v: '2024-01-15' }
      }
    }
  }),
  utils: {
    sheet_to_json: jest.fn().mockReturnValue([
      {
        fournisseur: 'Fournisseur A',
        produit: 'Produit 1',
        quantite: 100,
        qualite: 8.5,
        delai: 5,
        prix: 150.50,
        date_livraison: '2024-01-15'
      }
    ])
  }
}));

// Mock fs
jest.mock('fs', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
  existsSync: jest.fn().mockReturnValue(true)
}));

// Mock csv-parser
jest.mock('csv-parser', () => {
  return jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockReturnThis()
  });
});

// Configuration globale pour les timeouts
jest.setTimeout(10000); 