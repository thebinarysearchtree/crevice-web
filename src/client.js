let user = JSON.parse(localStorage.getItem('user'));

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
      await refreshToken();
    }
    token = user.token;
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
    user = updatedUser;
  }
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
  if (response.ok) {
    return response;
  }
  else if (response.status === 401) {
    user = null;
    return response;
  }
  else {
    return response;
  }
};

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
  if (response.ok) {
    return response;
  }
  else if (response.status === 401) {
    user = null;
    return response;
  }
  else {
    return response;
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
    const updatedUser = await response.json();
    localStorage.setItem('user', JSON.stringify(updatedUser));
    user = updatedUser;
    return user;
  }
  else if (response.status === 401) {
    user = null;
    return null;
  }
  else {
    return null;
  }
};

const signOut = () => {
  localStorage.removeItem('user');
  user = null;
};

export default {
  getToken,
  refreshToken,
  postData,
  getData,
  logIn,
  signOut
};
