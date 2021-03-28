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
  return response;
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
  return response;
};

const uploadFiles = async (files) => {
  const token = await getToken();
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  const response = await fetch('/files/uploadFiles', {
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    method: 'POST'
  });
  return response;
}

const uploadPhotos = async (photos) => {
  const token = await getToken();
  const formData = new FormData();
  photos.forEach(photo => formData.append('photos', photo));
  const response = await fetch('/files/uploadPhotos', {
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
    user = updatedUser;
    return user;
  }
  return null;
};

const signOut = () => {
  localStorage.removeItem('user');
};

export default {
  getToken,
  refreshToken,
  postData,
  getData,
  uploadFiles,
  uploadPhotos,
  logIn,
  signOut
};
