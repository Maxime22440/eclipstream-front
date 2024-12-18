import api from '@/plugins/axios';

// Fonction pour ajouter un film
export const addContent = async (formData: FormData) => {
    return await sendContent('/contents', formData);
};

// Fonction générique pour envoyer du contenu (utilisée pour films, séries, animes)
const sendContent = async (endpoint: string, formData: FormData) => {
    try {
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'envoi du contenu', error);
        throw error;
    }
};

export const fetchContent = async (uuid: string) => {
  try {
    const response = await api.get(`/contents/${uuid}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu', error);
    throw error;
  }
};