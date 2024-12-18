<template>
    <div class="add-episode-form">
        <h2>Ajouter un Épisode à une Série</h2>

        <!-- Recherche et sélection de la série -->
        <div class="form-group">
            <label for="series">Sélectionnez une Série</label>
            <Multiselect
                v-model="selectedSeries"
                :options="seriesOptions"
                :multiple="false"
                :close-on-select="true"
                :show-labels="false"
                placeholder="Sélectionnez une série"
                label="title"
                track-by="id"
                @input="loadSeriesSeasons"
            />
        </div>


        <!-- Sélection de la saison si une série est sélectionnée -->
        <div v-if="selectedSeries && selectedSeriesSeasons.length > 0" class="form-group">
            <label for="season">Sélectionnez une Saison</label>
            <Multiselect
                v-model="selectedSeason"
                :options="selectedSeriesSeasons"
                :multiple="false"
                :close-on-select="true"
                :show-labels="false"
                placeholder="Sélectionnez une saison"
                label="season_number"
                track-by="id"
                @input="loadSeasonEpisodes"
            />
        </div>

        <!-- Visualisation des épisodes existants pour la saison sélectionnée -->
        <div v-if="selectedSeason && seasonEpisodes.length > 0" class="episodes-view">
            <h3>Épisodes existants</h3>
            <ul>
                <li v-for="(episode, index) in seasonEpisodes" :key="index">
                    Épisode {{ episode.episode_number }} - {{ episode.title }}
                </li>
            </ul>
        </div>
        <div v-else-if="selectedSeason" class="no-episodes">
            <p>Aucun épisode trouvé pour cette saison.</p>
        </div>

        <!-- Formulaire pour ajouter un nouvel épisode -->
        <div v-if="selectedSeason" class="form-group">
            <label for="episodeNumber">Numéro de l'épisode</label>
            <input v-model="newEpisodeNumber" type="number" min="1" placeholder="Numéro de l'épisode" />

            <label for="title">Titre de l'épisode</label>
            <input v-model="newEpisodeTitle" type="text" placeholder="Titre" />

            <label for="description">Description</label>
            <textarea v-model="newEpisodeDescription" placeholder="Description"></textarea>

            <label for="release_date">Date de sortie</label>
            <input v-model="newEpisodeReleaseDate" type="date" />

            <label for="imdb_rating">Note IMDb</label>
            <input v-model="newEpisodeImdbRating" type="number" min="0" max="10" step="0.1" placeholder="Note IMDb" />

          <label for="duration">Durée (en minutes)</label>
          <input v-model="newEpisodeDuration"
                 type="number"
                 id="duration"
                 placeholder="Entrez une durée"
                 required/>
        </div>

        <!-- Mot de passe Admin -->
        <div class="form-group password-group">
            <label for="admin_password">Mot de passe Admin</label>
            <input v-model="admin_password"
                   type="password"
                   id="admin_password"
                   placeholder="Entrez votre mot de passe admin"
                   required />
            <p v-if="validationErrors.admin_password"
               class="validation-error"
               v-for="err in validationErrors.admin_password"
               :key="err">
                {{ err }}
            </p>
        </div>

        <button @click="addNewEpisode">Ajouter l'Épisode</button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { fetchEpisodes, addEpisode } from '@/api/episodes';
import { fetchSeasons, fetchAllSeries} from '@/api/series';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import { useNotificationStore } from '@/stores/useNotificationStore';

const seriesOptions = ref([]);
const selectedSeries = ref(null);
const selectedSeriesSeasons = ref([]);
const selectedSeason = ref(null);
const seasonEpisodes = ref([]);

const newEpisodeNumber = ref(null);
const newEpisodeTitle = ref('');
const newEpisodeDescription = ref('');
const newEpisodeReleaseDate = ref('');
const newEpisodeImdbRating = ref(null);
const newEpisodeDuration = ref('');
const admin_password = ref('');
const validationErrors = ref({});

