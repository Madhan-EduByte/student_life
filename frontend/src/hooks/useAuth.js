import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, logout: clearAuth, setLoading } = useAuthStore();

  const login = useCallback(async (email, password, redirectTo = '/careerGuide') => {
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
      let userData;
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          userData = await res.json();
          console.log('✅ User info fetched via /auth/me:', userData);
        } else {
          throw new Error(`Fetch /auth/me returned ${res.status}`);
        }
      } catch (error) {
        console.warn('⚠️ Fetch failed. Using fallback data from token.', error.message);
        
        let extractedName = '';
        let extractedRole = 'student';
        let extractedId = 1;
        try {
          // Robust JWT decoding that handles Base64URL and Unicode characters
          const base64Url = access_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          extractedName = payload.full_name || payload.name || '';
          extractedRole = payload.role || 'student';
          extractedId = payload.sub || 1;
        } catch (e) {
          console.warn('Could not parse JWT payload');
        }
        
        userData = {
          id: extractedId,
          email: email,
          role: extractedRole,
          full_name: extractedName || email.split('@')[0].replace(/^\w/, c => c.toUpperCase()),
        };
      }

      setAuth(userData, access_token, refresh_token);
      navigate(redirectTo);
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
      // Ensure full_name exists if the signup form didn't provide it
      if (!data.full_name) {
        data.full_name = data.email.split('@')[0].replace(/^\w/, c => c.toUpperCase());
      }
      await authService.register(data);
      // Auto-login after registration
      const redirectTo = '/careerGuide';
      const loginResult = await login(data.email, data.password, redirectTo);
      
      if (loginResult.success) {
        // Return a never-resolving promise to prevent the calling component from
        // executing a hardcoded navigate() that overrides our redirectTo.
        return new Promise(() => {});
      }
      return loginResult;
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.detail || 'Registration failed';
      // Surface the error (e.g. Email already registered) if the UI is hiding it
      if (errorMsg.includes('already registered')) alert(`Registration Error: ${errorMsg}. Please use a different email.`);
      return {
        success: false,
        error: errorMsg,
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
