import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';

export const useRefreshToken = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);

  const refreshToken = async () => {
    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Make the refresh token request
      const response = await api.post<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>('/auth/refresh', { refresh_token: refreshToken });

      const { access_token, refresh_token, token_type, expires_in } = response;

      // Update the tokens in the store
      setTokens({
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenType: token_type,
        expiresIn: expires_in
      });

      return access_token;
    } catch (error) {
      // If refresh fails, clear auth
      useAuthStore.getState().clearAuth();
      throw error;
    }
  };

  return { refreshToken };
};

export default useRefreshToken;
