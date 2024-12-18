import axiosLib from 'axios'
import Cookies from 'js-cookie'

const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
})
console.log('Axios baseURL:', axios.defaults.baseURL);

axios.defaults.withCredentials  = true // allow sending cookies

axios.interceptors.request.use((config) => {
  // Ajouter le token CSRF aux en-têtes si disponible
  const csrfToken = Cookies.get('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

export default axios
