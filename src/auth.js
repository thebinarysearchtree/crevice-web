import React, { useContext, createContext, useState, useRef } from 'react';
import cache from './cache';

const authContext = createContext();

const useClient = () => useContext(authContext);

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useProvideAuth() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [mutationCount, setMutationCount] = useState(0);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const ref = useRef(null);

  const tokenHasExpired = () => {
    if (Date.now() < (user.expiry - (1000 * 60 * 5))) {
      return false;
    }
    return true;
  }

  const getToken = async () => {
    let token = '';
    if (user) {
      if (tokenHasExpired()) {
        token = await refreshToken();
      }
      else {
        token = user.token;
      }
    }
    return token;
  }

  const refreshToken = async () => {
    const response = await fetch('/users/refreshToken', {
      body: JSON.stringify({ token: user.token }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });
    if (response.ok) {
      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser.token;
    }
    return null;
  };

  const postData = async (url, data, token) => {
    if (!token) {
      token = await getToken();
    }
    const response = await fetch(url, {
      body: data ? JSON.stringify(data) : null,
      headers: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      method: 'POST'
    });
    return response;
  };

  const postMutation = async ({ url, data, message }) => {
    setProcessing(true);
    const response = await postData(url, data);
    setProcessing(false);
    if (response.ok) {
      const { rowCount } = await response.json();
      if (rowCount !== 0) {
        cache.clear();
        setMutationCount(count => count + 1);
        if (message !== undefined) {
          setMessage(message);
        }
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const getData = async (url, token) => {
    if (!token) {
      token = await getToken();
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      },
      method: 'GET'
    });
    return response;
  };

  const uploadFiles = async (url, files) => {
    const token = await getToken();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const response = await fetch(url, {
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: 'POST'
    });
    return response;
  }

  const logIn = async (email, password) => {
    const response = await fetch('/users/getToken', {
      body: JSON.stringify({ email, password }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });
    if (response.ok) {
      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    }
    return null;
  };

  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    mutationCount,
    setMutationCount,
    message,
    setMessage,
    processing,
    ref,
    getToken,
    postData,
    postMutation,
    getData,
    uploadFiles,
    logIn,
    signOut
  };
}

export {
  useClient,
  ProvideAuth
};
