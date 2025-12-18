import { createContext, useState, useContext, useEffect } from 'react';
import LoginModal from '../components/LoginModal.jsx';
import SuccessAlert from '../components/SuccessAlert';
import { login as loginApi, register as registerApi, googleAuth } from '../api/authApi';
import { getProfile } from '../api/userApi';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Try to get user profile
      getProfile()
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await loginApi({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async (credential) => {
    try {
      const response = await googleAuth(credential);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google authentication failed. Please try again.');
    }
  };

  const showAlertMessage = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const oauthLogin = async (provider) => {
    if (provider === 'Google') {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await handleGoogleSignIn(response.credential);
              if (showLogin) closeLoginModal();
            } catch (err) {
              showAlertMessage(err.message, 'error');
            }
          },
        });
        window.google.accounts.id.prompt();
      } else {
        showAlertMessage('Google Sign-In is not available. Please check your configuration.', 'error');
      }
    } else {
      showAlertMessage(`${provider} login is not implemented yet. Please use email/password login.`, 'error');
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const response = await registerApi({ name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const openLoginModal = () => setShowLogin(true);
  const closeLoginModal = () => setShowLogin(false);

  const requireAuth = callback => {
    if (user) {
      callback?.();
      return true;
    }
    openLoginModal();
    return false;
  };

  const handleLoginSubmit = async data => {
    try {
      await login({ email: data.email, password: data.password });
      closeLoginModal();
      showAlertMessage('Login successful! Welcome back.', 'success');
    } catch (err) {
      showAlertMessage(err.message, 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, openLoginModal, closeLoginModal, requireAuth, register, oauthLogin, loading, isAdmin: user?.isAdmin || false }}
    >
      {children}
      <LoginModal
        open={showLogin}
        onClose={closeLoginModal}
        onSubmit={handleLoginSubmit}
        onGoogle={() => {
          oauthLogin('Google');
          closeLoginModal();
        }}
        onApple={() => {
          oauthLogin('Apple');
          closeLoginModal();
        }}
        onSwitchToRegister={() => {
          closeLoginModal();
          window.location.assign('/register');
        }}
      />
      <SuccessAlert
        message={alertMessage}
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertType}
      />
    </AuthContext.Provider>
  );
};