const notificationStore = useNotificationStore();

// Charger les séries disponibles
const loadSeriesOptions = async () => {
    try {
        const response = await fetchAllSeries();
        seriesOptions.value = response.map((series: { uuid: string, title: string }) => ({
            id: series.uuid, // Utiliser 'uuid' comme identifiant
            title: series.title
        }));
        console.log(seriesOptions.value);  // Vérifie la structure des données
    } catch (err) {
        console.error('Erreur lors de la récupération des séries', err);
    }
};

// Charger les saisons de la série sélectionnée
const loadSeriesSeasons = async () => {
    if (selectedSeries.value && selectedSeries.value.id) {
        try {
            console.log(`Chargement des saisons pour la série ID : ${selectedSeries.value.id}`);

            // Récupérer les saisons depuis l'API
            const response = await fetchSeasons(selectedSeries.value.id);
            console.log('Saisons récupérées :', response);

            // Vérifie si la réponse contient un tableau de saisons
            if (response && Array.isArray(response.seasons)) {
                // Assigner les saisons au format attendu
                selectedSeriesSeasons.value = response.seasons.map(season => ({
                    id: season.uuid,
                    season_number: season.season_number,
                    total_episodes: season.total_episodes
                }));
                console.log('Saisons après formatage :', selectedSeriesSeasons.value);
            } else {
                console.warn('Aucune saison trouvée pour cette série.');
                selectedSeriesSeasons.value = [];
            }
        } catch (err) {
            console.error('Erreur lors du chargement des saisons', err);
            selectedSeriesSeasons.value = [];
        }
    } else {
        console.warn('Aucune série sélectionnée ou ID invalide.');
        selectedSeriesSeasons.value = [];
    }
};

// Charger les épisodes de la saison sélectionnée
const loadSeasonEpisodes = async () => {
    if (selectedSeason.value && selectedSeason.value.id) {
        try {
            console.log(`Chargement des épisodes pour la saison ID : ${selectedSeason.value.id}`);

            // Appel de l'API pour récupérer les épisodes
            const episodes = await fetchEpisodes(selectedSeason.value.id);

            console.log('Épisodes récupérés :', episodes);

            // Vérifie si la réponse contient un tableau d'épisodes
            if (Array.isArray(episodes)) {
                seasonEpisodes.value = episodes.map(episode => ({
                    id: episode.uuid,
                    episode_number: episode.episode_number,
                    title: episode.title,
                    description: episode.description,
                    release_date: episode.release_date,
                    imdb_rating: episode.imdb_rating
                }));
                console.log('Episodes après formatage :', seasonEpisodes.value);
            } else {
                console.warn('Aucun épisode trouvé pour cette saison.');
                seasonEpisodes.value = [];
            }
        } catch (err) {
            console.error('Erreur lors du chargement des épisodes', err);
            seasonEpisodes.value = [];
        }
    } else {
        console.warn('Aucune saison sélectionnée ou ID invalide.');
        seasonEpisodes.value = [];
    }
};

