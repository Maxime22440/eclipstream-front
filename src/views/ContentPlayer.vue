<template>
  <div class="video-page">
    <div v-if="error"
         class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else>
      <!-- Section poster avec le bouton play -->
      <div class="video-poster">
        <div v-if="!isPlaying">
          <img v-if="getImageComponentOrPath(poster)"
               :src="getImageComponentOrPath(poster)"
               alt="Poster du contenu"
               @load="imageLoaded = true"
               class="poster-image"
               :class="{ 'loaded': imageLoaded }"/>

          <!-- Si l'image n'est pas disponible -->
          <div v-else
               class="poster-placeholder"
               :class="{ 'hidden': imageLoaded }">
            <MovieIcon class="poster-icon"/>
          </div>
          <template v-if="imageLoaded">
            <button v-if="isAuthenticated"
                    class="play-button"
                    @click="playVideo">
              <i class="fas fa-play"></i>
            </button>
            <button v-else
                    class="lock-button"
                    @click="showLoginNotification">
              <i class="fas fa-lock"></i>
            </button>
          </template>
        </div>

        <!-- Affiche le lecteur vidéo si la vidéo est en lecture -->
        <div v-else>
          <!-- Affiche une erreur si elle existe -->
          <div v-if="error"
               class="video-error">
            {{ error }}
          </div>

          <!-- Lecteur vidéo -->
          <video
            ref="videoPlayer"
            class="video-js"
            controls
            autoplay
            preload="auto"
            controlsList="nodownload"
            oncontextmenu="return false;"
            @error="handleVideoError"
          >
            <source :src="signedVideoUrl"
                    type="video/mp4"/>
          </video>
        </div>
      </div>
        <EpisodeNavigation
          v-if="isEpisodeNavigationVisible"
          :isFirstEpisode="isFirstEpisode"
          :isLastEpisode="isLastEpisode"
          :currentEpisodeNumber="currentEpisode?.episodeNumber || 1"
          :currentEpisodeUuid="route.params.episodeUuid || ''"
          :currentSeasonNumber="currentSeason?.seasonNumber || 1"
          :seasons="content.seasons"
          @previous="navigateToPrevious"
          @next="navigateToNext"
          @seasonChange="onSeasonChange"
          @episodeChange="onEpisodeChange"
        />

        <!-- Contenu sous le lecteur -->
        <div class="video-content">
          <!-- Partie gauche (Thumbnail) -->
          <div v-if="!isSmallScreen"
               class="thumbnail">
            <img v-if="getImageComponentOrPath(thumbnail)"
                 :src="getImageComponentOrPath(thumbnail)"
                 alt="Thumbnail du contenu"
                 class="thumbnail-image"
                 :class="{ 'loaded': imageLoaded }"/>

            <!-- Si l'image n'est pas disponible -->
            <div v-else
                 class="thumbnail-placeholder"
                 :class="{ 'hidden': imageLoaded }">
            </div>
          </div>

          <!-- Partie droite (Détails du film) -->
          <div class="details">
            <!-- Titre et notation -->
            <div class="title-rating">
              <!-- Titre de la série -->
              <span class="series-title">{{ content.title }}</span>

              <!-- Titre de l'épisode et rating (uniquement si épisode présent) -->
              <template v-if="episode">
            <span class="episode-rating">
              <span class="episode-title">- {{ episode.title }}</span>
              <span class="rating">
                <i class="fas fa-star"></i>
                {{ episode.rating }}
              </span>
            </span>
              </template>

              <!-- Rating uniquement pour un contenu sans épisode -->
              <template v-else>
            <span class="rating">
              <i class="fas fa-star"></i>
              {{ content.rating }}
            </span>
              </template>
            </div>

            <!-- Saison et épisode (affichés uniquement pour les séries) -->
            <div v-if="episode"
                 class="episode-metadata">
              <p>Saison {{ currentSeason?.seasonNumber }} - Épisode {{ episode.episodeNumber }}</p>
            </div>

            <!-- Genres, pays et durée -->
            <div class="metadata">
            <span class="genre"
                  v-for="genre in content.genres"
                  :key="genre">{{ genre }}</span>
              <span class="country">{{ content.country }}</span>
              <span class="duration">{{
                  episode ? formatDuration(episode.duration) : formatDuration(content.duration)
                }}</span>
            </div>

            <!-- Description -->
            <p class="description">{{ episode ? episode.description : content.description }}</p>

            <!-- Casting -->
            <div class="casting">
              <h2>Acteurs principaux</h2>
              <div class="cast-list">
              <span v-for="(actor, index) in content.cast"
                    :key="actor">
                {{ actor }}
                <span v-if="index !== content.cast.length - 1">, </span>
              </span>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSignedHLSPlaylistSUrlForMovie, getSignedHLSPlaylistUrlForEpisode } from '@/api/streaming';
