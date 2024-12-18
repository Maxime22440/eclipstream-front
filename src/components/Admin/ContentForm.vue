<template>
  <div class="content-form">
    <h2>Ajouter {{ contentTypeLabel }}</h2>
    <div class="underline"></div>
    <p>Prêt à enrichir votre bibliothèque avec un nouveau {{ contentTypeLabel.toLowerCase() }} ?</p>

    <!-- Affichage du message d'erreur global si présent -->
    <div v-if="error"
         class="error-message">
      {{ error }}
    </div>

    <form @submit.prevent="handleContentUpload">
      <!-- Titre -->
      <div class="form-group">
        <label for="title">Titre</label>
        <input v-model="title"
               type="text"
               id="title"
               placeholder="Entrez le titre"
               required/>
        <p v-if="validationErrors.title"
           class="validation-error"
           v-for="err in validationErrors.title"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Saga (modifié pour un input text) -->
      <div class="form-group">
        <label for="saga">Saga</label>
        <input v-model="saga"
               type="text"
               id="saga"
               placeholder="Entrez la saga (facultatif)"/>
        <p v-if="validationErrors.saga"
           class="validation-error"
           v-for="err in validationErrors.saga"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description">Description</label>
        <textarea v-model="description"
                  id="description"
                  placeholder="Entrez une description"
                  required></textarea>
        <p v-if="validationErrors.description"
           class="validation-error"
           v-for="err in validationErrors.description"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Date de sortie -->
      <div class="form-group">
        <label for="release_date">Date de sortie</label>
        <input v-model="release_date"
               type="date"
               id="release_date"
               required/>
        <p v-if="validationErrors.release_date"
           class="validation-error"
           v-for="err in validationErrors.release_date"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Note IMDb -->
      <div class="form-group">
        <label for="imdb_rating">Note IMDb</label>
        <input v-model="imdb_rating"
               type="number"
               step="0.1"
               max="10"
               min="0"
               id="imdb_rating"
               placeholder="Ex : 7.5"
               required/>
        <p v-if="validationErrors.imdb_rating"
           class="validation-error"
           v-for="err in validationErrors.imdb_rating"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Durée -->
      <div class="form-group">
        <label for="duration">Durée (en minutes)</label>
        <input v-model="duration"
               type="number"
               id="duration"
               placeholder="Entrez une durée"
               required/>
        <p v-if="validationErrors.duration"
           class="validation-error"
           v-for="err in validationErrors.duration"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Pays -->
      <div class="form-group">
        <label for="country">Pays</label>
        <input v-model="country"
               type="text"
               id="country"
               placeholder="Entrez le pays"
               required/>
        <p v-if="validationErrors.country"
           class="validation-error"
           v-for="err in validationErrors.country"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Acteurs -->
      <div class="form-group">
        <label for="actors">Acteurs</label>
        <input v-model="actors"
               type="text"
               id="actors"
               placeholder="Entrez les acteurs, séparés par des virgules"/>
        <p v-if="validationErrors.actors"
           class="validation-error"
           v-for="err in validationErrors.actors"
           :key="err">
          {{ err }}
        </p>
      </div>

      <div class="form-group">
        <label for="genres">Genres</label>
        <input type="email"
               name="hidden1"
               id="hidden1"
               style="width: 0; height: 0; border: 0; padding: 0"/>

        <!-- Multiselect pour la sélection multiple des genres -->
        <multiselect
          v-model="genres"
          :options="genreOptions"
          :multiple="true"
          :close-on-select="false"
          :clear-on-select="false"
          :preserve-search="true"
          placeholder="Sélectionnez des genres"
          label="name"
          track-by="id"
        >
        </multiselect>

        <!-- Afficher les erreurs de validation s'il y en a -->
        <p v-if="validationErrors.genres"
           class="validation-error"
           v-for="err in validationErrors.genres"
           :key="err">
          {{ err }}
        </p>
      </div>
      <!-- Récompense -->
      <div class="form-group">
        <label>Récompense</label>
        <div class="radio-group">
          <label>
            <input type="radio"
                   v-model="rewarded"
                   :value="true"/>
            Oui
          </label>
          <label>
            <input type="radio"
                   v-model="rewarded"
                   :value="false"/>
            Non
          </label>
        </div>
        <p v-if="validationErrors.rewarded"
           class="validation-error"
           v-for="err in validationErrors.rewarded"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Image Poster -->
      <div class="form-group">
        <label for="poster">Affiche (Poster)</label>
        <input type="file"
               id="poster"
               @change="handlePosterUpload"
               accept="image/*"/>
        <p v-if="validationErrors.poster"
           class="validation-error"
           v-for="err in validationErrors.poster"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Image Thumbnail -->
      <div class="form-group">
        <label for="thumbnail">Miniature (Thumbnail)</label>
        <input type="file"
               id="thumbnail"
               @change="handleThumbnailUpload"
               accept="image/*"/>
        <p v-if="validationErrors.thumbnail"
           class="validation-error"
           v-for="err in validationErrors.thumbnail"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Mot de passe Admin -->
      <div class="form-group password-group">
        <label for="admin_password">Mot de passe Admin</label>
        <input type="password"
               name="hidden"
               id="hidden"
               style="width: 0; height: 0; border: 0; padding: 0"/>
        <input v-model="admin_password"
               type="password"
               id="admin_password"
               placeholder="Entrez votre mot de passe admin"
               required/>
        <p v-if="validationErrors.admin_password"
           class="validation-error"
           v-for="err in validationErrors.admin_password"
           :key="err">
          {{ err }}
        </p>
      </div>

      <!-- Bouton de soumission -->
      <div class="form-group">
        <button type="submit"
                :disabled="loading"
                class="btn-submit">Ajouter
        </button>
      </div>

      <!-- Spinner de chargement -->
      <div v-if="loading"
           class="loading-spinner">Chargement...
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {addContent} from '@/api/content';
import {fetchGenres} from '@/api/genres';
import {useNotificationStore} from '@/stores/useNotificationStore';  // Importer le store de notifications
import {useRouter} from 'vue-router';  // Pour la redirection après succès
import {computed} from 'vue';

