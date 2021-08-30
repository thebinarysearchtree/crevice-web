const cache = new Map();

const makeKey = (url, data) => `${url} ${JSON.stringify(data)}`;

const set = (url, data, response) => {
  const key = makeKey(url, data);
  cache.set(key, response);
}

const get = (url, data) => {
  const key = makeKey(url, data);
  return cache.get(key);
}

const has = (url, data) => {
  const key = makeKey(url, data);
  return cache.has(key);
}

const clear = () => cache.clear();

export default {
  set,
  get,
  has,
  clear
};
