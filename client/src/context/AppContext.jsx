import { createContext } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const initialState = {
    user: null,
  };

  return (
    <AppContext.Provider value={initialState}>
      {children}
    </AppContext.Provider>
  );
};