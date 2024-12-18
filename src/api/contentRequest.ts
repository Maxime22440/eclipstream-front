import api from '@/plugins/axios';

export const requestContent = async (contentType: string | null, contentName: string) => {
    const response = await api.post('/content/request', {
        content_type: contentType,
        content_title: contentName,
    });
    return response.data; // Retourne les données de la réponse
};
