import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [aToken, setAToken] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false); 
  

  // Sincronizare automat tokenul la initializare
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) setAToken(storedToken);
    setIsAuthReady(true); 
    }, []);

  // URL backend din env
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const currencySymbol = "RON";

  //Login = salvare in  context si localStorage
  const login = (token) => {
    setAToken(token);
    localStorage.setItem("authToken", token);
  };

  // Logout = sterge din context și localStorage
  const logout = () => {
    setAToken("");
    localStorage.removeItem("authToken");
    localStorage.removeItem("role"); 
  };

  const value = {
    currencySymbol,
    aToken,
    setAToken,
    backendUrl,
    login,    
    logout,
    isAuthReady
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
