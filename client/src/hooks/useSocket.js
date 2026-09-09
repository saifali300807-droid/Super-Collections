import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected');
      setConnected(true);
      // Join the general updates room
      socketRef.current.emit('join-room', 'updates');
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { socket: socketRef.current, connected, on, off, emit };
}

// Hook for real-time product updates
export function useProductUpdates(onUpdate) {
  const { on, off } = useSocket();

  useEffect(() => {
    if (!onUpdate) return;

    const handleProductUpdate = (data) => {
      onUpdate('product', data);
    };

    on('product:created', handleProductUpdate);
    on('product:updated', handleProductUpdate);
    on('product:deleted', handleProductUpdate);
    on('settings:updated', (data) => onUpdate('settings', data));

    return () => {
      off('product:created', handleProductUpdate);
      off('product:updated', handleProductUpdate);
      off('product:deleted', handleProductUpdate);
      off('settings:updated', handleProductUpdate);
    };
  }, [on, off, onUpdate]);
}