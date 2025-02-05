import api from '@/plugins/axios';

// Fonction pour récupérer les épisodes d'une saison spécifique
export const fetchEpisodes = async (seasonId: string) => {
    try {
        console.log(`Appel de l'API pour les épisodes de la saison ID : ${seasonId}`);
        const response = await api.get(`/seasons/${seasonId}/episodes`);
        console.log('Épisodes reçus :', response.data);
        return response.data.episodes;
    } catch (error) {
        console.error('Erreur lors de la récupération des épisodes', error);
        throw error;
    }
};

// Fonction pour ajouter un nouvel épisode à une saison
export const addEpisode = async (
    seasonId: string,
    episodeData: {
        episode_number: number;
        title: string;
        description: string;
        release_date: string;
        imdb_rating: number | null;
        duration: number;
        admin_password: string;
    }
) => {
    try {
        const response = await api.post(`/seasons/${seasonId}/episodes`, episodeData);
        console.log('Épisode ajouté :', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'épisode', error);
        throw error;
    }
};

// Nouvelle fonction pour récupérer les épisodes non uploadés
export const fetchNotUploadedEpisodes = async () => {
  try {
    const response = await api.get('/episodes/not-uploaded');
    // On retourne la propriété "episodes" contenue dans la réponse
    return response.data.episodes;
  } catch (error) {
    console.error("Erreur lors de la récupération des épisodes non uploadés", error);
    throw error;
  }
};

