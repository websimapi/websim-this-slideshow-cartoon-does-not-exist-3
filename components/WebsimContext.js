import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WebsimContext = createContext();

export const WebsimProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [creatorUsername, setCreatorUsername] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const roomRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize WebsimSocket
        const roomInstance = new WebsimSocket();
        roomRef.current = roomInstance;
        setRoom(roomInstance);
        
        // Get creator username
        const creator = await window.websim.getCreatedBy();
        setCreatorUsername(creator.username);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize WebsimSocket:', error);
      }
    };
    
    init();
    
    return () => {
      if (roomRef.current) {
        // Cleanup if needed
      }
    };
  }, []);

  return (
    <WebsimContext.Provider value={{ 
      room: roomRef.current, 
      creatorUsername, 
      isLoaded 
    }}>
      {children}
    </WebsimContext.Provider>
  );
};

export const useWebsim = () => {
  const context = useContext(WebsimContext);
  if (!context) {
    throw new Error('useWebsim must be used within a WebsimProvider');
  }
  return context;
};

