import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Ajout du token dans les headers axios si présent
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Vérification du token au premier chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token: state.token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Session expirée. Veuillez vous reconnecter.'
          });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Connexion
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await axios.post('/api/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      });
      return { success: false, error: message };
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await axios.post('/api/auth/register', userData);
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const fallback = 'Erreur d\'inscription';
      const message = error.response?.data?.message || fallback;
      const details = error.response?.data?.errors?.map(e => e.msg).join(', ');
      dispatch({
        type: 'AUTH_FAILURE',
        payload: details || message
      });
      return { success: false, error: details || message };
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de mise à jour';
      return { success: false, error: message };
    }
  };

  // Réinitialiser l’erreur
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
