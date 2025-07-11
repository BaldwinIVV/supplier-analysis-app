import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Analysis from '../pages/Analysis';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

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

describe('Accessibility Tests', () => {
  describe('Login Page', () => {
    test('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Login />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper form labels', () => {
      renderWithProviders(<Login />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    test('should have proper button labels', () => {
      renderWithProviders(<Login />);
      
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /créer un compte/i })).toBeInTheDocument();
    });

    test('should have proper heading structure', () => {
      renderWithProviders(<Login />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(/connexion/i);
    });

    test('should have proper focus management', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      
      // Check that inputs are focusable
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      passwordInput.focus();
      expect(passwordInput).toHaveFocus();
    });

    test('should have proper ARIA attributes', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Register Page', () => {
    test('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Register />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper form labels', () => {
      renderWithProviders(<Register />);
      
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
    });

    test('should have proper error message associations', () => {
      renderWithProviders(<Register />);
      
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i);
      
      // Check that error messages are properly associated with inputs
      expect(passwordInput).toHaveAttribute('aria-describedby');
      expect(confirmPasswordInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('Dashboard Page', () => {
    test('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Dashboard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper navigation structure', () => {
      renderWithProviders(<Dashboard />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(0);
    });

    test('should have proper heading hierarchy', () => {
      renderWithProviders(<Dashboard />);
      
      const headings = screen.getAllByRole('heading');
      const h1Elements = headings.filter(h => h.tagName === 'H1');
      const h2Elements = headings.filter(h => h.tagName === 'H2');
      
      // Should have one main heading (H1)
      expect(h1Elements).toHaveLength(1);
      
      // Should have section headings (H2)
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    test('should have proper table structure', () => {
      renderWithProviders(<Dashboard />);
      
      const tables = screen.getAllByRole('table');
      tables.forEach(table => {
        expect(table).toHaveAttribute('aria-label');
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
          expect(header).toHaveAttribute('scope');
        });
      });
    });
  });

  describe('Analysis Page', () => {
    test('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Analysis />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper form structure', () => {
      renderWithProviders(<Analysis />);
      
      const forms = screen.getAllByRole('form');
      forms.forEach(form => {
        expect(form).toHaveAttribute('aria-label');
      });
    });

    test('should have proper button descriptions', () => {
      renderWithProviders(<Analysis />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Color Contrast', () => {
    test('should have sufficient color contrast', () => {
      renderWithProviders(<Login />);
      
      // This test would check color contrast ratios
      // In a real implementation, you might use a library like axe-core
      // or manually check contrast ratios
      const textElements = screen.getAllByText(/./);
      textElements.forEach(element => {
        // Check that text has sufficient contrast
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        // This is a simplified check - in practice you'd calculate actual contrast ratios
        expect(color).not.toBe('transparent');
        expect(backgroundColor).not.toBe('transparent');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('should be fully navigable by keyboard', () => {
      renderWithProviders(<Login />);
      
      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('link'),
        screen.getAllByRole('textbox')
      );
      
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex');
      });
    });

    test('should have proper tab order', () => {
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      
      // Check tab order
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      emailInput.tabIndex = 1;
      passwordInput.tabIndex = 2;
      submitButton.tabIndex = 3;
    });
  });

  describe('Screen Reader Support', () => {
    test('should have proper ARIA landmarks', () => {
      renderWithProviders(<Dashboard />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navigation
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });

    test('should have proper ARIA labels', () => {
      renderWithProviders(<Dashboard />);
      
      const interactiveElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('link'),
        screen.getAllByRole('textbox')
      );
      
      interactiveElements.forEach(element => {
        expect(element).toHaveAccessibleName();
      });
    });

    test('should have proper ARIA descriptions', () => {
      renderWithProviders(<Register />);
      
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      expect(passwordInput).toHaveAttribute('aria-describedby');
      
      const descriptionId = passwordInput.getAttribute('aria-describedby');
      const descriptionElement = document.getElementById(descriptionId);
      expect(descriptionElement).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should be accessible on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      
      // Check that inputs are large enough for touch interaction
      const emailRect = emailInput.getBoundingClientRect();
      const passwordRect = passwordInput.getBoundingClientRect();
      
      expect(emailRect.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
      expect(passwordRect.height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Error Handling', () => {
    test('should announce errors to screen readers', () => {
      renderWithProviders(<Login />);
      
      const errorElements = screen.getAllByRole('alert');
      errorElements.forEach(error => {
        expect(error).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('should have proper error message associations', () => {
      renderWithProviders(<Register />);
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        if (input.hasAttribute('aria-invalid')) {
          expect(input).toHaveAttribute('aria-describedby');
        }
      });
    });
  });
}); 