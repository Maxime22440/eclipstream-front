<template>
  <div class="video-page">

    <!-- Section poster ou lecteur vidéo -->
    <div class="video-poster">
      <!-- Affiche le poster si la vidéo n'est pas en lecture -->
      <div v-if="!isPlaying">
        <img
          v-if="getImageComponentOrPath(poster)"
          :src="getImageComponentOrPath(poster)"
          alt="Poster du contenu"
          @load="imageLoaded = true"
          class="poster-image"
          :class="{ 'loaded': imageLoaded }"
        />

        <!-- Si l'image n'est pas disponible -->
        <div
          v-else
          class="poster-placeholder"
          :class="{ 'hidden': imageLoaded }"
        >
          <MovieIcon class="poster-icon" />
        </div>

        <!-- Bouton Play -->
        <button
          v-if="imageLoaded"
          class="play-button"
          @click="playVideo"
        >
          <i class="fas fa-play"></i>
        </button>
      </div>

      <!-- Affiche le lecteur vidéo si la vidéo est en lecture -->
      <div v-else>
        <!-- Affiche une erreur si elle existe -->
        <div v-if="error" class="video-error">
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
        >
          <source :src="fullVideoLink" type="video/mp4" />
        </video>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { fetchContent } from '@/api/content'; // Utilisation de ta méthode API existante
import MovieIcon from '@/components/icons/MovieIcon.vue';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Récupération de l'UUID depuis les paramètres de l'URL
const route = useRoute();
const router = useRouter();
const contentUuid = (route.params.contentUuid || route.params.uuid) as string;
const episodeUuid = route.params.episodeUuid as string | null;

// Variables réactives
const content = ref({
  title: '',
  type: '',
  rating: 0,
  genres: [] as string[],
  country: '',
  duration: '',
  description: '',
  cast: [] as string[],
  seasons: [] as Array<{
    seasonNumber: number;
    episodes: Array<{
      uuid: string;
      episodeNumber: number;
      title: string;
      duration: number;
      description: string;
    }>;
  }>,
});

const poster = ref('');
const videoLink = ref('');
const imageLoaded = ref(false);
const isPlaying = ref(false); // Variable pour afficher ou non le lecteur vidéo
const error = ref<string | null>(null);

// Fonction pour récupérer le contenu depuis l'API
const loadContent = async () => {
  try {
    const data = await fetchContent(contentUuid);

    content.value = {
      title: data.title,
      type: data.type,
      rating: data.imdb_rating,
      genres: data.genres.map((genre: any) => genre.name),
      country: data.country,
      duration: data.duration,
      description: data.description,
      cast: data.actors.map((actor: any) => actor.name),
      seasons: (data.seasons || []).map((season: any) => ({
        seasonNumber: season.season_number,
        episodes: (season.episodes || []).map((episode: any) => ({
          uuid: episode.uuid,
          episodeNumber: episode.episode_number,
          title: episode.title,
          rating: episode.imdb_rating,
          duration: episode.duration,
          description: episode.description,
        })),
      })),
    };

    poster.value = data.poster_path;
    videoLink.value = data.stream_link; // Lien vidéo depuis l'API
    console.log('Lien relatif vidéo (API):', videoLink.value);
    console.log('Lien complet vidéo:', fullVideoLink.value);
  } catch (err) {
    error.value = 'Erreur lors de la récupération des données.';
    console.error(err);
  }
};

// Bouton Play pour lancer la vidéo
const playVideo = () => {
  isPlaying.value = true;
  error.value = null; // Réinitialise les erreurs
  console.log('Lecture vidéo via :', fullVideoLink.value);
};

const getImageComponentOrPath = (path: string) => {
  const baseUrl = backendUrl.replace('/api', '');
  return path ? `${baseUrl}/storage/${path}` : null;
};

const fullVideoLink = computed(() => {
  return `http://localhost:8000/api/stream/episodes/ad94de2b-81a9-4da4-a284-6fbf0a83ce2d`; // Concatène le backend URL avec le chemin relatif
});

onMounted(() => {
  if (!contentUuid) {
    error.value = 'Aucun UUID de contenu fourni dans l’URL.';
    return;
  }

  loadContent();
});

watch(fullVideoLink, (newVal) => {
  console.log('Lien vidéo mis à jour :', newVal);
});
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

.video-js {
  width: 100%;
  height: 500px;
  object-fit: contain;
  background-color: black;
  border-radius: 15px;
}

@media (max-width: 1100px) {
  .video-poster {
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
  .video-js {
    height: 280px;
  }
}

@media (max-width: 575px) {
  .video-poster {
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
  .video-js {
    height: 180px;
  }
}
</style>
