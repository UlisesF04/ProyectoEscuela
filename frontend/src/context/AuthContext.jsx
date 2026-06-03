import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const data = await authService.login(email, password);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, token: null },
      });
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error al iniciar sesión';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors (token may already be invalid)
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await authService.getMe();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: null },
        });
      } catch {
        dispatch({ type: 'LOGOUT' });
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
