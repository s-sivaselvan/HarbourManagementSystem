import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user) {
      socketRef.current = io('https://harbourmanagementbackend.onrender.com');
      const socket = socketRef.current;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('joinRoom', user.role);
      });
      socket.on('disconnect', () => setConnected(false));

      // Real-time event handlers
      socket.on('dockingRequestCreated', ({ shipName }) => {
        toast('📋 New docking request for ' + shipName, { icon: '⚓' });
      });
      socket.on('dockingApproved', ({ shipName, berthNumber }) => {
        toast.success(`✅ ${shipName} approved — Berth ${berthNumber}`);
      });
      socket.on('dockingRejected', ({ shipName }) => {
        toast.error(`❌ Docking request rejected for ${shipName}`);
      });
      socket.on('cargoStatusUpdated', ({ status }) => {
        toast(`📦 Cargo status updated to: ${status}`, { icon: '🚢' });
      });

      return () => socket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
