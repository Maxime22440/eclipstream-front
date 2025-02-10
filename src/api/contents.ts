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

// Fonction pour récupérer un contenu par son UUID
export const fetchContent = async (uuid: string) => {
  try {
    const response = await api.get(`/contents/${uuid}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu', error);
    throw error;
  }
};

// Fonction pour récupérer les contenus non uploadés
export const fetchNotUploadedContent = async () => {
  try {
    const response = await api.get('/contents/not-uploaded');
    // On retourne la propriété "contents" contenue dans la réponse
    return response.data.contents;
  } catch (error) {
    console.error("Erreur lors de la récupération des contenus non uploadés", error);
    throw error;
  }
};

// Fonction pour récupérer un film aléatoire
export const fetchRandomMovie = async () => {
  try {
    const response = await api.get('/contents/random-movie');
    return response.data.movie;
  } catch (error) {
    console.error('Erreur lors de la récupération du film aléatoire', error);
    throw error;
  }
};

// Fonction pour récupérer tous les films par ordre d'ajout (du plus récent au plus ancien)
export const fetchAllMovies = async () => {
  try {
    const response = await api.get('/contents/movies/all');
    return response.data.movies;
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les films', error);
    throw error;
  }
};

// Fonction pour récupérer les 10 derniers films ajoutés
export const fetchLatestMovies = async () => {
  try {
    const response = await api.get('/contents/movies/latest');
    return response.data.movies;
  } catch (error) {
    console.error('Erreur lors de la récupération des derniers films', error);
    throw error;
  }
};

// Fonction pour récupérer les 10 films les plus regardés
export const fetchTopViewedMovies = async () => {
  try {
    const response = await api.get('/contents/movies/top-viewed');
    return response.data.movies;
  } catch (error) {
    console.error('Erreur lors de la récupération des films les plus regardés', error);
    throw error;
  }
};

// Fonction pour récupérer tous les films par genre (via l'UUID du genre)
export const fetchMoviesByGenre = async (genreUuid: string) => {
  try {
    const response = await api.get(`/contents/movies/genre/${genreUuid}`);
    // Supposons que la réponse contient une propriété "movies" avec la liste des films
    return response.data.movies;
  } catch (error) {
    console.error('Erreur lors de la récupération des films par genre', error);
    throw error;
  }
};