import { useUserStore } from '@/stores/useUserStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { fetchContent } from '@/api/contents';
import EpisodeNavigation from "@/components/Content/EpisodeNavigation.vue";
import MovieIcon from '@/components/icons/MovieIcon.vue';
import Hls from 'hls.js';

// ------------------------
// CONSTANTES ET CONFIGURATION
// ------------------------
const REFRESH_INTERVAL_MS =  11100000; // Intervalle de renouvellement en ms

// ------------------------
// STORES ET ROUTES
// ------------------------
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const isAuthenticated = computed(() => userStore.isAuthenticated);
const route = useRoute();
const router = useRouter();

// ------------------------
// Variables réactives
// ------------------------
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const contentUuid = (route.params.contentUuid || route.params.uuid) as string;
const episodeUuid = route.params.episodeUuid as string | null;

const signedVideoUrl = ref<string>('');
const content = ref({
  title: '',
  type: '', // 'movie', 'series', etc.
  rating: 0,
  genres: [] as string[],
  country: '',
  duration: '',
  description: '',
  cast: [] as string[],
  stream_link: '',
  seasons: [] as Array<{
    seasonNumber: number;
    episodes: Array<{
      uuid: string,
      episodeNumber: number,
      title: string,
      duration: number,
      description: string,
      stream_link?: string,
      rating: number,
    }>;
  }>,
});
const poster = ref('');
const thumbnail = ref('');
const isSmallScreen = ref(window.innerWidth < 768);
const error = ref<string | null>(null);
const imageLoaded = ref(false);
const isPlaying = ref(false);

const videoPlayer = ref<HTMLVideoElement | null>(null);

// Intervalle et instance HLS
let refreshInterval: number | null = null;
let hls: Hls | null = null;

// ------------------------
// Fonctions utilitaires
// ------------------------
const showLoginNotification = () => {
  notificationStore.addNotification('error', 'Veuillez vous connecter pour regarder ce contenu.');
};

// ------------------------
// Fonctions de chargement de contenu
// ------------------------
const loadContent = async () => {
  try {
    const data = await fetchContent(contentUuid);
    console.log('Données reçues depuis l’API:', data);
    content.value = {
      title: data.title,
      type: data.type,
      rating: data.imdb_rating,
      genres: data.genres.map((genre: any) => genre.name),
      country: data.country,
      duration: data.duration,
      description: data.description,
      cast: data.actors.map((actor: any) => actor.name),
      stream_link: data.stream_link,
      seasons: (data.seasons || []).map((season: any) => ({
        seasonNumber: season.season_number,
        episodes: (season.episodes || []).map((episode: any) => ({
          uuid: episode.uuid,
          episodeNumber: episode.episode_number,
          title: episode.title,
          duration: episode.duration,
          description: episode.description,
          stream_link: episode.stream_link,
          rating: episode.imdb_rating,
        })),
      })),
    };
    console.log('Données des saisons reçues :', content.value.seasons);
    console.log('UUID d’épisode actif :', episodeUuid);
    poster.value = data.poster_path;
    thumbnail.value = data.thumbnail_path;
  } catch (err) {
    error.value = 'Erreur lors de la récupération des données.';
    console.error(err);
  }
};

