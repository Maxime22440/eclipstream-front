import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
    username: string;
    email: string;
    is_admin: number;
}

export const useUserStore = defineStore('user', () => {
    const user = ref<User | null>(null);

    // Charger les informations utilisateur depuis le stockage local au démarrage
    const loadUserFromStorage = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user.value = JSON.parse(storedUser);
            console.log('Utilisateur chargé depuis le stockage:', user.value);
        }
    };

    // Charger les données utilisateur lors de l'initialisation du store
    loadUserFromStorage();

    // Setter pour définir l'utilisateur
    const setUser = (userData: User) => {
        user.value = userData;
        console.log('Utilisateur enregistré dans le store:', user.value);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Fonction pour déconnecter l'utilisateur
    const clearUser = async () => {
        user.value = null;
        localStorage.removeItem('user');
    };


    // Getters pour vérifier si l'utilisateur est authentifié et s'il est Admin
    const isAuthenticated = computed(() => user.value !== null);
    // @ts-ignore
    const isAdmin = computed(() => user.value?.is_admin === 1);

    return {
        user,
        isAuthenticated,
        isAdmin,
        setUser,
        clearUser,
        loadUserFromStorage,
    };
});
