import api from '@/plugins/axios';

// Fonction pour le login
export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
        email,
        password,
    });
    return response.data; // Retourne les données de la réponse
};

// Fonction pour l'inscription (register)
export const register = async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
        username,
        email,
        password,
    });
    return response.data;
};

// Fonction pour la déconnexion
export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
    }
};
