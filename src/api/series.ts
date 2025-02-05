import api from '@/plugins/axios';

// Fonction pour récupérer toutes les séries
export const fetchAllSeries = async () => {
    try {
      // Utiliser le nouvel endpoint '/all-series'
        const response = await api.get('/contents/all-series');
        console.log('Données reçues :', response.data);
        return response.data.series;
    } catch (error) {
        console.error('Erreur lors de la récupération des séries', error);
        throw error;
    }
};

// Fonction pour récupérer les saisons d'une série spécifique
export const fetchSeasons = async (seriesId: string) => {
    try {
        const response = await api.get(`/contents/${seriesId}/seasons`);  // Assurez-vous que l'endpoint est correct
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des saisons', error);
        throw error;
    }
};

// Fonction pour ajouter une nouvelle saison à une série
export const addSeason = async (seriesId: string, seasonData: { season_number: number | null; admin_password: string; total_episodes: number | null }) => {
    try {
        const response = await api.post(`/contents/${seriesId}/seasons`, seasonData);  // Assurez-vous que l'endpoint est correct
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la saison', error);
        throw error;
    }
};


