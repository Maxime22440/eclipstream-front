<template>
  <div class="video-page">
    <div v-if="error"
         class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else>
      <!-- Section poster avec le bouton play -->
      <div class="video-poster">
        <img v-if="getImageComponentOrPath(poster)"
             :src="getImageComponentOrPath(poster)"
             alt="Poster du contenu"
             @load="imageLoaded = true"
             class="poster-image"
             :class="{ 'loaded': imageLoaded }"/>

        <!-- Si l'image n'est pas disponible -->
        <div v-else class="poster-placeholder"
             :class="{ 'hidden': imageLoaded }">
          <MovieIcon class="poster-icon" />
        </div>
        <button
          v-if="imageLoaded"
          class="play-button">
          <i class="fas fa-play"></i>
        </button>
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
          <div v-else class="thumbnail-placeholder"
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

<script setup
        lang="ts">
import {ref, onMounted, computed, watch} from 'vue';
import {useRoute} from 'vue-router';
import { useRouter } from 'vue-router';
import {fetchContent} from '@/api/content'; // Utilisation de ta méthode API existante
import EpisodeNavigation from "@/components/Content/EpisodeNavigation.vue";
import MovieIcon from '@/components/icons/MovieIcon.vue';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Récupération de l'UUID depuis les paramètres de l'URL
const route = useRoute();
const router = useRouter();
const contentUuid = (route.params.contentUuid || route.params.uuid) as string;
const episodeUuid = route.params.episodeUuid as string | null;

// Variables réactives pour les données du contenu
const content = ref({
  title: '',
  type: '', // `movie`, `series`, etc.
  rating: 0,
  genres: [] as string[], // Liste des genres (noms uniquement)
  country: '',
  duration: '', // Durée totale (en minutes ou formatée)
  description: '',
  cast: [] as string[], // Liste des acteurs (noms uniquement)
  seasons: [] as Array<{
    seasonNumber: number; // Numéro de la saison
    episodes: Array<{
      uuid: string,
      episodeNumber: number; // Numéro de l'épisode
      title: string; // Titre de l'épisode
      duration: number; // Durée en minutes
      description: string; // Description de l'épisode
    }>;
  }>, // Liste des saisons et leurs épisodes
});

const currentSeason = computed(() => {
  return content.value.seasons.find((season) =>
    season.episodes.some((episode) => episode.uuid === episodeUuid)
  );
});

const episode = computed(() => {
  if (!currentSeason.value) return null;
  return currentSeason.value.episodes.find((ep) => ep.uuid === episodeUuid);
});

// Calcul pour déterminer si la navigation des épisodes doit être affichée
const isEpisodeNavigationVisible = computed(() => {
  return content.value.type === 'series' || content.value.type === 'anime-series';
});

const poster = ref('');
const thumbnail = ref('');
const isSmallScreen = ref(window.innerWidth < 768);
const error = ref<string | null>(null);
const imageLoaded = ref(false);

