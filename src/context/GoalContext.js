import React, { createContext, useState } from 'react';

export const GoalsContext = createContext();

export const GoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);

  return (
    <GoalsContext.Provider value={{ goals, setGoals }}>
      {children}
    </GoalsContext.Provider>
  );
};
