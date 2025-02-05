<template>
  <div class="upload-form">
    <h2>Upload de contenu vidéo</h2>

    <!-- Section pour les films non uploadés -->
    <div class="upload-movie">
      <h3>Films non uploadés</h3>
      <div v-if="notUploadedMovies.length > 0">
        <ul class="item-list">
          <li
            v-for="movie in notUploadedMovies"
            :key="movie.id"
            :class="{ selected: selectedMovie && selectedMovie.id === movie.id }"
            @click="selectMovie(movie)"
          >
            {{ movie.title }}
          </li>
        </ul>
      </div>
      <div v-else class="no-items">
        <p>Aucun film non uploadé trouvé.</p>
      </div>
      <div v-if="selectedMovie" class="form-group">
        <label for="movieFile">Uploader la vidéo du film sélectionné</label>
        <input type="file" @change="onMovieFileSelected" accept="video/*" />
      </div>
      <button v-if="selectedMovie && movieFile" @click="uploadMovieVideo">
        Uploader le film
      </button>
    </div>

    <hr />

    <!-- Section pour les épisodes non uploadés -->
    <div class="upload-episode">
      <h3>Épisodes non uploadés</h3>
      <div v-if="notUploadedEpisodes.length > 0">
        <ul class="item-list">
          <li
            v-for="episode in notUploadedEpisodes"
            :key="episode.id"
            :class="{ selected: selectedEpisode && selectedEpisode.id === episode.id }"
            @click="selectEpisode(episode)"
          >
            Épisode {{ episode.episode_number }} - {{ episode.title }}
          </li>
        </ul>
      </div>
      <div v-else class="no-items">
        <p>Aucun épisode non uploadé trouvé.</p>
      </div>
      <div v-if="selectedEpisode" class="form-group">
        <label for="episodeFile">Uploader la vidéo de l'épisode sélectionné</label>
        <input type="file" @change="onEpisodeFileSelected" accept="video/*" />
      </div>
      <button v-if="selectedEpisode && episodeFile" @click="uploadEpisodeVideo">
        Uploader l'épisode
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchNotUploadedContent } from '@/api/contents';
import { fetchNotUploadedEpisodes } from '@/api/episodes';
import { uploadContentVideo, uploadEpisodeVideo } from '@/api/uploads';

//
// SECTION FILMS
//
const notUploadedMovies = ref<any[]>([]);
const selectedMovie = ref<any>(null);
const movieFile = ref<File | null>(null);

const loadNotUploadedMovies = async () => {
  try {
    const movies = await fetchNotUploadedContent();
    // On mappe les films pour obtenir un format simple
    notUploadedMovies.value = movies.map((movie: any) => ({
      id: movie.uuid,
      title: movie.title,
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des films non uploadés :", error);
  }
};

const selectMovie = (movie: any) => {
  selectedMovie.value = movie;
  movieFile.value = null;
};

const onMovieFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    movieFile.value = target.files[0];
  }
};

const uploadMovieVideo = async () => {
  if (selectedMovie.value && movieFile.value) {
    const formData = new FormData();
    // Notez que le back attend 'content_uuid'
    formData.append('content_uuid', selectedMovie.value.id);
    formData.append('video', movieFile.value);

    try {
      await uploadContentVideo(formData);
      alert("Film uploadé avec succès !");
      // Réinitialiser la sélection et rafraîchir la liste
      selectedMovie.value = null;
      movieFile.value = null;
      await loadNotUploadedMovies();
    } catch (error) {
      console.error("Erreur lors de l'upload du film :", error);
      alert("Erreur lors de l'upload du film");
    }
  }
};

//
// SECTION ÉPISODES
//
const notUploadedEpisodes = ref<any[]>([]);
const selectedEpisode = ref<any>(null);
const episodeFile = ref<File | null>(null);

const loadNotUploadedEpisodes = async () => {
  try {
    const episodes = await fetchNotUploadedEpisodes();
    // On mappe les épisodes pour obtenir un format simplifié
    notUploadedEpisodes.value = episodes.map((episode: any) => ({
      id: episode.uuid,
      episode_number: episode.episode_number,
      title: episode.title,
    }));
  } catch (error) {
    console.error("Erreur lors du chargement des épisodes non uploadés :", error);
  }
};

const selectEpisode = (episode: any) => {
  selectedEpisode.value = episode;
  episodeFile.value = null;
};

const onEpisodeFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    episodeFile.value = target.files[0];
  }
};

const uploadEpisodeVideoHandler = async () => {
  if (selectedEpisode.value && episodeFile.value) {
    const formData = new FormData();
    // Notez que le back attend 'episode_uuid'
    formData.append('episode_uuid', selectedEpisode.value.id);
    formData.append('video', episodeFile.value);

    try {
      await uploadEpisodeVideo(formData);
      alert("Épisode uploadé avec succès !");
      // Réinitialiser la sélection et rafraîchir la liste
      selectedEpisode.value = null;
      episodeFile.value = null;
      await loadNotUploadedEpisodes();
    } catch (error) {
      console.error("Erreur lors de l'upload de l'épisode :", error);
      alert("Erreur lors de l'upload de l'épisode");
    }
  }
};

onMounted(async () => {
  await loadNotUploadedMovies();
  await loadNotUploadedEpisodes();
});
</script>

<style scoped>
.upload-form {
  background-color: #100f10;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6),
  0 4px 6px rgba(0, 0, 0, 0.4),
  0 0 10px rgba(255, 255, 255, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  font-size: 24px;
  color: #fff;
  margin-bottom: 15px;
  text-align: center;
}

h3 {
  font-size: 20px;
  color: #ccc;
  margin-bottom: 10px;
  border-bottom: 1px solid #404040;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  color: #ccc;
  margin-bottom: 10px;
  display: block;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #404040;
  border-radius: 5px;
  background: linear-gradient(90deg, rgba(97, 97, 97, 0.8) 0%, rgba(196, 196, 196, 0.1) 100%);
  color: #fff;
  outline: none;
  box-sizing: border-box;
}

input::placeholder {
  color: #888;
}

input:focus {
  border-color: #00cc9b;
  box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

hr {
  border: none;
  border-top: 1px solid #404040;
  margin: 30px 0;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #00cc9b;
  color: #000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 20px;
  transition: transform 0.2s, background-color 0.2s;
}

button:hover {
  transform: scale(1.01);
  background-color: #00b088;
}

button:active {
  transform: scale(0.99);
  background-color: #009f76;
}

/* Style pour la liste d'éléments */
.item-list {
  list-style-type: none;
  padding-left: 0;
}

.item-list li {
  padding: 8px;
  margin-bottom: 5px;
  background-color: #333;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  color: #ccc;
}

.item-list li:hover {
  background-color: #444;
}

.item-list li.selected {
  background-color: #00cc9b;
  color: #000;
}

.no-items {
  background-color: #2a2a30;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
