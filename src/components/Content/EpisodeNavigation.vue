<template>
  <div class="episode-navigation">
    <!-- Bouton Précédent -->
    <button
      v-if="!isFirstEpisode"
      class="nav-button prev-button"
      @click="emitPrevious"
    >
      <i class="fas fa-chevron-left"></i>
      <span class="button-text">Précédent</span>
    </button>

    <!-- Sélecteur de saison -->
    <SeasonSelector :seasons="seasons" :currentSeason="currentSeasonNumber" @seasonChange="onSeasonChange" />

    <!-- Sélecteur d'épisode -->
    <EpisodeSelector
      :episodes="currentSeasonEpisodes"
      :currentEpisodeUuid="currentEpisodeUuid"
      @episodeChange="onEpisodeChange"
    />

    <!-- Bouton Suivant -->
    <button
      v-if="!isLastEpisode"
      class="nav-button next-button"
      @click="emitNext"
    >
      <span class="button-text">Suivant</span>
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import SeasonSelector from '@/components/Content/SeasonSelector.vue';
import EpisodeSelector from '@/components/Content/EpisodeSelector.vue';

const props = defineProps<{
  currentEpisodeUuid: string; // UUID de l'épisode en cours
  currentSeasonNumber: number; // Numéro de la saison en cours
  seasons: Array<{
    seasonNumber: number;
    episodes: Array<{
      episodeNumber: number;
      uuid: string;
    }>;
  }>; // Liste des saisons et épisodes
  isFirstEpisode: boolean; // Indique si l'épisode actuel est le premier
  isLastEpisode: boolean; // Indique si l'épisode actuel est le dernier
}>();

const emits = defineEmits<{
  (event: 'previous'): void;
  (event: 'next'): void;
  (event: 'seasonChange', payload: number): void;
  (event: 'episodeChange', payload: string): void;
}>();

// Liste des épisodes pour la saison actuelle
const currentSeasonEpisodes = computed(() => {
  const currentSeason = props.seasons.find(
    (season) => season.seasonNumber === props.currentSeasonNumber
  );
  return currentSeason ? currentSeason.episodes : [];
});

// Événements à émettre
const emitPrevious = () => {
  console.log('Bouton Précédent cliqué');
  console.log('isFirstEpisode:', props.isFirstEpisode);
  emits('previous');
};

const emitNext = () => {
  console.log('Bouton Suivant cliqué');
  console.log('isLastEpisode:', props.isLastEpisode);
  emits('next');
};
const onSeasonChange = (seasonNumber: number) => emits('seasonChange', seasonNumber);
const onEpisodeChange = (episodeUuid: string) => emits('episodeChange', episodeUuid);
</script>

<style scoped>
.episode-navigation {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
}

/* Boutons de navigation */
.nav-button {
  display: flex;
  align-items: center;
  gap: 8px; /* Espace entre l'icône et le texte */
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  background-color: #27272A;
  color: #d5d5d5; /* Texte noir */
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  min-height: 41px;
}

.nav-button i {
  font-size: 16px; /* Taille des icônes */
}

.nav-button:hover {
  background-color: #222225;
  color: #e8e8e8;
  transform: scale(1.01);
}

.next-button {
  background-color: #00a27b;
  color: #e1e1e1;
}

.next-button:hover {
  background-color: #009372;
  color: #e1e1e1;
}

@media (max-width: 580px) {
  .button-text {
    display: none;
  }
}
</style>
