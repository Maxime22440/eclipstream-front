// Fonction pour récupérer les genres (utilisée pour tous les types de contenu)
import api from '@/plugins/axios';
export const fetchGenres = async () => {
    try {
        console.log('Envoi de la requête pour récupérer les genres');

        const response = await api.get('/genres');
        console.log('Genres récupérés:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des genres', error);
        throw error;
    }
};
