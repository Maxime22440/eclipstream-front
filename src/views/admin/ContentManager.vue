<template>
    <div class="content-manager-page">
        <div class="content-manager-container">
            <!-- Navigation par onglets -->
            <div class="tabs">
                <button
                    class="tab"
                    :class="{ active: currentTab === 'movie' }"
                    @click="currentTab = 'movie'">
                    Film
                </button>
                <button
                    class="tab"
                    :class="{ active: currentTab === 'series' }"
                    @click="currentTab = 'series'">
                    Série
                </button>
                <button
                    class="tab"
                    :class="{ active: currentTab === 'anime-movie' }"
                    @click="currentTab = 'anime-movie'">
                    Animé (Film)
                </button>
                <button
                    class="tab"
                    :class="{ active: currentTab === 'anime-series' }"
                    @click="currentTab = 'anime-series'">
                    Animé (Série)
                </button>
                <button
                    class="tab"
                    :class="{ active: currentTab === 'add-season' }"
                    @click="currentTab = 'add-season'">
                    Ajouter une Saison
                </button>
                <button
                    class="tab"
                    :class="{ active: currentTab === 'add-episode' }"
                    @click="currentTab = 'add-episode'">
                    Ajouter un Épisode
                </button>
            </div>

            <!-- Composant générique pour gérer les types de contenu -->
            <ContentForm v-if="currentTab !== 'upload' && currentTab !== 'add-season' && currentTab !== 'add-episode'" :contentType="currentTab" />

            <!-- Formulaire pour ajouter une saison -->
            <AddSeasonForm v-if="currentTab === 'add-season'" />

            <!-- Formulaire pour ajouter un épisode -->
            <EpisodeForm v-if="currentTab === 'add-episode'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import { useRouter } from 'vue-router';
import ContentForm from '@/components/Admin/ContentForm.vue';
import AddSeasonForm from '@/components/Admin/SeasonForm.vue';
import EpisodeForm from "@/components/Admin/EpisodeForm.vue";

// Onglet actif
const currentTab = ref<'movie' | 'series' | 'anime-movie' | 'anime-series' | 'add-season' | 'add-episode' | 'upload'>('movie');

// Accès au store utilisateur
const userStore = useUserStore();
const router = useRouter();

console.log('isAuthenticated dans le composant:', userStore.isAuthenticated);
console.log('isAdmin dans le composant:', userStore.isAdmin);

// Vérifier si l'utilisateur est authentifié et Admin
if (!userStore.isAuthenticated || !userStore.isAdmin) {
    router.push('/login');
}
</script>

<style scoped>
/* Styles principaux pour la page de gestion de contenu */
.content-manager-page {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80px;
}

.content-manager-container {
    width: 1000px;
    background-color: #131213;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(35, 35, 35, 0.3), 0 8px 25px rgba(0, 0, 0, 0.9);
}

/* Style des onglets */
.tabs {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.tab {
    padding: 10px 20px;
    font-size: 16px;
    color: #fff;
    background-color: #100f10;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.tab:hover {
    background-color: #3d3d46;
}

.tab.active {
    background-color: #00cc9b;
    color: #000;
}

/* Style des formulaires intégrés */
.content-manager-form {
    background-color: #100f10;
    padding: 20px 25px;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 6px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.1);
}

h2 {
    font-size: 24px;
    color: #fff;
    margin-bottom: 15px;
}

.underline {
    width: 100px;
    height: 1px;
    background-color: #fff;
    margin-bottom: 20px;
}

p {
    margin-bottom: 20px;
    font-size: 14px;
    color: #ccc;
}

/* Styles des champs de formulaire */
.form-group {
    margin-bottom: 22px;
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
    background-color: rgba(97, 97, 97, 0.8);
    color: #fff;
}

input::placeholder, textarea::placeholder {
    color: #888;
}

input:focus, select:focus, textarea:focus {
    border-color: #00cc9b;
    box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

/* Styles des boutons de soumission */
.btn-submit {
    margin-top: 20px;
    width: 100%;
    background-color: #00cc9b;
    color: #000;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 600;
}

.btn-submit:hover {
    transform: scale(1.01);
    background-color: #00b088;
}

.btn-submit:active {
    transform: scale(0.99);
    background-color: #009f76;
}

/* Spinner de chargement */
.loading-spinner {
    margin-top: 10px;
    color: #00cc9b;
}

/* Message d'erreur */
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

/* Media query pour les écrans plus petits */
@media (max-width: 1100px) {
    .content-manager-container {
        padding: 20px;
    }
}

@media (max-width: 500px) {
    .content-manager-container {
        padding: 10px;
    }
}
</style>
