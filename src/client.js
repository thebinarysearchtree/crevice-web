let token = localStorage.getItem('token');
let isLoggedIn = token != null;

const getIsLoggedIn = () => isLoggedIn;

const refreshToken = async () => {
  const response = await fetch('/users/refreshToken', {
    body: JSON.stringify({ token }),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  });
  if (response.ok) {
    const data = await response.json();
    token = data.token;
    localStorage.setItem('token', token);
    return true;
  }
  else {
    return false;
  }
};

const postData = async (url, data) => {
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
      if (response.headers.get('content-type') === 'application/json; charset=utf-8') {
        return await response.json();
      }
      return true;
    }
    else if (response.status === 401) {
      if (i === 0) {
        await refreshToken();
      }
      else {
        isLoggedIn = false;
        return false;
      }
    }
    else {
      return false;
    }
  }
};

const getData = async (url) => {
  for (let i = 0; i < 2; i++) {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'content-type': 'application/json'
      },
      method: 'GET'
    });
    if (response.ok) {
      return await response.json();
    }
    else if (response.status === 401) {
      if (i === 0) {
        await refreshToken();
      }
      else {
        isLoggedIn = false;
        return false;
      }
    }
    else {
      return false;
    }  
  }
};

const checkEmailExists = async (email) => {
  const response = await fetch('/users/checkEmailExists', {
    body: JSON.stringify({ email }),
    headers: {
      'content-type': 'application/json'
    },
    method: 'GET'
  });
  if (response.ok) {
    const result = await response.json();
    return { exists: result.exists };
  }
  else {
    return false;
  }
};

const signUp = async (user) => {
  const response = await fetch('/users/signUp', {
    body: JSON.stringify(user),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  });
  return response.ok;
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
    const result = await response.json();
    token = result.token;
    localStorage.setItem('token', token);
    isLoggedIn = true;
    return true;
  }
  else if (response.status === 401) {
    isLoggedIn = false;
    return false;
  }
  else {
    return false;
  }
};

const signOut = () => {
  token = null;
  localStorage.removeItem('token');
  isLoggedIn = false;
};

const client = { 
  getIsLoggedIn,
  postData,
  getData,
  checkEmailExists,
  signUp,
  logIn,
  signOut
};

export default client;