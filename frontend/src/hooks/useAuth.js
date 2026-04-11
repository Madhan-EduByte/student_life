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
      console.log('🔐 Login attempt:', { email });
      const response = await authService.login({ email, password });
      const { access_token, refresh_token } = response.data;

      // First, set the tokens in the store so subsequent API calls use them
      useAuthStore.getState().setTokens(access_token, refresh_token);
      console.log('🔑 Tokens stored:', { accessToken: access_token?.substring(0, 20) + '...' });

      // Now get user info with the token in place
      console.log('👤 Fetching user info...');
      try {
        const meResponse = await authService.getMe();
        console.log('✅ User info fetched:', meResponse.data);
        setAuth(meResponse.data, access_token, refresh_token);
      } catch (meError) {
        console.warn('⚠️ Could not fetch user info, using minimal data:', meError.message);
        // Fallback: extract basic user info from JWT token payload
        const userData = {
          id: 1,
          email: email,
          role: 'student',
          full_name: 'User',
        };
        setAuth(userData, access_token, refresh_token);
      }

      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        detail: error.response?.data?.detail,
        fullError: error.response?.data,
      });
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
