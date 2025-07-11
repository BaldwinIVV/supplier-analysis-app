const request = require('supertest');
const app = require('../server');

describe('Performance Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Mock authentication for performance tests
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('Response Time Tests', () => {
    test('should respond to health check within 100ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });

    test('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get('/api/health')
            .expect(200)
        );
      }

      const startTime = Date.now();
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Should handle 10 concurrent requests in less than 1 second
      expect(totalTime).toBeLessThan(1000);
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory on repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/health')
          .expect(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Load Tests', () => {
    test('should handle high load gracefully', async () => {
      const requests = 50;
      const promises = [];
      const errors = [];

      for (let i = 0; i < requests; i++) {
        promises.push(
          request(app)
            .get('/api/health')
            .then(response => response.status)
            .catch(error => {
              errors.push(error);
              return null;
            })
        );
      }

      const results = await Promise.all(promises);
      const successfulRequests = results.filter(status => status === 200).length;
      const errorRate = (requests - successfulRequests) / requests;

      // Error rate should be less than 5%
      expect(errorRate).toBeLessThan(0.05);
      expect(successfulRequests).toBeGreaterThan(requests * 0.95);
    });
  });

  describe('Database Performance Tests', () => {
    test('should handle database queries efficiently', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/analysis/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // Database queries should complete within 500ms
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('File Upload Performance Tests', () => {
    test('should handle file uploads efficiently', async () => {
      const testData = Buffer.from('fournisseur,produit,quantite,qualite,delai,prix,date_livraison\nFournisseur A,Produit 1,100,8.5,5,150.50,2024-01-15\n'.repeat(1000));

      const startTime = Date.now();

      await request(app)
        .post('/api/upload/file')
        .set('Authorization', `Bearer ${authToken}`)
        .field('analysisId', 'test-analysis-id')
        .attach('file', testData, 'large-test.csv')
        .expect(200);

      const responseTime = Date.now() - startTime;

      // File upload should complete within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });

  describe('AI Analysis Performance Tests', () => {
    test('should handle AI analysis requests within reasonable time', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/api/analysis/test-analysis-id/run')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // AI analysis should complete within 10 seconds
      expect(responseTime).toBeLessThan(10000);
    });
  });
}); 