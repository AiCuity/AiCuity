import { useState, useEffect, useCallback } from 'react';

interface AugmentOSConfig {
  serverUrl: string;
  enabled: boolean;
}

interface SessionStatus {
  sessionId: string;
  isReading: boolean;
  currentWord: string;
  progress: number;
  wpm: number;
}

interface RSVPStreamData {
  currentWordIndex: number;
  word: {
    full: string;
    before: string;
    highlight: string;
    after: string;
  };
  wpm: number;
  effectiveWpm: number;
  complexity: number;
  isPlaying: boolean;
  progress: number;
  totalWords: number;
}

export function useAugmentOSIntegration(config: AugmentOSConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionStatus[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check server connection through AiCuity backend
  const checkConnection = useCallback(async () => {
    if (!config.enabled) {
      setIsConnected(false);
      return;
    }

    try {
      // Check AugmentOS status through AiCuity backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rsvp-stream/sessions`);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.augmentOSStatus === 'healthy');
        setConnectionError(data.augmentOSStatus === 'healthy' ? null : 'AugmentOS server unavailable');
        
        // Update active sessions count
        const sessionCount = data.activeSessions || 0;
        const mockSessions: SessionStatus[] = Array.from({ length: sessionCount }, (_, i) => ({
          sessionId: `session-${i + 1}`,
          isReading: true,
          currentWord: '',
          progress: 0,
          wpm: 300
        }));
        setActiveSessions(mockSessions);
      } else {
        setIsConnected(false);
        setConnectionError('Failed to reach AugmentOS through backend');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError('Failed to connect to AugmentOS server');
      console.error('AugmentOS connection error:', error);
    }
  }, [config.enabled]);

  // Get active sessions through backend
  const fetchActiveSessions = useCallback(async () => {
    if (!isConnected) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rsvp-stream/sessions`);
      if (response.ok) {
        const data = await response.json();
        const sessionCount = data.activeSessions || 0;
        const mockSessions: SessionStatus[] = Array.from({ length: sessionCount }, (_, i) => ({
          sessionId: `session-${i + 1}`,
          isReading: true,
          currentWord: '',
          progress: 0,
          wpm: 300
        }));
        setActiveSessions(mockSessions);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  }, [isConnected]);

  // Stream RSVP data through AiCuity backend to AugmentOS
  const streamRSVPData = useCallback(async (data: RSVPStreamData) => {
    if (!isConnected || activeSessions.length === 0) {
      return;
    }

    try {
      // Stream data through AiCuity backend to AugmentOS server
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rsvp-stream/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          userId: 'current_user', // TODO: Get from auth context
          contentId: 'current_content', // TODO: Get from reading context
          rsvpData: data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Update session count from response
        const sessionCount = result.activeSessions || 0;
        const mockSessions: SessionStatus[] = Array.from({ length: sessionCount }, (_, i) => ({
          sessionId: `session-${i + 1}`,
          isReading: true,
          currentWord: data.word.full,
          progress: data.progress,
          wpm: data.wpm
        }));
        setActiveSessions(mockSessions);
      }
    } catch (error) {
      console.error('Error streaming RSVP data:', error);
      setConnectionError('Failed to stream data to AR glasses');
    }
  }, [isConnected, activeSessions]);

  // Send control command to specific session
  const sendControlCommand = useCallback(async (sessionId: string, command: string, data?: any) => {
    if (!isConnected || !config.serverUrl) return;

    try {
      const response = await fetch(`${config.serverUrl}/api/session/${sessionId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, data })
      });

      if (!response.ok) {
        throw new Error('Failed to send control command');
      }
    } catch (error) {
      console.error('Error sending control command:', error);
    }
  }, [isConnected, config.serverUrl]);

  // Get session status
  const getSessionStatus = useCallback(async (sessionId: string): Promise<SessionStatus | null> => {
    if (!isConnected || !config.serverUrl) return null;

    try {
      const response = await fetch(`${config.serverUrl}/api/session/${sessionId}/status`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting session status:', error);
    }
    return null;
  }, [isConnected, config.serverUrl]);

  // Periodic connection check and session refresh
  useEffect(() => {
    if (!config.enabled) return;

    checkConnection();
    
    const interval = setInterval(() => {
      checkConnection();
      if (isConnected) {
        fetchActiveSessions();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [config.enabled, checkConnection, fetchActiveSessions, isConnected]);

  // Initial session fetch when connected
  useEffect(() => {
    if (isConnected) {
      fetchActiveSessions();
    }
  }, [isConnected, fetchActiveSessions]);

  return {
    isConnected,
    activeSessions,
    connectionError,
    streamRSVPData,
    sendControlCommand,
    getSessionStatus,
    refreshSessions: fetchActiveSessions,
    checkConnection
  };
} 