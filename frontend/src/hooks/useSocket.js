import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../store/useStore';

export const useSocket = () => {
  const socketRef = useRef(null);
  const updateTableStatus = useStore((state) => state.updateTableStatus);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'https://letoilehorizon.onrender.com', {
      transports: ['websocket'],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🌌 Sync: Synced with L\'Étoile Horizon real-time stream.');
      socket.emit('joinReservations');
    });

    socket.on('tableStatusChanged', (data) => {
      console.log('⚡ Event: Real-time table state change broadcast received:', data);
      const { tableId, status, booking } = data;
      updateTableStatus(tableId, status, booking);
    });

    socket.on('disconnect', () => {
      console.log('👋 Sync: Decoupled from Socket.io server.');
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [updateTableStatus]);

  const emitTableBooking = (tableId, zone, booking) => {
    if (socketRef.current) {
      socketRef.current.emit('tableStatusChanged', { tableId, ambienceZone: zone, status: 'reserved', booking });
    }
  };

  return { socket: socketRef.current, emitTableBooking };
};
