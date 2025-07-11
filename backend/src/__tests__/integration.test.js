const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn()
    },
    analysis: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    supplier: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  }))
}));

// Mock OpenAI
jest.mock('../services/aiService', () => ({
  analyzeSupplierData: jest.fn().mockResolvedValue({
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
  }),
  generatePersonalizedMessage: jest.fn().mockResolvedValue({
    subject: 'Feedback sur vos performances',
    content: 'Message personnalisé...',
    tone: 'encouraging'
  })
}));

// Import de l'app après les mocks
const app = require('../server');

describe('API Integration Tests', () => {
  let prisma;
  let authToken;

  beforeEach(async () => {
    prisma = new PrismaClient();
    
    // Mock user creation for authentication
    prisma.user.create.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashed-password',
      role: 'USER'
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashed-password',
      role: 'USER'
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
      });

    authToken = loginResponse.body.data.token;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Analysis Flow', () => {
    test('should create analysis, upload data, and run analysis', async () => {
      // Mock analysis creation
      prisma.analysis.create.mockResolvedValue({
        id: 'analysis-id',
        title: 'Test Analysis',
        description: 'Test Description',
        status: 'PENDING',
        userId: 'user-id'
      });

      prisma.analysis.findUnique.mockResolvedValue({
        id: 'analysis-id',
        title: 'Test Analysis',
        description: 'Test Description',
        status: 'PENDING',
        userId: 'user-id',
        suppliers: [],
        messages: []
      });

      prisma.analysis.update.mockResolvedValue({
        id: 'analysis-id',
        status: 'COMPLETED'
      });

      prisma.supplier.createMany.mockResolvedValue({
        count: 5
      });

      prisma.message.create.mockResolvedValue({
        id: 'message-id',
        type: 'SUPPLIER',
        content: '{"subject":"Test","content":"Test"}',
        recipient: 'Fournisseurs'
      });

      // 1. Create analysis
      const createResponse = await request(app)
        .post('/api/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Analysis',
          description: 'Test Description'
        })
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const analysisId = createResponse.body.data.analysis.id;

      // 2. Upload file (mock)
      const uploadResponse = await request(app)
        .post('/api/upload/file')
        .set('Authorization', `Bearer ${authToken}`)
        .field('analysisId', analysisId)
        .attach('file', Buffer.from('test'), 'test.csv')
        .expect(200);

      expect(uploadResponse.body.success).toBe(true);

      // 3. Run analysis
      const runResponse = await request(app)
        .post(`/api/analysis/${analysisId}/run`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(runResponse.body.success).toBe(true);
      expect(runResponse.body.data.analysis.globalAnalysis).toBeDefined();
      expect(runResponse.body.data.messages).toBeDefined();
    });
  });

  describe('Analysis CRUD Operations', () => {
    test('should list analyses with pagination', async () => {
      prisma.analysis.findMany.mockResolvedValue([
        {
          id: 'analysis-1',
          title: 'Analysis 1',
          status: 'COMPLETED',
          createdAt: new Date(),
          _count: {
            suppliers: 10,
            messages: 3
          }
        }
      ]);

      prisma.analysis.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/analysis?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analyses).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should get analysis details', async () => {
      prisma.analysis.findUnique.mockResolvedValue({
        id: 'analysis-id',
        title: 'Test Analysis',
        description: 'Test Description',
        status: 'COMPLETED',
        suppliers: [
          {
            id: 'supplier-id',
            name: 'Test Supplier',
            product: 'Test Product',
            quality: 8.5,
            deliveryDelay: 5,
            price: 150.50,
            performance: 85,
            category: 'EXCELLENT'
          }
        ],
        messages: [
          {
            id: 'message-id',
            type: 'SUPPLIER',
            content: '{"subject":"Test","content":"Test"}',
            recipient: 'Fournisseurs'
          }
        ]
      });

      const response = await request(app)
        .get('/api/analysis/analysis-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis.suppliers).toHaveLength(1);
      expect(response.body.data.analysis.messages).toHaveLength(1);
    });

    test('should delete analysis', async () => {
      prisma.analysis.delete.mockResolvedValue({
        id: 'analysis-id'
      });

      const response = await request(app)
        .delete('/api/analysis/analysis-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Analyse supprimée avec succès');
    });
  });

  describe('Statistics', () => {
    test('should get analysis statistics', async () => {
      prisma.analysis.count.mockResolvedValue(25);
      prisma.supplier.count.mockResolvedValue(150);

      const response = await request(app)
        .get('/api/analysis/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAnalyses).toBe(25);
      expect(response.body.data.totalSuppliers).toBe(150);
    });
  });
}); 