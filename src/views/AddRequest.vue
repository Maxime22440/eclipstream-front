<template>
    <div class="container">
        <h1>Demander un ajout de contenu</h1>

        <div class="info-box">
            <p>Cliquez sur le type de contenu que vous souhaitez ajouter</p>
        </div>

        <!-- Choix optionnel (film / série / animé) -->
        <div class="options">
            <div
                v-for="option in options"
                :key="option.value"
                :class="['option-box', { selected: selectedOption === option.value, inactive: selectedOption && selectedOption !== option.value }]"
                @click="toggleSelection(option.value)"
            >
                <div class="option">
                    <img :src="option.image" :alt="option.label" />
                    <span>{{ option.label }}</span>
                </div>
            </div>
        </div>

        <!-- Formulaire pour ajouter le nom du contenu -->
        <div class="request">
            <div class="flex">
                <input
                    type="text"
                    v-model="contentName"
                    :placeholder="placeholder"
                    :class="placeholderClass"
                    :disabled="loading"
                />
                <button @click="submitRequest" :disabled="loading">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { requestContent } from '@/api/contentRequest';
import { useNotificationStore } from '@/stores/useNotificationStore'; // Importer le store de notifications
import MovieThumbnail from '@/assets/images/Movie_thumbnail.jpg';
import SeriesThumbnail from '@/assets/images/Series_thumbnail.jpg';
import AnimeThumbnail from '@/assets/images/Anime_thumbnail.jpg';

// Référence au store de notifications
const notificationStore = useNotificationStore();

const selectedOption = ref('');
const contentName = ref('');
const placeholder = ref('Demandez votre film, série ou animé');
const placeholderClass = ref('');
const loading = ref(false);  // Suivre l'état du chargement

const options = [
    {
        label: 'Film',
        value: 'movie',
        image: MovieThumbnail,
    },
    {
        label: 'Série',
        value: 'series',
        image: SeriesThumbnail,
    },
    {
        label: 'Animé',
        value: 'anime',
        image: AnimeThumbnail,
    },
];

const animatePlaceholder = () => {
    placeholderClass.value = 'animate-placeholder'; // Ajoute la classe animée
    setTimeout(() => {
        placeholderClass.value = '';
    }, 2000); // Durée totale de l'animation en ms
};

const toggleSelection = (value: string) => {
    // Si l'option est déjà sélectionnée, on la déselectionne
    if (selectedOption.value === value) {
        selectedOption.value = '';
    } else {
        selectedOption.value = value;
        animatePlaceholder(); // Lance l'animation au clic
    }
};

// Fonction pour soumettre la requête
const submitRequest = async () => {
    const selectedType = selectedOption.value ? selectedOption.value : null;

    if (contentName.value) {
        console.log('Chargement commencé', loading.value); // Ajoute cette ligne pour suivre l'état
        try {
            const response = await requestContent(selectedType, contentName.value);

            // Notification de succès (vert)
            notificationStore.addNotification('success', `${response.message}`);

          // Réinitialiser les champs d'entrée après succès
          contentName.value = ''; // Vide le champ de l'input
          selectedOption.value = ''; // Réinitialise la sélection (si nécessaire)
        } catch (error: any) {
            console.error("Erreur lors de l'envoi de la demande:", error);

            if (error.response) {
                if (error.response.status === 422) {
                    notificationStore.addNotification('error', `Erreur de validation: ${JSON.stringify(error.response.data.errors)}`);
                } else {
                    notificationStore.addNotification('error', `Erreur: ${error.response.data.message || 'Erreur serveur'}`);
                }
            } else {
                notificationStore.addNotification('error', "Erreur réseau ou inconnue lors de l'envoi de la demande.");
            }
        } finally {
            console.log('Chargement terminé', loading.value); // Ajoute cette ligne pour suivre l'état
        }
    } else {
        notificationStore.addNotification('error', 'Veuillez entrer un nom pour le contenu.');
    }
};

// Fonction pour surveiller la taille de l'écran
const updatePlaceholder = () => {
    if (window.innerWidth <= 450) {
        placeholder.value = 'Demandez votre contenu';
    } else {
        placeholder.value = 'Demandez votre film, série ou animé';
    }
};

// Surveiller le redimensionnement de l'écran
onMounted(() => {
    updatePlaceholder(); // Appliquer au montage initial
    window.addEventListener('resize', updatePlaceholder); // Écouter les changements de taille d'écran
});

onUnmounted(() => {
    window.removeEventListener('resize', updatePlaceholder); // Nettoyer l'écouteur au démontage
});
</script>

<style scoped>
.container {
    color: white;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    width: 100%;
    max-width: 1000px;
    margin-top: 40px;
    overflow-x: hidden;
}

h1 {
    font-size: 28px;
    margin-bottom: 50px;
    color: theme("colors.off-white");
}

.info-box {
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 50px;
    display: inline-block;
  background: linear-gradient(145deg, #1a1a1a, #27272A);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 5px rgba(255, 255, 255, 0.02);
}

.info-box p {
    margin: 0;
    font-size: 16px;
    color: theme("colors.off-white");
}

.options {
    display: flex;
    justify-content: center;
    gap: 90px;
    margin-bottom: 70px;
    flex-wrap: nowrap;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 5px;
}

.option-box {
    background: linear-gradient(145deg, #181818, #27272A);
    padding: 8px;
    border-radius: 15px;
    transition: background-color 0.3s, border 0.3s ease-in-out, opacity 0.3s;
    cursor: pointer;
    border: 2px solid transparent;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2);
}

.option-box:hover {
    background: linear-gradient(145deg, #232323, #292929);
}

.option-box.selected {
    border-color: theme('colors.main-green');
    animation: borderPulse 0.6s ease-in-out;
}

.option-box.inactive {
    opacity: 0.3;
}

@keyframes borderPulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.option {
    text-align: center;
    cursor: pointer;
}

.option img {
    width: 100px;
    height: 150px;
    border-radius: 10px;
    transition: transform 0.2s;
}

.option input {
    display: none;
}

.option span {
    display: block;
    margin-top: 10px;
    font-size: 16px;
    cursor: pointer;
}

.request {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    width: 100%;
}

.request .flex {
    background-color: #100f10;
    color: #e0e0e0;
    padding: 0.6rem 1.0rem;
    border-radius: 10px;
    border: 1px solid rgba(122, 122, 122, 0.5);
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    transition: border 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.request .flex:focus-within {
    border-color: theme('colors.main-green');
    box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

.request input[type="text"] {
    background-color: transparent;
    border: none;
    color: #e0e0e0;
    outline: none;
    font-size: 16px;
    flex: 1;
    transition: border 0.3s ease-in-out;
}

.request button {
    background-color: theme('colors.main-green');
    color: #000000;
    border: none;
    border-radius: 5px;
    padding: 0.3rem 1rem;
    cursor: pointer;
    font-size: 15px;
}

.request button i {
    font-size: 14px;
}

.request button:hover {
    transform: scale(1.01);
    background-color: #00b088;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.request button:active {
    transform: scale(0.99);
    background-color: #009f76;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

/* Positionner le spinner en bas à gauche de l'input */
.loading-spinner {
    margin-top: -15px;
    margin-left: -470px;
    left: 0;
    color: #00cc9b;
    font-size: 1.2rem;
}

@media (max-width: 620px) {
    .options {
        gap: 20px;
        flex-wrap: nowrap;
        overflow-x: auto;
    }
}

@media (max-width: 490px) {
    .options {
        gap: 10px;
    }
    .option img {
        width: 80px;
        height: 120px;
    }
}
</style>