const fetchSignedHLSUrl = async (): Promise<string> => {
  try {
    if (content.value.type === 'movie') {
      return getSignedHLSPlaylistSUrlForMovie(contentUuid);
    } else if (content.value.type === 'series' && episodeUuid) {
      return getSignedHLSPlaylistUrlForEpisode(episodeUuid);
    } else {
      throw new Error('Type de contenu ou UUID d\'épisode invalide.');
    }
  } catch (err) {
    console.error('Erreur lors de la génération de l\'URL signée HLS :', err);
    throw err;
  }
};

// ------------------------
// Initialisation HLS
// ------------------------
const initializeHLS = async () => {
  try {
    let url = '';
    console.log('Début d\'initialisation HLS, type de contenu :', content.value.type);
    if (content.value.type === 'movie') {
      console.log('Obtention de l\'URL signée pour un film, contentUuid :', contentUuid);
      url = getSignedHLSPlaylistSUrlForMovie(contentUuid);
      console.log('URL signée pour le film obtenue :', url);
    } else if (content.value.type === 'series' && episodeUuid) {
      console.log('Obtention de l\'URL signée pour la playlist d\'un épisode, episodeUuid :', episodeUuid);
      url = getSignedHLSPlaylistUrlForEpisode(episodeUuid);
      console.log('URL signée pour la playlist d\'épisode obtenue :', url);
    } else {
      throw new Error('Type de contenu ou UUID d\'épisode invalide.');
    }
    signedVideoUrl.value = url;
    console.log('URL signée HLS (playlist) assignée :', signedVideoUrl.value);
    if (Hls.isSupported()) {
      console.log('HLS est supporté, initialisation de Hls.js');
      hls = new Hls({
        xhrSetup: (xhr, requestUrl) => {
          const token = localStorage.getItem('auth_token');
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            console.log('xhrSetup: ajout du header Authorization pour', requestUrl);
          } else {
            console.warn('xhrSetup: aucun token trouvé pour', requestUrl);
          }
        }
      });
      hls.loadSource(signedVideoUrl.value);
      hls.attachMedia(videoPlayer.value as HTMLVideoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('MANIFEST_PARSED event déclenché :', event, data);
        videoPlayer.value?.play()
          .then(() => console.log('Lecture démarrée avec succès.'))
          .catch((err) => console.error('Erreur lors du démarrage de la lecture :', err));
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS ERROR event :', event, data);
      });
      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        console.log('FRAG_LOADED event, fragment chargé :', data.frag.url);
      });
      startAutoRefresh(REFRESH_INTERVAL_MS);
    } else if (videoPlayer.value?.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('HLS n\'est pas supporté via hls.js, utilisation du lecteur natif');
      videoPlayer.value.src = signedVideoUrl.value;
      videoPlayer.value.addEventListener('loadedmetadata', () => {
        console.log('loadedmetadata event déclenché, démarrage de la lecture');
        videoPlayer.value?.play()
          .then(() => console.log('Lecture démarrée avec succès (natif).'))
          .catch((err) => console.error('Erreur lors du démarrage de la lecture (natif) :', err));
      });
    } else {
      throw new Error('HLS non supporté par ce navigateur.');
    }
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de HLS :', err);
    notificationStore.addNotification('error', 'Erreur lors du chargement de la vidéo.');
  }
};