const addNewEpisode = async () => {
    // Réinitialiser les erreurs de validation
    validationErrors.value = {};

    // Validation des champs requis
    if (
        selectedSeason.value &&
        newEpisodeNumber.value &&
        newEpisodeTitle.value.trim() !== '' &&
        newEpisodeDescription.value.trim() !== '' &&
        newEpisodeReleaseDate.value &&
        admin_password.value.trim() !== ''
    ) {
        try {
            console.log('Ajout d\'un nouvel épisode...');

            // Préparer les données de l'épisode à envoyer à l'API
            const episodeData = {
                episode_number: newEpisodeNumber.value,
                title: newEpisodeTitle.value,
                description: newEpisodeDescription.value,
                release_date: newEpisodeReleaseDate.value,
                imdb_rating: newEpisodeImdbRating.value || null,
                duration: newEpisodeDuration.value,
                admin_password: admin_password.value,
            };

            // Appel à l'API pour ajouter l'épisode
            const response = await addEpisode(selectedSeason.value.id, episodeData);

            console.log('Épisode ajouté avec succès :', response);

            // Afficher une notification de succès
            notificationStore.addNotification('success', 'Épisode ajouté avec succès !');

            // Réinitialiser les champs du formulaire
            newEpisodeNumber.value = null;
            newEpisodeTitle.value = '';
            newEpisodeDescription.value = '';
            newEpisodeReleaseDate.value = '';
            newEpisodeImdbRating.value = null;
            newEpisodeDuration.value = '';
            admin_password.value = '';

            // Recharger les épisodes pour la saison actuelle
            await loadSeasonEpisodes();
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout de l\'épisode', error);
            if (error.response && error.response.status === 409) {
                notificationStore.addNotification('error', 'Un épisode avec ce numéro existe déjà pour cette saison.');
            } else if (error.response && error.response.status === 422) {
                validationErrors.value = error.response.data.errors;
                notificationStore.addNotification('error', 'Erreur de validation.');
            } else {
                notificationStore.addNotification('error', 'Une erreur est survenue lors de l\'ajout de l\'épisode.');
            }
        }
    } else {
        notificationStore.addNotification('error', 'Veuillez remplir tous les champs requis.');
    }
};

watch(selectedSeries, async (newSeries) => {
    if (newSeries) {
        await loadSeriesSeasons();
    } else {
        selectedSeriesSeasons.value = [];
    }
});

// Watcher pour charger les épisodes lorsque `selectedSeason` change
watch(selectedSeason, async (newSeason) => {
    if (newSeason) {
        await loadSeasonEpisodes();
    }
});

onMounted(() => {
    loadSeriesOptions();
});
</script>

<style scoped>
/* Style principal du formulaire d'ajout d'épisode */
.add-episode-form {
    background-color: #100f10;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 6px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1);
}

/* Titres */
h2 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 15px;
}

h3 {
    font-size: 20px;
    color: #ccc;
    margin-bottom: 10px;
}

/* Style pour les sélections avec Multiselect */
.multiselect {
    margin-bottom: 20px;
}

/* Sections du formulaire */
.form-group {
    margin-bottom: 20px;
}

label {
    color: #ccc;
    margin-bottom: 10px;
    display: block;
}

/* Style pour les champs de saisie */
input, select, textarea {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #404040;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(97, 97, 97, 0.8) 0%, rgba(196, 196, 196, 0.1) 100%);
    color: #fff;
    outline: none;
    resize: none;
}

input::placeholder, textarea::placeholder {
    color: #888;
}

input:focus, select:focus, textarea:focus {
    border-color: #00cc9b;
    box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

/* Style pour la liste des épisodes existants */
.episodes-view {
    margin-top: 20px;
    background-color: #2a2a30;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 15px;
}

.episodes-view ul {
    list-style-type: none;
    padding-left: 0;
    color: #ccc;
}

.episodes-view li {
    padding: 8px;
    margin-bottom: 5px;
    background-color: #333;
    border-radius: 5px;
    transition: background-color 0.2s ease-in-out;
}

.episodes-view li:hover {
    background-color: #444;
}

/* Style pour la section lorsqu'il n'y a pas d'épisodes */
.no-episodes {
    background-color: #2a2a30;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    color: #ff6b6b;
    font-size: 0.9rem;
    margin-top: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 15px;
}

.no-episodes p {
    margin: 0;
    padding: 0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Style pour les boutons */
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
    transition: transform 0.2s;
}

button:hover {
    transform: scale(1.01);
    background-color: #00b088;
}

button:active {
    transform: scale(0.99);
    background-color: #009f76;
}

/* Erreurs de validation */
.validation-error {
    color: #ff6b6b;
    font-size: 0.875rem;
    margin-top: 5px;
}

/* Style pour le champ du mot de passe */
.password-group {
    margin-top: 20px;
}
</style>