const props = defineProps<{
  contentType: 'movie' | 'series' | 'anime-movie' | 'anime-series'; // Mettre à jour les types
}>();

// Définir un label dynamique en fonction du type de contenu
const contentTypeLabel = computed(() => {
  switch (props.contentType) {
    case 'series':
      return 'une Série';
    case 'anime-movie':
      return 'un Animé Film';
    case 'anime-series':
      return 'un Animé';
    default:
      return 'un Film';
  }
});

// Champs du formulaire
const title = ref('');
const saga = ref(''); // Remplacement de saga_id par saga en texte
const description = ref('');
const release_date = ref('');
const imdb_rating = ref(0);
const duration = ref<number | null>(null);
const country = ref('');
const actors = ref('');
const genres = ref<string[]>([]);
const genreOptions = ref<{ id: number; name: string }[]>([]);
const rewarded = ref<boolean | null>(null); // Nouveau champ pour la récompense
const poster = ref<File | null>(null);  // Nouveau champ pour l'image Poster
const thumbnail = ref<File | null>(null);
const admin_password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const validationErrors = ref<{ [key: string]: string[] }>({});

// Store des notifications
const notificationStore = useNotificationStore();
const router = useRouter();

// Fonction pour récupérer les genres depuis l'API
const loadGenres = async () => {
  try {
    genreOptions.value = await fetchGenres();
  } catch (err) {
    console.error('Erreur lors de la récupération des genres', err);
  }
};

// Fonction pour gérer l'upload de l'affiche (Poster)
const handlePosterUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    poster.value = target.files[0];  // Stocke l'image sélectionnée
  }
};

// Fonction pour gérer l'upload de la miniature (Thumbnail)
const handleThumbnailUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    thumbnail.value = target.files[0];  // Stocke l'image sélectionnée
  }
};

