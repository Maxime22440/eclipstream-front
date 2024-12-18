import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import AddRequest from '@/views/AddRequest.vue';
import AdminContentManager from '@/views/admin/ContentManager.vue'
import ContentPlayer from '@/views//ContentPlayer3.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/add-request',
        name: 'AddRequest',
        component: AddRequest
    },
    {
        path: '/Admin-content-manager',
        name: 'AdminContentManager',
        component: AdminContentManager,
        meta: { requiresAdmin: true },
    },
    {
      path: '/content-player/:uuid',
      name: 'ContentPlayer',
      component: ContentPlayer,
      props: true,
    },
    {
      path: '/content-player/:contentUuid/episode/:episodeUuid',
      name: 'EpisodePlayer',
      component: ContentPlayer,
      props: true,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
