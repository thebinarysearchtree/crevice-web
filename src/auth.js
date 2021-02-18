import React, { useContext, createContext, useState } from 'react';

const authContext = createContext();

const useAuth = () => useContext(authContext);

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useProvideAuth() {
  const [user, setUser] = useState(null);

  return {
    user
  };
}

export {
  useAuth,
  ProvideAuth
};
