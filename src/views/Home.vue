<template>
  <div class="home">
    <!-- Section Héro (Film au Hasard) -->
    <section class="hero">
      <img
        class="hero-image"
        :src="getImageComponentOrPath(randomMovie?.poster_path)"
        alt="Film aléatoire"
        @load="handleImageLoad"
      />
      <div v-if="!imageLoaded" class="hero-loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <div class="hero-overlay">
        <h1 class="hero-title">{{ randomMovie?.title }}</h1>
        <div class="hero-buttons">
          <button class="btn btn-primary" @click="playMovie">
            <i class="fas fa-play"></i> Lecture
          </button>
        </div>
      </div>
    </section>

    <!-- Section Nouveautés - Films -->
    <section class="films">
      <h2 class="section-title">Films ajoutés</h2>
      <div ref="swiperContainer" class="swiper-wrapper-container">
        <!-- Le Swiper est rendu uniquement lorsque latestMovies est non vide -->
        <Swiper
          v-if="latestMovies.length > 0"
          :key="latestMovies.length"
          :modules="[Navigation]"
          navigation
          :slides-per-view="slidesPerView"
          :space-between="spaceBetween"
          class="swiper-container"
          loop
        >
          <SwiperSlide
            v-for="(movie, index) in latestMovies"
            :key="'film-' + index"
            class="slide"
            @click="goToContentPlayer(movie.uuid)"
          >
            <img
              class="slide-image"
              :src="getImageComponentOrPath(movie.thumbnail_path)"
              alt="Thumbnail Film"
              :style="animateSlides ? { animationDelay: (index * 0.05) + 's' } : {}"
              :class="{ animate: animateSlides }"
            />
            <div class="slide-overlay">
              <h3 class="slide-title">{{ movie.title }}</h3>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>

    <!-- Section Films tendance -->
    <section class="films">
      <h2 class="section-title">Films tendance</h2>
      <div ref="trendingContainer" class="swiper-wrapper-container">
        <Swiper
          v-if="topViewedMovies.length > 0"
          :modules="[Navigation]"
          navigation
          :slides-per-view="trendingSlidesPerView"
          :space-between="trendingSpaceBetween"
          class="swiper-container"
          loop
        >
          <SwiperSlide
            v-for="(movie, index) in topViewedMovies"
            :key="'trending-' + index"
            class="slide"
            @click="goToContentPlayer(movie.uuid)"
          >
            <img
              class="slide-image"
              :src="getImageComponentOrPath(movie.thumbnail_path)"
              alt="Thumbnail Film tendance"
            />
            <div class="slide-overlay">
              <h3 class="slide-title">{{ movie.title }}</h3>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import { fetchRandomMovie, fetchLatestMovies, fetchTopViewedMovies } from '@/api/contents'

// Initialisation du router
const router = useRouter()

// Récupération de l'URL backend depuis les variables d'environnement
const backendUrl = import.meta.env.VITE_BACKEND_URL

// Fonction de résolution du chemin d'image
const getImageComponentOrPath = (path) => {
  const baseUrl = backendUrl.replace('/api', '')
  return path ? `${baseUrl}/storage/${path}` : null
}

// Variable indiquant si l'image héro est chargée
const imageLoaded = ref(false)
const handleImageLoad = () => {
  imageLoaded.value = true
}

// Variable pour contrôler l'animation de chargement des slides (true uniquement au chargement)
const animateSlides = ref(true)

// Paramètres pour le carousel
const fixedSlideWidth = 162  // Correspond à la largeur définie en CSS
const minSpace = 18          // Espace minimal entre les slides

// Références et paramètres pour la section "Films ajoutés"
const swiperContainer = ref(null)
const slidesPerView = ref(1)
const spaceBetween = ref(minSpace)

// Références et paramètres pour la section "Films tendance"
const trendingContainer = ref(null)
const trendingSlidesPerView = ref(1)
const trendingSpaceBetween = ref(minSpace)

// Variables pour le film aléatoire, les films ajoutés et les films tendance
const randomMovie = ref(null)
const latestMovies = ref([])    // Films ajoutés
const topViewedMovies = ref([]) // Films tendance (top viewed movies)

// Fonction pour mettre à jour la configuration du carousel selon la taille de l'écran
function updateSpacing(containerRef, slidesViewRef, spaceBetweenRef) {
  if (containerRef.value) {
    if (window.innerWidth <= 1100) {
      slidesViewRef.value = 'auto'
      spaceBetweenRef.value = minSpace
    } else {
      const containerWidth = containerRef.value.clientWidth
      const N = Math.floor((containerWidth + minSpace) / (fixedSlideWidth + minSpace))
      slidesViewRef.value = N > 0 ? N : 1
      spaceBetweenRef.value = N > 1 ? (containerWidth - (N * fixedSlideWidth)) / (N - 1) : 0
    }
  }
}

