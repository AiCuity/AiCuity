import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RSVPStreamData {
  type: 'word' | 'control' | 'state';
  sessionId: string;
  timestamp: number;
  data: {
    currentWordIndex?: number;
    word?: {
      full: string;
      before: string;
      highlight: string;
      after: string;
    };
    wpm?: number;
    effectiveWpm?: number;
    complexity?: number;
    isPlaying?: boolean;
    progress?: number;
    totalWords?: number;
    command?: string;
  };
}

interface UseRSVPWebSocketOptions {
  contentId?: string;
  enabled?: boolean;
  onConnectionStatusChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
}

export function useRSVPWebSocket({
  contentId,
  enabled = false,
  onConnectionStatusChange,
  onError
}: UseRSVPWebSocketOptions) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // Clean up function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (isConnectedRef.current) {
      isConnectedRef.current = false;
      onConnectionStatusChange?.(false);
    }
  }, [onConnectionStatusChange]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!enabled || !contentId || !user?.id || wsRef.current) {
      return;
    }

    try {
      // Get WebSocket token from API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rsvp-stream/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          contentId: contentId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get WebSocket token: ${response.statusText}`);
      }

      const { token, sessionId, websocketUrl } = await response.json();
      sessionIdRef.current = sessionId;

      // Create WebSocket connection
      const wsUrl = `${websocketUrl}?token=${token}&sessionId=${sessionId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔗 RSVP WebSocket connected');
        isConnectedRef.current = true;
        onConnectionStatusChange?.(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 RSVP WebSocket disconnected:', event.code, event.reason);
        isConnectedRef.current = false;
        onConnectionStatusChange?.(false);
        wsRef.current = null;

        // Attempt reconnection if not a normal close and still enabled
        if (enabled && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ RSVP WebSocket error:', error);
        const wsError = new Error('WebSocket connection error');
        onError?.(wsError);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Error connecting to RSVP WebSocket:', error);
      onError?.(error as Error);
    }
  }, [enabled, contentId, user?.id, onConnectionStatusChange, onError]);

  // Send RSVP data to connected AR glasses
  const streamRSVPData = useCallback((data: {
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
  }) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !sessionIdRef.current) {
      return false;
    }

    const streamData: RSVPStreamData = {
      type: 'word',
      sessionId: sessionIdRef.current,
      timestamp: Date.now(),
      data
    };

    try {
      wsRef.current.send(JSON.stringify(streamData));
      return true;
    } catch (error) {
      console.error('Error sending RSVP data:', error);
      return false;
    }
  }, []);

  // Send control commands
  const sendControlCommand = useCallback((command: string, data?: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !sessionIdRef.current) {
      return false;
    }

    const streamData: RSVPStreamData = {
      type: 'control',
      sessionId: sessionIdRef.current,
      timestamp: Date.now(),
      data: {
        command,
        ...data
      }
    };

    try {
      wsRef.current.send(JSON.stringify(streamData));
      return true;
    } catch (error) {
      console.error('Error sending control command:', error);
      return false;
    }
  }, []);

  // Connect when enabled
  useEffect(() => {
    if (enabled && contentId && user?.id) {
      connect();
    } else {
      cleanup();
    }

    return cleanup;
  }, [enabled, contentId, user?.id, connect, cleanup]);

  // Send heartbeat every 30 seconds
  useEffect(() => {
    if (!enabled) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [enabled]);

  return {
    isConnected: isConnectedRef.current,
    streamRSVPData,
    sendControlCommand,
    connect,
    disconnect: cleanup
  };
} 