// Fonction pour récupérer le contenu depuis l'API
const loadContent = async () => {
  try {
    const data = await fetchContent(contentUuid); // Appel de ta méthode API `fetchContent`
    console.log('Données reçues depuis l’API:', data); // Vérifie les acteurs ici

    // Mise à jour des données du contenu
    content.value = {
      title: data.title,
      type: data.type, // Utilisé pour afficher des champs conditionnels
      rating: data.imdb_rating,
      genres: data.genres.map((genre: any) => genre.name),
      country: data.country,
      duration: data.duration, // Durée en minutes
      description: data.description,
      cast: data.actors.map((actor: any) => actor.name),
      seasons: (data.seasons || []).map((season: any) => ({
        seasonNumber: season.season_number,
        episodes: (season.episodes || []).map((episode: any) => ({
          uuid: episode.uuid, // UUID de l'épisode
          episodeNumber: episode.episode_number,
          title: episode.title,
          rating: episode.imdb_rating,
          duration: episode.duration,
          description: episode.description,
        })),
      })), // Inclure les saisons et les épisodes
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

// Fonction pour formater la durée en minutes vers hh:mm
const formatDuration = (minutes: string | number | null) => {
  if (!minutes || isNaN(Number(minutes))) return 'Durée inconnue';

  const totalMinutes = Number(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Retourne uniquement les minutes si moins de 1 heure
  if (hours < 1) {
    return `${remainingMinutes}m`;
  }

  // Retourne le format "XhYm" si plus d'une heure
  return `${hours}h${remainingMinutes}m`;
};

const getImageComponentOrPath = (path: string) => {
  const baseUrl = backendUrl.replace('/api', ''); // Retire `/api` si présent
  return path
    ? `${baseUrl}/storage/${path}` // Chemin de l'image si disponible
    : null; // Retourne null si aucune image
};

// Écouter le redimensionnement de l'écran
window.addEventListener('resize', () => {
  isSmallScreen.value = window.innerWidth < 768;
});

onMounted(() => {
  if (!contentUuid) {
    error.value = 'Aucun UUID de contenu fourni dans l’URL.';
    return;
  }

  loadContent();
});

const onSeasonChange = (newSeasonNumber: number) => {
  console.log("Changement de saison détecté :", newSeasonNumber);

  // Trouver la nouvelle saison sélectionnée
  const selectedSeason = content.value.seasons.find(
    (season) => season.seasonNumber === newSeasonNumber
  );
  console.log("Saison sélectionnée :", selectedSeason);

  // Si la saison ou les épisodes ne sont pas valides, on arrête là
  if (!selectedSeason || selectedSeason.episodes.length === 0) {
    console.warn("Aucune saison valide trouvée ou pas d'épisodes disponibles.");
    return;
  }

  // Récupérer le premier épisode de la saison sélectionnée
  const firstEpisode = selectedSeason.episodes[0];
  console.log("Premier épisode de la saison :", firstEpisode);

  // Met à jour l'URL pour refléter le changement
  router.push(`/content-player/${contentUuid}/episode/${firstEpisode.uuid}`);
  console.log("Navigation vers :", `/content-player/${contentUuid}/episode/${firstEpisode.uuid}`);
};

const onEpisodeChange = (episodeUuid: string) => {
  router.push(`/content-player/${contentUuid}/episode/${episodeUuid}`);
};

const currentEpisode = computed(() => {
  if (!currentSeason.value) return null;
  return currentSeason.value.episodes.find((ep) => ep.uuid === episodeUuid);
});

const previousEpisode = computed(() => {
  if (!currentSeason.value) return null;

  // Trouver l'index de l'épisode actuel dans la saison courante
  const currentIndex = currentSeason.value.episodes.findIndex((ep) => ep.uuid === episodeUuid);

  // Si un épisode précédent existe dans la même saison
  if (currentIndex > 0) {
    return currentSeason.value.episodes[currentIndex - 1];
  }

  // Sinon, chercher la saison précédente
  const previousSeason = content.value.seasons.find(
    (season) => season.seasonNumber === currentSeason.value.seasonNumber - 1
  );

  // Retourner le dernier épisode de la saison précédente si elle existe
  if (previousSeason && previousSeason.episodes.length > 0) {
    return previousSeason.episodes.at(-1); // Dernier épisode de la saison précédente
  }

  // Aucun épisode précédent disponible
  return null;
});

const nextEpisode = computed(() => {
  if (!currentSeason.value) return null;

  // Trouver l'index de l'épisode actuel dans la saison courante
  const currentIndex = currentSeason.value.episodes.findIndex((ep) => ep.uuid === episodeUuid);

  // Si un épisode suivant existe dans la même saison
  if (currentIndex < currentSeason.value.episodes.length - 1) {
    return currentSeason.value.episodes[currentIndex + 1];
  }

  // Sinon, chercher la saison suivante
  const nextSeason = content.value.seasons.find(
    (season) => season.seasonNumber === currentSeason.value.seasonNumber + 1
  );

  // Retourner le premier épisode de la saison suivante si elle existe
  if (nextSeason && nextSeason.episodes.length > 0) {
    return nextSeason.episodes[0];
  }

  // Aucun épisode suivant disponible
  return null;
});

const isFirstEpisode = computed(() => {
  console.log("=== Calcul de isFirstEpisode ===");
  console.log("currentSeason:", currentSeason.value);
  console.log("episodeUuid:", episodeUuid);

  if (!currentSeason.value || !currentSeason.value.episodes.length) {
    console.log("Retourne false car currentSeason est invalide ou sans épisodes.");
    return false;
  }

  const isFirst =
    currentSeason.value.seasonNumber === 1 &&
    currentSeason.value.episodes[0].uuid === episodeUuid;

  console.log("isFirstEpisode:", isFirst);
  return isFirst;
});

const isLastEpisode = computed(() => {
  console.log("=== Calcul de isLastEpisode ===");
  const lastSeason = content.value.seasons.at(-1);
  console.log("currentSeason:", currentSeason.value);
  console.log("lastSeason:", lastSeason);
  console.log("episodeUuid:", episodeUuid);

  if (!lastSeason || !lastSeason.episodes.length || !currentSeason.value) {
    console.log("Retourne false car lastSeason ou currentSeason est invalide.");
    return false;
  }

  const isLast =
    currentSeason.value.seasonNumber === lastSeason.seasonNumber &&
    currentSeason.value.episodes.at(-1).uuid === episodeUuid;

  console.log("isLastEpisode:", isLast);
  return isLast;
});

// Gestion de la navigation "Précédent"
const navigateToPrevious = () => {
  if (previousEpisode.value) {
    router.push(`/content-player/${contentUuid}/episode/${previousEpisode.value.uuid}`);
  }
};

// Gestion de la navigation "Suivant"
const navigateToNext = () => {
  if (nextEpisode.value) {
    router.push(`/content-player/${contentUuid}/episode/${nextEpisode.value.uuid}`);
  }
};

watch(
  () => [route.params.contentUuid, route.params.episodeUuid],
  ([newContentUuid, newEpisodeUuid], [oldContentUuid, oldEpisodeUuid]) => {
    if (newContentUuid !== oldContentUuid || newEpisodeUuid !== oldEpisodeUuid) {
      console.log('Changement détecté : recharge des données');
      loadContent();
    }
  }
);

watch(() => isFirstEpisode.value, (newVal) => {
  console.log('isFirstEpisode:', newVal);
});

watch(() => isLastEpisode.value, (newVal) => {
  console.log('isLastEpisode:', newVal);
});

</script>

<style scoped>
.video-page {
  display: flex;
  flex-direction: column;
  background-color: #100f10;
  color: #ffffff;
  padding: 15px;
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
  margin-bottom: 15px;
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
    height: 350px; /* Hauteur réduite */
  }
}

@media (max-width: 600px) {
  .video-poster {
    height: 300px; /* Hauteur réduite */
  }
}

@media (max-width: 525px) {
  .video-poster {
    height: 260px; /* Hauteur réduite */
  }
}

@media (max-width: 475px) {
  .video-poster {
    height: 240px; /* Hauteur réduite */
  }
}
</style>
