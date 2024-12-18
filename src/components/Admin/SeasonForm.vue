<template>
    <div class="add-season-form">
        <h2>Ajouter une Saison à une Série</h2>

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

        <!-- Vue des saisons existantes de la série sélectionnée -->
        <div v-if="selectedSeries && selectedSeriesSeasons.length > 0" class="seasons-view">
            <h3>Saisons existantes</h3>
            <ul>
                <li v-for="(season, index) in selectedSeriesSeasons" :key="index">
                    Saison {{ season.season_number }} - {{ season.total_episodes }} épisodes
                </li>
            </ul>
        </div>
        <div v-else-if="selectedSeries" class="no-seasons">
            <p>Aucune saison trouvée pour cette série.</p>
        </div>

        <!-- Formulaire pour ajouter une nouvelle saison -->
        <div class="form-group">
            <label for="seasonNumber">Numéro de la nouvelle saison</label>
            <input v-model="newSeasonNumber" type="number" min="1" placeholder="Numéro de la saison" />

            <label for="episodes">Nombre total d'épisodes</label>
            <input v-model="newSeasonEpisodes" type="number" min="1" placeholder="Nombre d'épisodes" />
        </div>

        <!-- Mot de passe Admin -->
        <div class="form-group password-group">
            <label for="admin_password">Mot de passe Admin</label>
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

        <button @click="addNewSeason">Ajouter la Saison</button>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {addSeason, fetchSeasons, fetchAllSeries} from '@/api/series';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import {useNotificationStore} from '@/stores/useNotificationStore';

// États du composant
const seriesOptions = ref<{ id: string; title: string }[]>([]);  // Séries disponibles
const selectedSeries = ref<{ id: string; title: string } | null>(null);  // Série sélectionnée
const selectedSeriesSeasons = ref<Array<{ season_number: number; total_episodes: number }>>([]);

const newSeasonNumber = ref<number | null>(null);  // Numéro de la nouvelle saison à ajouter
const newSeasonEpisodes = ref<number | null>(null);  // Nombre d'épisodes de la nouvelle saison
const admin_password = ref<string>(''); // Mot de passe administrateur

const validationErrors = ref<{ [key: string]: string[] }>({}); // Gestion des erreurs de validation
const notificationStore = useNotificationStore();

// Fonction pour récupérer toutes les séries
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

// Fonction pour récupérer les saisons d'une série sélectionnée
const loadSeriesSeasons = async () => {
    if (selectedSeries.value) {
        try {
            console.log(`Récupération des saisons pour la série ID : ${selectedSeries.value.id}`);

            // Récupérer les saisons depuis l'API
            const response = await fetchSeasons(selectedSeries.value.id);

            console.log('Réponse brute de fetchSeasons :', response);

            // Mettre à jour les saisons si elles existent
            selectedSeriesSeasons.value = response.seasons || [];

            console.log('Saisons après mise à jour :', selectedSeriesSeasons.value);
        } catch (err) {
            console.error('Erreur lors de la récupération des saisons', err);
        }
    }
};


watch(selectedSeries, async (newSeries) => {
    if (newSeries) {
        console.log('Nouvelle série sélectionnée :', newSeries);
        await loadSeriesSeasons();
    }
});

// Fonction pour ajouter une nouvelle saison
const addNewSeason = async () => {
    // Réinitialiser les erreurs de validation
    validationErrors.value = {};

    if (selectedSeries.value && newSeasonNumber.value && newSeasonEpisodes.value && admin_password.value) {
        try {
            // Extrait uniquement l'ID de la série sélectionnée
            const seriesId = selectedSeries.value.id;

            // Appel de l'API pour ajouter la saison
            await addSeason(seriesId, {
                season_number: newSeasonNumber.value,
                total_episodes: newSeasonEpisodes.value,
                admin_password: admin_password.value, // Inclure le mot de passe Admin
            });
            notificationStore.addNotification('success', 'La saison a été ajoutée avec succès !');
            await loadSeriesSeasons();  // Recharger les saisons après ajout

            // Réinitialiser les champs après ajout
            newSeasonNumber.value = null;
            newSeasonEpisodes.value = null;
            admin_password.value = '';  // Réinitialise le mot de passe Admin
        } catch (err: any) {
            if (err.response && err.response.status === 422) {
                // Gestion des erreurs de validation de l'API
                validationErrors.value = err.response.data.errors;
                notificationStore.addNotification('error', 'Erreur de validation. Veuillez vérifier les champs.');
            } else {
                console.error('Erreur lors de l\'ajout de la saison', err);
                notificationStore.addNotification('error', 'Une erreur est survenue lors de l\'ajout de la saison.');
            }
        }
    } else {
        notificationStore.addNotification('error', 'Veuillez remplir tous les champs requis.');
    }
};

// Charger les séries disponibles au montage du composant
onMounted(() => {
    loadSeriesOptions();
});
</script>

<style scoped>
.add-season-form {
    background-color: #100f10;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 6px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1);
}

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

.form-group input,
.form-group select {
    margin-bottom: 20px;
}

label {
    color: #ccc;
    margin-bottom: 10px;
    display: block;
}

input, select {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #404040;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(97, 97, 97, 0.8) 0%, rgba(196, 196, 196, 0.1) 100%);
    color: #fff;
    outline: none;
}

input::placeholder {
    color: #888;
}

input:focus, select:focus {
    border-color: #00cc9b;
    box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

.seasons-view {
    margin-top: 20px;
    background-color: #2a2a30;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 15px;
}

.seasons-view ul {
    list-style-type: none;
    padding-left: 0;
    color: #ccc;
}

.seasons-view li {
    padding: 8px;
    margin-bottom: 5px;
    background-color: #333;
    border-radius: 5px;
    transition: background-color 0.2s ease-in-out;
}

.seasons-view li:hover {
    background-color: #444;
}

.no-seasons {
    background-color: #2a2a30;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    color: #ff6b6b;
    font-size: 0.8rem;
    margin-top: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 15px;
}

.no-seasons p {
    margin: 0;
    padding: 0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
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

.validation-error {
    color: #ff6b6b;
    font-size: 0.875rem;
    margin-top: 5px;
}

.multiselect {
    margin-bottom: 20px;
}
</style>
