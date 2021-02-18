let user = JSON.parse(localStorage.getItem('user'));

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
    const updatedUser = await response.json();
    localStorage.setItem('user', JSON.stringify(updatedUser));
    user = updatedUser;
  }
};

const postData = async (url, data) => {
  for (let i = 0; i < 2; i++) {
    const token = user ? user.token : '';
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
        user = null;
        return response;
      }
    }
    else {
      return response;
    }
  }
};

const getData = async (url) => {
  for (let i = 0; i < 2; i++) {
    const token = user ? user.token : '';
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
        user = null;
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
  refreshToken,
  postData,
  getData,
  logIn,
  signOut
};