// ------------------------
// Renouvellement de l'URL signée HLS
// ------------------------
const renewHLSUrl = async () => {
  try {
    const currentTime = videoPlayer.value ? videoPlayer.value.currentTime : 0;
    const wasPaused = videoPlayer.value ? videoPlayer.value.paused : true;
    console.log('Temps de lecture actuel avant renouvellement:', currentTime, 'Était en pause:', wasPaused);
    const newUrl = await fetchSignedHLSUrl();
    console.log('Renouvellement de l\'URL signée HLS :', newUrl);
    if (hls) {
      hls.loadSource(newUrl);
      hls.attachMedia(videoPlayer.value as HTMLVideoElement);
      hls.once(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('Manifest parsed après renouvellement. Repositionnement à', currentTime);
        if (videoPlayer.value) {
          videoPlayer.value.currentTime = currentTime;
          if (!wasPaused) {
            videoPlayer.value.play()
              .then(() => console.log('Lecture reprise à', currentTime))
              .catch((err) => console.error('Erreur lors du démarrage de la lecture après renouvellement :', err));
          } else {
            videoPlayer.value.pause();
            console.log('Le lecteur était en pause, il reste en pause.');
          }
        }
      });
      signedVideoUrl.value = newUrl;
    } else if (videoPlayer.value) {
      const isPaused = videoPlayer.value.paused;
      videoPlayer.value.src = newUrl;
      videoPlayer.value.load();
      videoPlayer.value.onloadedmetadata = () => {
        videoPlayer.value.currentTime = currentTime;
        if (!isPaused) {
          videoPlayer.value.play()
            .then(() => console.log('Lecture reprise (natif) à', currentTime))
            .catch((err) => console.error('Erreur lors du démarrage de la lecture (natif) :', err));
        } else {
          videoPlayer.value.pause();
          console.log('Le lecteur était en pause (natif), il reste en pause.');
        }
      };
    }
  } catch (err) {
    console.error('Erreur lors du renouvellement de l\'URL signée HLS :', err);
    notificationStore.addNotification('error', 'Erreur lors du renouvellement de la vidéo.');
  }
};

const startAutoRefresh = (intervalMs: number) => {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = window.setInterval(() => {
    console.log('Renouvellement de l\'URL signée HLS...');
    renewHLSUrl();
  }, intervalMs);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (hls) {
    hls.destroy();
    hls = null;
  }
};

// ------------------------
// Fonctions pour le lecteur et les erreurs
// ------------------------
const playVideo = async () => {
  isPlaying.value = true;
  error.value = null;
  await nextTick();
  await initializeHLS();
};

const handleVideoError = (event: Event) => {
  const video = event.target as HTMLVideoElement;
  console.error('Erreur de lecture de la vidéo:', video.error);
  error.value = 'Erreur lors du chargement de la vidéo.';
};

// ------------------------
// Fonctions utilitaires pour le formatage et l'image
// ------------------------
const formatDuration = (minutes: string | number | null) => {
  if (!minutes || isNaN(Number(minutes))) return 'Durée inconnue';
  const totalMinutes = Number(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return hours < 1 ? `${remainingMinutes}m` : `${hours}h${remainingMinutes}m`;
};

const getImageComponentOrPath = (path: string) => {
  const baseUrl = backendUrl.replace('/api', '');
  return path ? `${baseUrl}/storage/${path}` : null;
};

// ------------------------
// Gestion des événements (redimensionnement, montage/démontage)
// ------------------------
const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 768;
};

window.addEventListener('resize', handleResize);

onMounted(() => {
  if (!contentUuid) {
    error.value = 'Aucun UUID de contenu fourni dans l’URL.';
    return;
  }
  loadContent();
});

onUnmounted(() => {
  stopAutoRefresh();
  window.removeEventListener('resize', handleResize);
});

// ------------------------
// Gestion de la navigation et des changements d'épisodes
// ------------------------
const currentSeason = computed(() => {
  return content.value.seasons.find((season) =>
    season.episodes.some((episode) => episode.uuid === episodeUuid)
  );
});

const episode = computed(() => {
  if (!currentSeason.value) return null;
  return currentSeason.value.episodes.find((ep) => ep.uuid === episodeUuid);
});

const isEpisodeNavigationVisible = computed(() => {
  return content.value.type === 'series' || content.value.type === 'anime-series';
});

const onSeasonChange = (newSeasonNumber: number) => {
  console.log("Changement de saison détecté :", newSeasonNumber);
  const selectedSeason = content.value.seasons.find(
    (season) => season.seasonNumber === newSeasonNumber
  );
  console.log("Saison sélectionnée :", selectedSeason);
  if (!selectedSeason || selectedSeason.episodes.length === 0) {
    console.warn("Aucune saison valide trouvée ou pas d'épisodes disponibles.");
    return;
  }
  const firstEpisode = selectedSeason.episodes[0];
  console.log("Premier épisode de la saison :", firstEpisode);
  router.push(`/content-player/${contentUuid}/episode/${firstEpisode.uuid}`);
};

