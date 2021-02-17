import React, { useContext, createContext, useState } from 'react';

const clientContext = createContext();

const useClient = () => useContext(clientContext);

function ProvideClient({ children }) {
  const client = useProvideClient();
  return (
    <clientContext.Provider value={client}>
      {children}
    </clientContext.Provider>
  );
}

function useProvideClient() {
  const [user, setUser] = useState(localStorage.getItem('user'));

  const refreshToken = async () => {
    const token = user ? user.token : '';
    const response = await fetch('/users/refreshToken', {
      body: JSON.stringify({ token }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', user);
      setUser(user);
      return true;
    }
    else {
      return false;
    }
  };

  const postData = async (url, data) => {
    const token = user ? user.token : '';
    for (let i = 0; i < 2; i++) {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        method: 'POST'
      }); 
      if (response.ok) {
        return response;
      }
      else if (response.status === 401) {
        if (i === 0) {
          await refreshToken();
        }
        else {
          setUser(null);
          return response;
        }
      }
      else {
        return response;
      }
    }
  };

  const getData = async (url) => {
    const token = user ? user.token : '';
    for (let i = 0; i < 2; i++) {
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'content-type': 'application/json'
        },
        method: 'GET'
      });
      if (response.ok) {
        return response;
      }
      else if (response.status === 401) {
        if (i === 0) {
          await refreshToken();
        }
        else {
          setUser(null);
          return response;
        }
      }
      else {
        return response;
      }  
    }
  };

  const logIn = async (email, password) => {
    const response = await fetch('/users/getToken', {
      body: JSON.stringify({ email, password }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });
    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', user);
      setUser(user);
      return user;
    }
    else if (response.status === 401) {
      setUser(null);
      return null;
    }
    else {
      return null;
    }
  };
  
  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    refreshToken,
    postData,
    getData,
    logIn,
    signOut
  };
}

export {
  useClient,
  ProvideClient
};
