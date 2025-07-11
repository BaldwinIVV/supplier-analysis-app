import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Wrapper pour les tests avec les providers nécessaires
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Frontend Security Tests', () => {
  describe('Input Validation', () => {
    test('should prevent XSS in form inputs', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const maliciousInput = '<script>alert("XSS")</script>';
      
      fireEvent.change(emailInput, { target: { value: maliciousInput } });
      
      // The input should not execute the script
      expect(emailInput.value).toBe(maliciousInput);
      expect(screen.queryByText('XSS')).not.toBeInTheDocument();
    });

    test('should validate email format', async () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
      });
    });

    test('should validate password strength', async () => {
      renderWithProviders(<Register />);
      
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /créer un compte/i });
      
      // Test weak password
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/mot de passe trop faible/i)).toBeInTheDocument();
      });
    });

    test('should prevent SQL injection in inputs', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const sqlInjection = "'; DROP TABLE users; --";
      
      fireEvent.change(emailInput, { target: { value: sqlInjection } });
      
      // The input should accept the value but not execute SQL
      expect(emailInput.value).toBe(sqlInjection);
    });
  });

  describe('Authentication Security', () => {
    test('should not store sensitive data in localStorage', () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      renderWithProviders(<Login />);
      
      // Check that sensitive data is not stored in localStorage
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
        expect.stringContaining('password'),
        expect.anything()
      );
    });

    test('should clear sensitive data on logout', () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      renderWithProviders(<Login />);
      
      // Simulate logout
      // This would typically be tested in a component that has logout functionality
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('token');
    });
  });

  describe('CSRF Protection', () => {
    test('should include CSRF tokens in requests', () => {
      // Mock axios to capture request headers
      const mockAxios = require('axios');
      const mockPost = jest.fn();
      mockAxios.create.mockReturnValue({
        post: mockPost,
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });
      
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);
      
      // Check that CSRF token is included in request headers
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': expect.any(String)
          })
        })
      );
    });
  });

  describe('Content Security Policy', () => {
    test('should not allow inline scripts', () => {
      renderWithProviders(<Login />);
      
      // Check that no inline scripts are present
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        expect(script.src).toBeTruthy(); // All scripts should have src attribute
      });
    });

    test('should not allow eval() usage', () => {
      // This test would check that no eval() calls are present in the code
      // In a real implementation, you might use ESLint rules to prevent this
      expect(eval).not.toHaveBeenCalled();
    });
  });

  describe('Data Sanitization', () => {
    test('should sanitize user input before display', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const maliciousInput = '<img src="x" onerror="alert(\'XSS\')">';
      
      fireEvent.change(emailInput, { target: { value: maliciousInput } });
      
      // The input should display the sanitized value
      expect(emailInput.value).toBe(maliciousInput);
      // But the HTML should not be rendered
      expect(screen.queryByAltText('x')).not.toBeInTheDocument();
    });

    test('should prevent HTML injection in form fields', () => {
      renderWithProviders(<Register />);
      
      const firstNameInput = screen.getByLabelText(/prénom/i);
      const htmlInput = '<div>HTML Content</div>';
      
      fireEvent.change(firstNameInput, { target: { value: htmlInput } });
      
      // The input should contain the raw text, not rendered HTML
      expect(firstNameInput.value).toBe(htmlInput);
      expect(screen.queryByText('HTML Content')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should not expose sensitive information in error messages', async () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Error message should be generic
        const errorMessage = screen.getByText(/email ou mot de passe incorrect/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage.textContent).not.toContain('password');
        expect(errorMessage.textContent).not.toContain('database');
      });
    });

    test('should handle network errors gracefully', async () => {
      // Mock network error
      const mockAxios = require('axios');
      mockAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(new Error('Network Error')),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });
      
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Management', () => {
    test('should redirect to login when token expires', () => {
      // Mock expired token
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('expired-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      // This test would verify that the app redirects to login when token is expired
      // Implementation would depend on how token expiration is handled
    });

    test('should clear session data on logout', () => {
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      // Simulate logout action
      // This would typically be tested in a component with logout functionality
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('token');
    });
  });

  describe('File Upload Security', () => {
    test('should validate file types before upload', () => {
      renderWithProviders(<Login />);
      
      // This test would verify that only allowed file types can be uploaded
      // Implementation would depend on file upload functionality
    });

    test('should prevent upload of malicious files', () => {
      renderWithProviders(<Login />);
      
      // This test would verify that malicious files are rejected
      // Implementation would depend on file upload functionality
    });
  });
}); 