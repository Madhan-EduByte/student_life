import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout: clearAuth, setLoading } = useAuthStore();

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const { access_token, refresh_token } = response.data;

      const meResponse = await authService.getMe();
      setAuth(meResponse.data, access_token, refresh_token);

      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuth, setLoading]);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      await authService.register(data);
      // Auto-login after registration
      return await login(data.email, data.password);
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  }, [login, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth();
      navigate('/');
    }
  }, [clearAuth, navigate]);

  return { user, isAuthenticated, login, register, logout };
}

export default useAuth;
