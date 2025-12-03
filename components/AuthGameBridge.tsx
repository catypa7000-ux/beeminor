/**
 * Bridge component that connects AuthContext to GameContext
 * Syncs user ID between authentication and game state
 */
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

export function AuthGameBridge() {
  const { currentUser, isAuthenticated } = useAuth();
  const { setUserId } = useGame();

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const shouldSkipAuth = isDevelopment;

    if (shouldSkipAuth) {
      // In development mode, use a mock user ID
      setUserId('dev_user_123');
      return;
    }

    if (isAuthenticated && currentUser?.id) {
      // Set user ID in GameContext when user is authenticated
      setUserId(currentUser.id);
    } else {
      // Clear user ID when user logs out
      setUserId(null);
    }
  }, [currentUser?.id, isAuthenticated, setUserId]);

  // This component doesn't render anything
  return null;
}

