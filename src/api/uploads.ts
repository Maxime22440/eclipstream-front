import api from "@/plugins/axios";

/**
 * Upload d'une vidéo pour un contenu (film).
 * @param formData FormData contenant 'video' et 'content_uuid'
 */
export const uploadContentVideo = async (formData: FormData) => {
  try {
    console.log("[uploadContentVideo] Envoi de la requête avec les données :");
    // Pour éviter de logger le contenu complet du fichier, vous pouvez afficher ses propriétés
    if (formData.has('video')) {
      const file = formData.get('video') as File;
      console.log(`Fichier: ${file.name}, taille: ${file.size} octets`);
    }
    if (formData.has('content_uuid')) {
      console.log("Content UUID:", formData.get('content_uuid'));
    }

    const response = await api.post('/upload/video/content', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log("[uploadContentVideo] Réponse reçue :", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response.data;
  } catch (error: any) {
    console.error("[uploadContentVideo] Erreur lors de l'upload du contenu :", error);
    // Affichage détaillé si c'est une erreur Axios
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Données:", error.response.data);
      console.error("En-têtes:", error.response.headers);
    } else if (error.request) {
      console.error("Aucune réponse reçue :", error.request);
    }
    throw error;
  }
};

/**
 * Upload d'une vidéo pour un épisode.
 * @param formData FormData contenant 'video' et 'episode_uuid'
 */
export const uploadEpisodeVideo = async (formData: FormData) => {
  try {
    console.log("[uploadEpisodeVideo] Envoi de la requête avec les données :");
    if (formData.has('video')) {
      const file = formData.get('video') as File;
      console.log(`Fichier: ${file.name}, taille: ${file.size} octets`);
    }
    if (formData.has('episode_uuid')) {
      console.log("Episode UUID:", formData.get('episode_uuid'));
    }

    const response = await api.post('/upload/video/episode', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log("[uploadEpisodeVideo] Réponse reçue :", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response.data;
  } catch (error: any) {
    console.error("[uploadEpisodeVideo] Erreur lors de l'upload de l'épisode :", error);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Données:", error.response.data);
      console.error("En-têtes:", error.response.headers);
    } else if (error.request) {
      console.error("Aucune réponse reçue :", error.request);
    }
    throw error;
  }
};
