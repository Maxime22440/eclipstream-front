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
          v-for="season in seasons"
          :key="season.seasonNumber"
          :class="{ active: season.seasonNumber === currentSeason }"
          @click="selectSeason(season.seasonNumber)"
        >
          Saison {{ season.seasonNumber }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  seasons: Array<{ seasonNumber: number }>; // Liste des saisons
  currentSeason: number; // Saison actuellement sélectionnée
}>();

const emits = defineEmits<{
  (event: 'seasonChange', seasonNumber: number): void;
}>();

const dropdownOpen = ref(false); // État du menu déroulant
const selectRef = ref<HTMLDivElement | null>(null); // Référence au conteneur du sélecteur

// Option sélectionnée par défaut
const selectedOption = ref(`Saison ${props.currentSeason}`);

// Fonction pour ouvrir/fermer le menu
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Fonction pour sélectionner une saison
const selectSeason = (seasonNumber: number) => {
  selectedOption.value = `Saison ${seasonNumber}`;
  dropdownOpen.value = false;
  emits('seasonChange', seasonNumber); // Émet l'événement avec le numéro de la saison sélectionnée
};

// Fonction pour détecter les clics en dehors du sélecteur
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    dropdownOpen.value = false;
  }
};

// Ajouter et retirer l'écouteur pour les clics extérieurs
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  display: inline-block;
  width: 120px; /* Largeur du sélecteur */
  font-size: 14px;
  font-weight: bold;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #27272A; /* Fond du sélecteur */
  color: #d5d5d5; /* Couleur du texte */
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.select-trigger:hover {
  background-color: #222225;
  color: #e8e8e8;
}

.chevron {
  font-size: 14px;
  transition: transform 0.2s ease-in-out; /* Transition fluide */
}

/* Transition personnalisée */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease; /* Transition fluide */
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px); /* Légère remontée lors de l'apparition/disparition */
}

.dropdown-leave-from, .dropdown-enter-to {
  opacity: 1;
  transform: translateY(0); /* Position normale */
}

/* Conteneur des options */
.options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #27272A;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  margin-top: 5px;
  z-index: 10;
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

.option:last-child {
  border-radius: 0 0 8px 8px;
}
</style>
