import axios from 'axios';

/**
 * Upload d'une vidéo pour un contenu (film).
 * @param formData FormData contenant 'video' et 'content_uuid'
 */
export const uploadContentVideo = async (formData: FormData) => {
  try {
    const response = await axios.post('/upload/video/content', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'upload du contenu :", error);
    throw error;
  }
};

/**
 * Upload d'une vidéo pour un épisode.
 * @param formData FormData contenant 'video' et 'episode_uuid'
 */
export const uploadEpisodeVideo = async (formData: FormData) => {
  try {
    const response = await axios.post('/upload/video/episode', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'upload de l'épisode :", error);
    throw error;
  }
};
