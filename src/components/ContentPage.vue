<template>
  <div class="content-page">
    <!-- Titre du contenu (Films, Séries, Animés) centré -->
    <div class="content-type-title">{{ displayType }}</div>

    <!-- Carousel des genres -->
    <div class="genres-container-wrapper">
      <Swiper
        :modules="[Navigation]"
        navigation
        slides-per-view="auto"
        :slides-per-group="2"
        :space-between="24"
        class="genres-swiper"
      >
        <SwiperSlide
          v-for="genre in genres"
          :key="genre.id"
          class="genre-slide"
        >
          <button
            class="genre-button"
            :class="{ active: activeGenre === genre.id }"
            @click="selectGenre(genre.id)"
          >
            <span class="bg-zoom"></span>
            <span class="button-text">{{ genre.name }}</span>
          </button>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Spinner global sous le carousel -->
    <div v-if="loading" class="hero-loading">
      <i class="fas fa-spinner fa-spin"></i>
    </div>

    <!-- Grille de thumbnails -->
    <div class="thumbnails-grid">
      <div
        v-for="content in contents"
        :key="content.id"
        class="thumbnail"
        @click="goToContent(content.id)"
      >
        <div class="thumbnail-img" :style="{ backgroundImage: `url(${content.thumbnail})` }">
          <div class="play-overlay">
            <i class="fas fa-play"></i>
          </div>
        </div>
        <div class="thumbnail-details">
          <div class="thumbnail-info">
            <span class="thumbnail-year">{{ formatYear(content.release_date) }}</span>
          </div>
          <div class="thumbnail-title">{{ content.title }}</div>
        </div>
      </div>
    </div>

    <!-- Élément trigger pour l'infinite scroll -->
    <div ref="infiniteScrollTrigger" class="scroll-trigger"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onBeforeUnmount, computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import { fetchAllMovies, fetchMoviesByGenre } from '@/api/contents'
import { fetchGenres } from '@/api/genres'

const props = defineProps({
  type: {
    type: String,
    default: 'movie'
  }
});

// Propriété calculée pour le titre de la page
const displayType = computed(() => {
  const t = props.type.toLowerCase();
  if (t === 'movie') return 'Films';
  if (t === 'series') return 'Séries';
  if (t === 'anime') return 'Animés';
  return props.type.charAt(0).toUpperCase() + props.type.slice(1);
});

// Récupération des genres depuis l'API
const genres = reactive([]);
const loadGenres = async () => {
  try {
    const fetchedGenres = await fetchGenres();
    genres.splice(0, genres.length, { id: 'all', name: 'Tous' }, ...fetchedGenres);
  } catch (error) {
    console.error("Erreur lors de la récupération des genres", error);
  }
};

const activeGenre = ref('all');
const contents = ref([]);
const currentPage = ref(1);
const loading = ref(false);

// Chargement des contenus pour les types autres que "movie"
const loadContents = async () => {
  if (loading.value) return;
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulation d'un appel API
  const newContents = [];
  for (let i = 0; i < 20; i++) {
    const id = (currentPage.value - 1) * 20 + i + 1;
    newContents.push({
      id,
      title: `Contenu ${activeGenre.value} n°${id}`,
      thumbnail: 'https://via.placeholder.com/300x450?text=Image+' + id,
      release_date: '2023-01-01',
      imdb_rating: '7.5',
      duration: '120 min',
      total_views: Math.floor(Math.random() * 10000)
    });
  }
  contents.value.push(...newContents);
  currentPage.value++;
  loading.value = false;
};

