import {ref, computed} from 'vue';
import {register, logout, login} from '@/api/auth';
import {useUserStore} from '@/stores/useUserStore';
import {useNotificationStore} from '@/stores/useNotificationStore';
import api from '@/plugins/axios';

export function useAuth() {
  const error = ref<string | null>(null);
  const validationErrors = ref<{ [key: string]: string[] }>({});
  const loading = ref(false);
  const userStore = useUserStore();
  const notificationStore = useNotificationStore();

  const handleApiError = (err: any) => {
    if (err.response) {
      const status = err.response.status;

      // Gestion de l'erreur 404 pour un email inexistant
      if (status === 404) {
        error.value = 'Cet email n\'existe pas dans nos enregistrements.';
        notificationStore.addNotification('error', error.value);

        // Gestion des erreurs de validation 422
      } else if (status === 422) {
        validationErrors.value = err.response.data.errors;

        // Gestion de l'erreur 401 pour des identifiants incorrects
      } else if (status === 401) {
        error.value = 'Identifiants incorrects. Veuillez réessayer.';
        notificationStore.addNotification('error', error.value);

        // Gestion de l'erreur 429 pour trop de tentatives
      } else if (status === 429) {
        error.value = 'Trop de tentatives. Veuillez réessayer dans une minute.';
        notificationStore.addNotification('error', error.value);

        // Gestion générique pour les autres erreurs
      } else {
        error.value = 'Une erreur est survenue. Veuillez réessayer plus tard.';
        notificationStore.addNotification('error', <string>error.value);
      }
    } else {
      error.value = 'Erreur de connexion au serveur. Veuillez vérifier votre réseau.';
      notificationStore.addNotification('error', <string>error.value);
    }
  };

  const loginUser = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    validationErrors.value = {};

    try {
      // Étape 1 : Envoyer les identifiants pour le login
      const response = await login(email, password);
      const responseData = response.data || response; // Si pas de data, utiliser directement response
      console.log('Données extraites de la réponse :', responseData);

      // Étape 2 : Récupérer le token
      const token = responseData.token;
      if (token) {
        localStorage.setItem('auth_token', token);
        // Étape 3 : Récupérer les informations utilisateur après le login
        const userResponse = await api.get('/user');
        console.log('Données utilisateur récupérées :', userResponse.data);

        // Étape 4 : Enregistrer les informations utilisateur dans le store
        userStore.setUser(userResponse.data);
        console.log('Utilisateur après setUser:', userStore.user);
      } else {
        throw new Error('Token absent dans la réponse');
      }
    } catch (err: any) {
      // Gestion des erreurs
      handleApiError(err);
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const registerUser = async (username: string, email: string, password: string) => {
    loading.value = true;
    error.value = null;
    validationErrors.value = {}; // Réinitialiser les erreurs
    try {
      const data = await register(username, email, password);
      userStore.setUser(data.user);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      loading.value = false;
    }
  };

  const isAuthenticated = computed(() => {
    return !!userStore.user;
  });

  const isSuperAdmin = computed(() => {
    // @ts-ignore
    return userStore.user?.is_admin === 1;
  });

  // Fonction de déconnexion
  const logoutUser = async () => {
    try {
      await logout(); // Essaie de déconnecter sur le serveur
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.warn('Le token est expiré ou invalide. Déconnexion forcée.');
        // Afficher une notification d'avertissement si le token est invalide
        notificationStore.addNotification('error', 'Déconnexion forcée, votre session avait expiré.');
        throw new Error('401 Unauthorized');
      } else {
        console.error('Erreur lors de la déconnexion:', err);
        // Afficher une notification d'erreur si une autre erreur survient
        notificationStore.addNotification('error', 'Erreur lors de la déconnexion.');
        throw new Error('Déconnexion échouée');
      }
    } finally {
      await userStore.clearUser();
      localStorage.removeItem('auth_token');
    }
  };


  return {
    error,
    loading,
    validationErrors,
    loginUser,
    registerUser,
    isAuthenticated,
    isSuperAdmin,
    logoutUser,
  };
}
