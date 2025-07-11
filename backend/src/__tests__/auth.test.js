const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn()
    }
  }))
}));

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

// Import de l'app après les mocks
const app = require('../server');

describe('Auth Routes', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        ...userData,
        password: 'hashed-password',
        role: 'USER'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test('should return error for invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    test('should return error for weak password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('mot de passe');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'Password123'
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashed-password',
        role: 'USER'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'WrongPassword'
      };

      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return user info for valid token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER'
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
    });

    test('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token non fourni');
    });
  });
}); 