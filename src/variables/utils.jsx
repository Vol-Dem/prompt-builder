export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const saveToStorage = (key, data) => {
  window.sessionStorage.setItem(key, JSON.stringify(data));
};

export const uploadStorage = (key) => {
  const storageData = window.sessionStorage?.getItem(key);
  return storageData ? JSON.parse(storageData) : null;
};

export const removeFromStorage = (key) => {
  window.sessionStorage.removeItem(key);
};

export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const uploadLocalStorage = (key) => {
  const storageData = localStorage?.getItem(key);
  return storageData ? JSON.parse(storageData) : null;
};

export const removeFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};
