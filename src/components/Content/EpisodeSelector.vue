<template>
  <div class="custom-select" ref="selectRef">
    <div class="select-trigger" @click="toggleDropdown">
      <span>{{ selectedOption }}</span>
      <i class="fas fa-chevron-down chevron" :style="{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"></i>
    </div>
    <transition name="dropdown">
      <div v-show="dropdownOpen" class="options">
        <div
          class="option"
          v-for="episode in episodes"
          :key="episode.uuid"
          :class="{ active: episode.uuid === currentEpisodeUuid }"
          @click="selectOption(episode)"
        >
          {{ isMobile ? episode.episodeNumber : `Épisode ${episode.episodeNumber}` }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// Props
const props = defineProps<{
  episodes: Array<{
    uuid: string;
    episodeNumber: number;
    title: string;
  }>;
  currentEpisodeUuid: string | null; // UUID de l'épisode sélectionné
}>();

const isMobile = ref(window.innerWidth <= 440);

const updateScreenSize = () => {
  isMobile.value = window.innerWidth <= 440;
};

// Émits
const emits = defineEmits<{
  (event: 'episodeChange', payload: string): void; // Événement émis lors d'un changement d'épisode
}>();

// Dropdown state
const dropdownOpen = ref(false);
const selectedOption = ref('');

// Fonction pour synchroniser l'option sélectionnée avec l'épisode actuel
const updateSelectedOption = () => {
  console.log('--- Fonction `updateSelectedOption` appelée ---');
  console.log('Episodes disponibles :', props.episodes);
  console.log('UUID d’épisode actuel :', props.currentEpisodeUuid);

  const currentEpisode = props.episodes.find(ep => ep.uuid === props.currentEpisodeUuid);

  if (currentEpisode) {
    selectedOption.value = isMobile.value
      ? `${currentEpisode.episodeNumber}` // Pas de "Épisode" pour mobile
      : `Épisode ${currentEpisode.episodeNumber}`;
  } else {
    console.warn('Aucun épisode correspondant trouvé !');
    selectedOption.value = 'Épisode inconnu';
  }
};

// Synchroniser à l'initialisation
onMounted(() => {
  console.log('--- Composant monté ---');
  console.log('Props reçus au montage :', props);
  updateSelectedOption();
});

// Synchroniser à chaque mise à jour de `currentEpisodeUuid` ou `episodes`
watch(
  () => [props.currentEpisodeUuid, props.episodes],
  () => {
    console.log('--- Changement détecté dans `currentEpisodeUuid` ou `episodes` ---');
    updateSelectedOption();
  },
  { deep: true }
);

// Gérer l'ouverture/fermeture du dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Gérer la sélection d'un épisode
const selectOption = (episode: { uuid: string; episodeNumber: number; title: string }) => {
  console.log('Épisode sélectionné :', episode);
  selectedOption.value = isMobile.value
    ? `${episode.episodeNumber}` // Pas de "Épisode" pour mobile
    : `Épisode ${episode.episodeNumber}`;
  dropdownOpen.value = false;
  emits('episodeChange', episode.uuid); // Émettre l'UUID de l'épisode sélectionné
};

// Gérer les clics en dehors du sélecteur
const selectRef = ref<HTMLDivElement | null>(null);
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', updateScreenSize);
  updateSelectedOption();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateScreenSize);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  display: inline-block;
  width: 135px; /* Largeur ajustée pour les titres d'épisodes */
  font-size: 14px;
  font-weight: bold;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #27272A;
  color: #d5d5d5;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.select-trigger:hover {
  background-color: #222225;
}

.chevron {
  font-size: 14px;
  transition: transform 0.2s ease-in-out;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #27272A;
  border-radius: 8px;
  margin-top: 5px;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  max-height: calc(5 * 40px);
  scroll-behavior: smooth;
}

/* Personnalisation de la barre de défilement */
.options::-webkit-scrollbar {
  width: 6px; /* Largeur de la barre de défilement */
}

.options::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2); /* Couleur discrète pour le "pouce" */
  border-radius: 4px; /* Coins arrondis pour un effet plus fluide */
}

.options::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4); /* Couleur légèrement plus visible au survol */
}

.options::-webkit-scrollbar-track {
  background-color: transparent; /* Couleur de l'arrière-plan de la barre (invisible) */
}

/* Pour éviter les défilements visibles dans Firefox */
.options {
  scrollbar-width: thin; /* Réduit la largeur de la barre sur Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent; /* Couleur et transparence */
}

.option {
  padding: 10px 15px;
  color: #d5d5d5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: 40px;
}

.option:hover {
  background-color: #222225;
  color: #e8e8e8;
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 440px) {
  .custom-select {
    width: 80px;
  }
}
</style>