const onEpisodeChange = (newEpisodeUuid: string) => {
  router.push(`/content-player/${contentUuid}/episode/${newEpisodeUuid}`);
};

const currentEpisode = computed(() => {
  if (!currentSeason.value) return null;
  return currentSeason.value.episodes.find((ep) => ep.uuid === episodeUuid);
});

const previousEpisode = computed(() => {
  if (!currentSeason.value) return null;
  const currentIndex = currentSeason.value.episodes.findIndex((ep) => ep.uuid === episodeUuid);
  if (currentIndex > 0) {
    return currentSeason.value.episodes[currentIndex - 1];
  }
  const previousSeason = content.value.seasons.find(
    (season) => season.seasonNumber === currentSeason.value.seasonNumber - 1
  );
  if (previousSeason && previousSeason.episodes.length > 0) {
    return previousSeason.episodes.at(-1);
  }
  return null;
});

const nextEpisode = computed(() => {
  if (!currentSeason.value) return null;
  const currentIndex = currentSeason.value.episodes.findIndex((ep) => ep.uuid === episodeUuid);
  if (currentIndex < currentSeason.value.episodes.length - 1) {
    return currentSeason.value.episodes[currentIndex + 1];
  }
  const nextSeason = content.value.seasons.find(
    (season) => season.seasonNumber === currentSeason.value.seasonNumber + 1
  );
  if (nextSeason && nextSeason.episodes.length > 0) {
    return nextSeason.episodes[0];
  }
  return null;
});

const isFirstEpisode = computed(() => {
  console.log("=== Calcul de isFirstEpisode ===");
  if (!currentSeason.value || !currentSeason.value.episodes.length) {
    return false;
  }
  return currentSeason.value.seasonNumber === 1 && currentSeason.value.episodes[0].uuid === episodeUuid;
});

const isLastEpisode = computed(() => {
  const lastSeason = content.value.seasons.at(-1);
  if (!lastSeason || !lastSeason.episodes.length || !currentSeason.value) {
    return false;
  }
  return currentSeason.value.seasonNumber === lastSeason.seasonNumber &&
    lastSeason.episodes.at(-1).uuid === episodeUuid;
});

// Navigation functions
const navigateToPrevious = () => {
  if (previousEpisode.value) {
    router.push(`/content-player/${contentUuid}/episode/${previousEpisode.value.uuid}`);
  }
};

const navigateToNext = () => {
  if (nextEpisode.value) {
    router.push(`/content-player/${contentUuid}/episode/${nextEpisode.value.uuid}`);
  }
};

// Watchers pour recharger le contenu lors des changements de route
watch(
  () => [route.params.contentUuid, route.params.episodeUuid],
  ([newContentUuid, newEpisodeUuid], [oldContentUuid, oldEpisodeUuid]) => {
    if (newContentUuid !== oldContentUuid || newEpisodeUuid !== oldEpisodeUuid) {
      console.log('Changement détecté : recharge des données');
      loadContent();
    }
  }
);

// Watchers pour logs
watch(() => isFirstEpisode.value, (newVal) => console.log('isFirstEpisode:', newVal));
watch(() => isLastEpisode.value, (newVal) => console.log('isLastEpisode:', newVal));
</script>


<style scoped>
.video-page {
  display: flex;
  flex-direction: column;
  background-color: #100f10;
  color: #ffffff;
  padding: 30px 15px 15px;
  width: 100%;
  margin: auto;
}

/* Poster section */
.video-poster {
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #161616;
  overflow: hidden;
  border-radius: 15px;
  margin-bottom: 35px;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, transform 0.2s;
}

.lock-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-js {
  width: 100%;
  height: 500px;
  object-fit: contain;
  background-color: black;
  border-radius: 15px;
}

/* Content under the video */
.video-content {
  display: flex;
  gap: 30px;
  margin-top: 50px;
}

