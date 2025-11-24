// Custom hook for Google Sign-In
import { useEffect, useRef, useState } from 'react';
import { googleAuth } from '../api/authApi';

export function useGoogleSignIn({ onSuccess, onError, buttonText = 'signin_with' }) {
  const buttonRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not configured');
      setError('Google Sign-In is not configured');
      return;
    }

    // Wait for Google script to load
    const initGoogleSignIn = () => {
      if (!window.google?.accounts?.id) {
        console.warn('Google Sign-In script not loaded');
        return;
      }

      if (!buttonRef.current) {
        return;
      }

      // Clear previous button
      buttonRef.current.innerHTML = '';

      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setError('');
              
              // Send credential to backend
              const authResponse = await googleAuth(response.credential);
              const { token, user: userData } = authResponse.data;

              // Store auth data
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(userData));

              // Call success callback
              if (onSuccess) {
                onSuccess({ token, user: userData });
              } else {
                // Default: reload page
                window.location.reload();
              }
            } catch (err) {
              const errorMessage = err.response?.data?.message || 'Google authentication failed';
              setError(errorMessage);
              console.error('Google auth error:', err);
              
              if (onError) {
                onError(err);
              }
            }
          },
        });

        // Calculate button width (responsive)
        const container = buttonRef.current.parentElement;
        const containerWidth = container?.offsetWidth || 350;
        const buttonWidth = Math.min(containerWidth - 20, 400);

        // Render button
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: buttonText,
          width: buttonWidth,
        });

        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing Google Sign-In:', err);
        setError('Failed to initialize Google Sign-In');
      }
    };

    // Check if Google is already loaded
    if (window.google?.accounts?.id) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initGoogleSignIn, 100);
      return () => clearTimeout(timer);
    } else {
      // Wait for Google script to load
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id && buttonRef.current) {
          clearInterval(checkInterval);
          initGoogleSignIn();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setError('Google Sign-In script failed to load');
        }
      }, 100);

      return () => {
        clearInterval(checkInterval);
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
        }
      };
    }
  }, [onSuccess, onError, buttonText]);

  return { buttonRef, isInitialized, error };
}



