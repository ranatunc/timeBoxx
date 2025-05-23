import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ChannelContext = createContext();

export const ChannelProvider = ({ children }) => {
  const [activeChannelId, setActiveChannelId] = useState(null);

  useEffect(() => {
    const fetchActiveChannel = async () => {
      const storedChannel = await AsyncStorage.getItem('activeChannel');
      if (storedChannel) {
        setActiveChannelId(storedChannel);
      }
    };
    fetchActiveChannel();
  }, []);

  const loginToChannel = async (channelId) => {
    await AsyncStorage.setItem('activeChannel', channelId);
    setActiveChannelId(channelId);
  };

  const logoutFromChannel = async () => {
    await AsyncStorage.removeItem('activeChannel');
    setActiveChannelId(null);
  };

  return (
    <ChannelContext.Provider value={{ activeChannelId, loginToChannel, logoutFromChannel }}>
      {children}
    </ChannelContext.Provider>
  );
};