.thumbnail {
  flex: 1;
  max-width: 220px;
  min-width: 200px;
}

.thumbnail-image {
  width: 100%;
  border-radius: 10px;
}

/* Thumbnail Placeholder */
.thumbnail-placeholder,
.poster-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #1c1a1c; /* Couleur de fond */
  transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1); /* Transition fluide */
  transform: scale(1);
}

.poster-placeholder {
  width: 100%;
  height: 500px;
}

/* Icônes (MovieIcon) */
.thumbnail-icon,
.poster-icon {
  width: 60px; /* Taille de l'icône pour les thumbnails */
  height: 60px;
  color: #00CC9B; /* Couleur de l'icône */
  opacity: 0.8; /* Opacité pour un effet subtil */
}

.poster-icon {
  width: 100px; /* Taille plus grande pour le poster */
  height: 100px;
}

/* Poster Image */
.poster-image,
.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1); /* Transition fluide */
  transform: scale(1.05); /* Commence légèrement agrandie */
}

.poster-placeholder.hidden,
.thumbnail-placeholder.hidden {
  opacity: 0;
  transform: scale(0.95); /* Rétrécissement lors de la transition */
  pointer-events: none; /* Désactive les interactions */
  filter: blur(4px); /* Ajoute un léger flou pendant la transition */
}

/* Image après chargement */
.poster-image.loaded,
.thumbnail-image.loaded {
  opacity: 0.4; /* Visible */
  transform: scale(1); /* Retourne à la taille normale */
}

.thumbnail-image.loaded {
  opacity: 0.9; /* Visible */
  transform: scale(1); /* Retourne à la taille normale */
}

/* Right side (details) */
.details {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.title-rating {
  display: flex;
  flex-wrap: wrap; /* Permet aux éléments de passer à la ligne si nécessaire */
  align-items: center; /* Centre verticalement les éléments sur une ligne */
  gap: 10px; /* Espacement horizontal entre les blocs */
}

.series-title {
  font-size: 35px;
  font-weight: bold;
  white-space: nowrap; /* Empêche le titre de se couper */
}

.episode-rating {
  display: flex;
  align-items: center; /* Aligne le titre de l'épisode et la note */
  gap: 10px; /* Espace entre le titre de l'épisode et la note */
}

.episode-title {
  font-size: 30px;
  font-weight: normal;
  color: #e8e8e8;
}

.rating {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #00cc9b; /* Couleur de la note */
  font-weight: bold;
  white-space: nowrap; /* Empêche la note de se couper */
}

.rating i {
  font-size: 14px;
  margin-right: 5px; /* Espace entre l'étoile et la note */
  position: relative;
  top: -1px;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 14px;
  color: #cccccc;
  margin-bottom: 5px;
}

.metadata span {
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 5px;
}

.description {
  font-size: 16px;
  line-height: 1.5;
  color: #e0e0e0;
  text-align: justify;
}

.casting {
  margin-top: 20px;
}

.casting h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.cast-list {
  display: flex;
  flex-wrap: wrap; /* Permet de passer à la ligne si l'espace est insuffisant */
  gap: 5px; /* Espace entre les noms */
  font-size: 14px;
  color: #bbbbbb;
}

.cast-list span {
  white-space: nowrap; /* Empêche un acteur d'être coupé sur deux lignes */
}

@media (max-width: 1100px) {
  .video-poster {
    height: 350px;
  }
  .poster-placeholder {
    height: 350px;
  }
  .video-js {
    height: 350px;
  }
}

@media (max-width: 750px) {
  .video-poster {
    height: 280px;
  }
  .poster-placeholder {
    height: 280px;
  }
  .video-js {
    height: 280px;
  }
}

@media (max-width: 575px) {
  .video-poster {
    height: 230px;
  }
  .poster-placeholder {
    height: 230px;
  }
  .video-js {
    height: 230px;
  }
}

@media (max-width: 430px) {
  .video-poster {
    height: 180px;
  }
  .poster-placeholder {
    height: 180px;
  }
  .video-js {
    height: 180px;
  }
}
</style>