// Sélection d'un genre
const selectGenre = async (genreId) => {
  if (activeGenre.value === genreId) return;
  activeGenre.value = genreId;
  contents.value = [];
  currentPage.value = 1;
  loading.value = true;

  if (props.type.toLowerCase() === 'movie') {
    if (genreId === 'all') {
      try {
        const movies = await fetchAllMovies();
        contents.value = movies.map(movie => ({
          ...movie,
          thumbnail: getImageComponentOrPath(movie.thumbnail_path) || movie.thumbnail,
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération de tous les films", error);
      }
    } else {
      try {
        const moviesByGenre = await fetchMoviesByGenre(genreId);
        contents.value = moviesByGenre.map(movie => ({
          ...movie,
          thumbnail: getImageComponentOrPath(movie.thumbnail_path) || movie.thumbnail,
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des films par genre", error);
      }
    }
    loading.value = false;
  } else {
    loadContents();
  }
};

const router = useRouter();
const goToContent = (id) => {
  router.push({ name: 'ContentPlayer', params: { uuid: id } });
};

const infiniteScrollTrigger = ref(null);
let observer = null;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getImageComponentOrPath = (path) => {
  const baseUrl = backendUrl.replace('/api', '');
  return path ? `${baseUrl}/storage/${path}` : null;
};

const formatYear = (dateStr) => {
  const date = new Date(dateStr);
  return isNaN(date.getFullYear()) ? '' : date.getFullYear();
};

onMounted(async () => {
  await loadGenres();

  loading.value = true;
  if (props.type.toLowerCase() === 'movie') {
    try {
      const movies = await fetchAllMovies();
      contents.value = movies.map(movie => ({
        ...movie,
        thumbnail: getImageComponentOrPath(movie.thumbnail_path) || movie.thumbnail,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération de tous les films", error);
    }
    loading.value = false;
  } else {
    loadContents();
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && props.type.toLowerCase() !== 'movie') {
        loadContents();
      }
    });
  });
  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value);
  }
});

watch(() => activeGenre.value, () => {
  if (props.type.toLowerCase() !== 'movie') {
    contents.value = [];
    currentPage.value = 1;
    loadContents();
  }
});

onBeforeUnmount(() => {
  if (observer && infiniteScrollTrigger.value) {
    observer.unobserve(infiniteScrollTrigger.value);
  }
});
</script>

<style scoped>
.content-page {
  width: 100%;
  padding-bottom: 2rem;
}

.content-type-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin: 20px 0;
}

.genres-container-wrapper {
  width: 100%;
  margin-bottom: 32px;
  margin-top: 20px;
  padding: 0 10px;
  overflow: hidden;
}

.genres-swiper {
  width: 100%;
}

.genre-slide {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 130px;
}

.genre-button {
  position: relative;
  display: block;
  width: 100%;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  margin: 0 4px;
  overflow: hidden;
}

.button-text {
  position: relative;
  z-index: 2;
  font-size: 15px;
}

.bg-zoom {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #333;
  border-radius: 4px;
  z-index: 1;
  transition: background-color 0.3s;
}

.genre-button:hover .bg-zoom {
  background: #222;
}

.genre-button.active .bg-zoom {
  background: #00CC9B;
}

.thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 0 0.5rem;
}

.thumbnail {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thumbnail-img {
  position: relative;
  width: 100%;
  padding-top: 150%; /* Ratio fixe */
  background-size: cover;
  background-position: center;
  background-color: #ccc;
  border-radius: 10px;
}

.thumbnail-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 5px;
}

.thumbnail-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4px;
}

.thumbnail-year,
.thumbnail-rating {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #ffffff80;
}

.thumbnail-title {
  text-align: left;
  font-size: 0.9rem;
  color: #e8e8e8;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 28px;
  opacity: 0;
  transition: opacity 0.3s;
}

.thumbnail-img:hover .play-overlay {
  opacity: 1;
}

.scroll-trigger {
  height: 1px;
}

/* Boutons de navigation Swiper */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  font-weight: bold;
  color: #00CC9B;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background: #100f10;
  border-radius: 6px;
  width: 30px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, color 0.3s;
}

:deep(.swiper-button-prev:after),
:deep(.swiper-button-next:after) {
  font-size: 21px;
  transition: transform 0.3s;
}

:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover {
  color: #00B388;
  background: #1e1e1e;
}

:deep(.swiper-button-prev):hover:after,
:deep(.swiper-button-next):hover:after {
  transform: scale(1.1);
}

:deep(.swiper-button-prev) {
  margin-left: -10px;
}

:deep(.swiper-button-next) {
  margin-right: -10px;
}

/* Style du spinner */
.hero-loading {
  position: relative;
  margin: 150px auto;
  text-align: center;
  font-size: 3rem;
  color: #00CC9B;
}
</style>
