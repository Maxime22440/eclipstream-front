import './assets/css/app.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import axios from '@/plugins/axios';

const app = createApp(App);

app.component('Multiselect', Multiselect);

app.use(router);
app.use(createPinia());

axios.get('/csrf-cookie').then(() => {
  console.log('CSRF token fetched successfully.');
});

app.mount('#app');
