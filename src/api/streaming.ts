/**
 * Construit une URL signée temporaire pour un contenu (film) en se basant sur le backend.
 * @returns URL signée
 * @param movieUuid
 */
export const getSignedHLSPlaylistSUrlForMovie = (movieUuid: string): string => {
  if (!movieUuid) {
    throw new Error('UUID de contenu manquant.');
  }
  return `${import.meta.env.VITE_BACKEND_URL}/signed-stream/hls/playlist/movies/${movieUuid}`;
};

/**
 * Construit une URL signée temporaire pour un épisode en se basant sur le backend.
 * @returns URL signée
 * @param episodeUuid
 */
export const getSignedHLSPlaylistUrlForEpisode = (episodeUuid: string): string => {
  if (!episodeUuid) {
    throw new Error('UUID d\'épisode manquant.');
  }
  return `${import.meta.env.VITE_BACKEND_URL}/signed-stream/hls/playlist/episodes/${episodeUuid}`;
};
