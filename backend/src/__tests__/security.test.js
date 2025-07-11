const request = require('supertest');
const app = require('../server');

describe('Security Tests', () => {
  describe('Authentication & Authorization', () => {
    test('should reject requests without authentication token', async () => {
      await request(app)
        .get('/api/analysis')
        .expect(401);
    });

    test('should reject requests with invalid token format', async () => {
      await request(app)
        .get('/api/analysis')
        .set('Authorization', 'InvalidToken')
        .expect(401);
    });

    test('should reject requests with malformed JWT token', async () => {
      await request(app)
        .get('/api/analysis')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });

    test('should reject requests with expired token', async () => {
      // Mock an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.invalid';
      
      await request(app)
        .get('/api/analysis')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    test('should reject SQL injection attempts in email', async () => {
      const maliciousEmail = "'; DROP TABLE users; --";
      
      await request(app)
        .post('/api/auth/login')
        .send({
          email: maliciousEmail,
          password: 'Password123'
        })
        .expect(400);
    });

    test('should reject XSS attempts in analysis title', async () => {
      const maliciousTitle = '<script>alert("XSS")</script>';
      
      await request(app)
        .post('/api/analysis')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: maliciousTitle,
          description: 'Test description'
        })
        .expect(400);
    });

    test('should reject NoSQL injection attempts', async () => {
      const maliciousData = {
        email: { $ne: '' },
        password: { $ne: '' }
      };
      
      await request(app)
        .post('/api/auth/login')
        .send(maliciousData)
        .expect(400);
    });

    test('should reject command injection attempts', async () => {
      const maliciousCommand = '$(rm -rf /)';
      
      await request(app)
        .post('/api/analysis')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: maliciousCommand,
          description: 'Test'
        })
        .expect(400);
    });
  });

  describe('File Upload Security', () => {
    test('should reject files with executable extensions', async () => {
      const executableFile = Buffer.from('malicious code');
      
      await request(app)
        .post('/api/upload/file')
        .set('Authorization', 'Bearer valid-token')
        .field('analysisId', 'test-id')
        .attach('file', executableFile, 'malicious.exe')
        .expect(400);
    });

    test('should reject files with double extensions', async () => {
      const maliciousFile = Buffer.from('malicious content');
      
      await request(app)
        .post('/api/upload/file')
        .set('Authorization', 'Bearer valid-token')
        .field('analysisId', 'test-id')
        .attach('file', maliciousFile, 'document.csv.exe')
        .expect(400);
    });

    test('should reject files that are too large', async () => {
      const largeFile = Buffer.alloc(20 * 1024 * 1024); // 20MB
      
      await request(app)
        .post('/api/upload/file')
        .set('Authorization', 'Bearer valid-token')
        .field('analysisId', 'test-id')
        .attach('file', largeFile, 'large-file.csv')
        .expect(413);
    });

    test('should reject files with invalid MIME types', async () => {
      const invalidFile = Buffer.from('invalid content');
      
      await request(app)
        .post('/api/upload/file')
        .set('Authorization', 'Bearer valid-token')
        .field('analysisId', 'test-id')
        .attach('file', invalidFile, 'document.txt')
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limiting on authentication endpoints', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'Password123'
            })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should enforce rate limiting on API endpoints', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get('/api/analysis')
            .set('Authorization', 'Bearer valid-token')
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('CORS Security', () => {
    test('should reject requests from unauthorized origins', async () => {
      await request(app)
        .get('/api/analysis')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);
    });

    test('should include proper CORS headers for authorized origins', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('HTTP Security Headers', () => {
    test('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('should prevent clickjacking attacks', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should prevent MIME type sniffing', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Data Sanitization', () => {
    test('should sanitize HTML in user inputs', async () => {
      const maliciousInput = '<script>alert("XSS")</script>User Name';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: maliciousInput,
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'Password123'
        })
        .expect(400);
    });

    test('should prevent path traversal attacks', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      await request(app)
        .get(`/api/analysis/${maliciousPath}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });
  });

  describe('Session Security', () => {
    test('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      // Error message should not reveal if user exists
      expect(response.body.message).not.toContain('user not found');
      expect(response.body.message).not.toContain('password incorrect');
    });

    test('should use secure cookie settings in production', async () => {
      // This test would check cookie settings in production environment
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });
      
      if (process.env.NODE_ENV === 'production') {
        expect(response.headers['set-cookie']).toBeDefined();
        const cookie = response.headers['set-cookie'][0];
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('Secure');
      }
    });
  });

  describe('API Security', () => {
    test('should not expose internal server information', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);
      
      expect(response.body).not.toContain('stack trace');
      expect(response.body).not.toContain('internal');
      expect(response.headers['server']).not.toContain('Express');
    });

    test('should validate request body size', async () => {
      const largePayload = { data: 'x'.repeat(1000000) }; // 1MB payload
      
      await request(app)
        .post('/api/analysis')
        .set('Authorization', 'Bearer valid-token')
        .send(largePayload)
        .expect(413);
    });
  });
}); 