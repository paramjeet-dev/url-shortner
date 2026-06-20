import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedAccess = localStorage.getItem('token');
    const storedRefresh = localStorage.getItem('refresh_token');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  };

  const updateTokens = (newAccessToken, newRefreshToken) => {
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      localStorage.setItem('token', newAccessToken);
    }
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem('refresh_token', newRefreshToken);
    }
  };

  // Utility to check if user is admin
  const isAdmin = user?.isAdmin || false;

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    logout,
    updateTokens,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};