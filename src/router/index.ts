import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import AddRequest from '@/views/AddRequest.vue';
import AdminContentManager from '@/views/admin/ContentManager.vue';
import ContentPlayer from '@/views/ContentPlayer.vue';
import { useUserStore } from '@/stores/useUserStore';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
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

// Middleware global pour gérer les autorisations admin
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;
  const isAdmin = userStore.isAdmin;

  // @ts-ignore
  if (to.meta.requiresAdmin && (!isAuthenticated || !isAdmin)) {
    console.warn('Accès refusé : Utilisateur non admin ou non authentifié');
    return next({ name: 'Login' });
  }

  next();
});

export default router;