function updateAllSpacings() {
  updateSpacing(swiperContainer, slidesPerView, spaceBetween)
  updateSpacing(trendingContainer, trendingSlidesPerView, trendingSpaceBetween)
}

onMounted(async () => {
  updateAllSpacings()
  window.addEventListener('resize', updateAllSpacings)
  try {
    randomMovie.value = await fetchRandomMovie()
    latestMovies.value = await fetchLatestMovies()
    topViewedMovies.value = await fetchTopViewedMovies()
    await nextTick() // Attendre que le DOM soit mis à jour
    // Après 500ms, désactiver l'animation
    setTimeout(() => {
      animateSlides.value = false
    }, 500)
  } catch (error) {
    console.error("Erreur lors de la récupération des films", error)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateAllSpacings)
})

// Fonction de redirection vers le lecteur de contenu avec l'UUID du film
function playMovie() {
  if (randomMovie.value && randomMovie.value.uuid) {
    router.push({ name: 'ContentPlayer', params: { uuid: randomMovie.value.uuid } })
  } else {
    console.error("Film aléatoire introuvable ou UUID manquant.")
  }
}

// Fonction de redirection vers le lecteur de contenu avec l'UUID d'un film sélectionné
function goToContentPlayer(uuid) {
  if (uuid) {
    router.push({ name: 'ContentPlayer', params: { uuid } })
  } else {
    console.error("UUID introuvable pour le film sélectionné.")
  }
}
</script>

<style scoped>
/* Conteneur principal */
.home {
  display: flex;
  flex-direction: column;
  width: 102%;
  margin-top: -60px;
  margin-bottom: 20px;
}

/* Section Héro */
.hero {
  position: relative;
  height: 78vh;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  font-size: 3rem;
  color: #00CC9B;
}

.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(to top, rgba(16, 15, 16, 1), rgba(16, 15, 16, 0) 40%),
    linear-gradient(to bottom, rgba(16, 15, 16, 1), rgba(16, 15, 16, 0) 40%),
    linear-gradient(to left, rgba(16, 15, 16, 1), rgba(16, 15, 16, 0) 40%),
    linear-gradient(to right, rgba(16, 15, 16, 1), rgba(16, 15, 16, 0) 40%);
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 20px 35px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 2;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: bold;
  color: #fff;
  margin-left: 50px;
  margin-bottom: 15px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 1);
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
  margin-left: 50px;
}

.btn-primary {
  background-color: #00CC9B;
  color: #ececec;
  padding: 8px 28px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}
.btn-primary:hover {
  background-color: #00B388;
  transform: scale(1.03);
}
.btn-primary i {
  margin-right: 8px;
}

.section-title {
  font-size: 1.7rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 25px;
  padding: 35px 35px 0;
}

.swiper-wrapper-container {
  padding: 0 35px;
  overflow: visible;
}

/* Slide sans animation appliquée par défaut */
.slide {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  width: 162px;
  height: 225px;
  cursor: pointer;
}

/* Par défaut, les images sont visibles */
.slide-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  opacity: 1; /* Visible par défaut */
}

/* Si la classe "animate" est présente, l'image démarre à 0 et s'anime vers 1 */
.slide-image.animate {
  opacity: 0;
  animation: fadeIn 0.1s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s;
  font-size: 18px;
}
.slide:hover .slide-overlay {
  background-color: rgba(0, 0, 0, 0.6);
}
.slide-title {
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  padding: 0 10px;
  text-align: center;
}
.slide:hover .slide-title {
  opacity: 1;
}

/* Boutons de navigation Swiper */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  font-weight: bold;
  color: #00CC9B;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 1);
  border-radius: 25px;
  width: 30px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, color 0.3s;
}
:deep(.swiper-button-prev:after),
:deep(.swiper-button-next:after) {
  font-size: 21px;
}
:deep(.swiper-button-prev):hover,
:deep(.swiper-button-next):hover {
  color: #00B388;
  background-color: rgb(44, 34, 34);
}
:deep(.swiper-button-prev) {
  margin-left: -5px;
}
:deep(.swiper-button-next) {
  margin-right: -5px;
}

@media (max-width: 700px) {
  .hero-overlay {
    padding: 10px 15px;
  }
  .hero-title {
    margin-left: 20px;
    margin-bottom: 15px;
    font-size: 1.8rem;
    line-height: 1.2;
  }
  .hero-buttons {
    margin-left: 20px;
    margin-bottom: 55px;
  }
}
</style>