// Fonction pour envoyer les données et les images au serveur
const handleContentUpload = async () => {
  loading.value = true;
  validationErrors.value = {};

  // Validation simple
  if (title.value.trim() === '') {
    validationErrors.value.title = ['Le titre est requis.'];
  }
  if (description.value.trim() === '') {
    validationErrors.value.description = ['La description est requise.'];
  }
  if (duration.value === null || duration.value <= 0) {
    validationErrors.value.duration = ['La durée est requise et doit être supérieure à 0.'];
  }
  if (!poster.value) {
    validationErrors.value.poster = ['Le poster est requis.'];
  }
  if (!thumbnail.value) {
    validationErrors.value.thumbnail = ['La miniature est requise.'];
  }

  // Si il y a des erreurs, arrêter ici
  if (Object.keys(validationErrors.value).length > 0) {
    loading.value = false;
    notificationStore.addNotification('error', 'Erreur dans les champs du formulaire.');
    return;
  }

  const genreIds = genres.value.map((genre) => genre.id);  // Extrait uniquement les IDs
  console.log("Identifiants des genres extraits:", genreIds);  // Vérifie que ce sont des nombres


  // Créer un objet FormData pour envoyer les fichiers et les autres données
  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('saga', saga.value || ''); // Saga peut être vide
  formData.append('description', description.value);
  formData.append('release_date', release_date.value);
  formData.append('imdb_rating', imdb_rating.value.toString());
  formData.append('duration', duration.value.toString());
  formData.append('country', country.value);
  if (actors.value.trim() !== '') {
    const actorArray = actors.value.split(',').map((actor) => actor.trim());
    formData.append('actors', JSON.stringify(actorArray)); // Envoyer sous forme de JSON
  } else {
    formData.append('actors', JSON.stringify([])); // Si aucun acteur, envoyer un tableau vide
  }
  genreIds.forEach((genreId, index) => {
    formData.append(`genres[${index}]`, genreId.toString());
  });
  formData.append('rewarded', rewarded.value ? '1' : '0');
  formData.append('poster', poster.value as Blob);
  formData.append('thumbnail', thumbnail.value as Blob);
  formData.append('admin_password', admin_password.value);
  formData.append('type', props.contentType); // Ajouter le type lors de l'envoi au backend

  try {
    const response = await addContent(formData);
    notificationStore.addNotification('success', `${contentTypeLabel.value} a été ajouté avec succès.`);
    router.push('/'); // Redirection après succès
  } catch (err: any) {
    if (err.response && err.response.status === 422) {
      validationErrors.value = err.response.data.errors;
      notificationStore.addNotification('error', 'Erreur de validation.');
    } else {
      notificationStore.addNotification('error', 'Une erreur est survenue.');
    }
  }
  loading.value = false;
};

onMounted(() => {
  loadGenres();
});
</script>

<style scoped>
.content-form {
  background-color: #100f10;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 6px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1);
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #fff;
}

.underline {
  width: 160px;
  height: 1px;
  background-color: #fff;
  margin-bottom: 20px;
}

p {
  margin-bottom: 20px;
  color: #ccc;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #ccc;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #404040;
  border-radius: 5px;
  background: linear-gradient(90deg, rgba(97, 97, 97, 0.8) 0%, rgba(196, 196, 196, 0.1) 100%);
  color: #fff;
  outline: none;
}

input::placeholder, textarea::placeholder {
  color: #888;
}

input:focus, select:focus, textarea:focus {
  border-color: #00cc9b;
  box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 10px;
  background-color: #00cc9b;
  color: #000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 20px;
}

.btn-submit:hover {
  transform: scale(1.01);
  background-color: #00b088;
}

.btn-submit:active {
  transform: scale(0.99);
  background-color: #009f76;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.validation-error {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.loading-spinner {
  color: #00cc9b;
  font-size: 1.2rem;
  margin-top: 10px;
}

select, option {
  background-color: rgba(97, 97, 97, 0.8); /* Couleur de fond gris foncé */
  color: white; /* Couleur de texte blanche pour bien contraster */
  padding: 10px;
  font-size: 16px;
  border: 1px solid #404040;
  border-radius: 5px;
  outline: none;
}

select:focus, option:focus {
  background-color: rgba(97, 97, 97, 0.9); /* Légèrement plus foncé au focus */
  color: white; /* Assurez-vous que le texte reste visible au focus */
  border-color: #00cc9b; /* Bordure verte au focus */
}

option {
  background-color: rgba(97, 97, 97, 0.8); /* Fond des options */
  color: white; /* Texte blanc pour les options */
}

.radio-group {
  display: flex;
  gap: 25px; /* Espace entre les boutons */
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px; /* Espace entre le bouton radio et le texte */
}

.multiselect {
  margin-top: -22px;
}

</style>
