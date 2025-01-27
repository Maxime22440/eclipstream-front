<template>
    <div class="relative">
        <div class="flex items-center cursor-pointer" @click="toggleDropdown">
            <!-- Icône utilisateur avec une classe dédiée pour la couleur -->
            <UserIcon
                :class="{'active-icon': showDropdown, 'user-icon-color': !showDropdown}"
                class="text-3xl transition-colors duration-300"
            />
            <!-- Icône flèche SVG avec une classe dédiée pour la couleur -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="{'rotate-180 arrow-icon-active': showDropdown, 'arrow-icon-color': !showDropdown}"
                class="ml-1 h-5 w-5 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        <!-- Transition pour l'apparition du dropdown -->
        <transition name="dropdown-fade">
            <div v-if="showDropdown" class="dropdown">
                <template v-if="!isAuthenticated">
                    <a href="/login" class="dropdown-item">Se connecter</a>
                </template>
                <template v-else>
                    <a href="#" @click="handleLogout" class="dropdown-item">Se déconnecter</a>

                    <!-- Lien vers la page Admin, visible uniquement pour les super admins -->
                    <a v-if="isSuperAdmin" href="/admin-content-manager" class="dropdown-item">
                        Gestion Admin
                    </a>
                </template>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router'; // Pour la redirection
import UserIcon from "@/components/Icons/UserIcon.vue";
import {useAuth} from '@/composables/useAuth';
import { useNotificationStore } from '@/stores/useNotificationStore';

// Utiliser la méthode d'authentification
const { isAuthenticated, isSuperAdmin, user, logoutUser } = useAuth();
const showDropdown = ref(false);
const notificationStore = useNotificationStore();
const router = useRouter();

// Fonction pour basculer l'affichage du dropdown
function toggleDropdown() {
    showDropdown.value = !showDropdown.value;
}

// Fonction pour fermer le dropdown
function closeDropdown() {
    showDropdown.value = false;
}

// Fonction pour gérer la déconnexion
async function handleLogout() {
    try {
        await logoutUser();
        notificationStore.addNotification('success', 'Déconnexion réussie !');
    } catch (err) {
    } finally {
        closeDropdown();
        await router.push('/');
    }
}

// Fonction pour détecter les clics en dehors du dropdown
function handleClickOutside(event: MouseEvent) {
    const dropdown = document.querySelector('.relative');
    if (dropdown && !dropdown.contains(event.target as Node)) {
        closeDropdown();
    }
}

// Ajouter et retirer l'écouteur d'événements pour fermer le dropdown au clic en dehors
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Rotation de la flèche quand le dropdown est ouvert */
.rotate-180 {
    transform: rotate(180deg);
}

/* Transition pour l'apparition et disparition du dropdown */
.dropdown-fade-enter-active, .dropdown-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.dropdown-fade-enter-from, .dropdown-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px); /* Faire glisser vers le bas */
}
.dropdown-fade-enter-to, .dropdown-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

/* Style de la dropdown */
.dropdown {
    position: absolute;
    right: 0;
    margin-top: 1.2rem;
    width: 9rem;
    background-color: #100f10; /* Couleur de fond personnalisée */
    border-radius: 0.5rem; /* Arrondir les coins */
    border: 1px solid rgba(122, 122, 122, 0.5); /* Légère bordure grise avec transparence */
    z-index: 50;
    transition: all 0.3s ease; /* Transition pour l'ouverture et fermeture */
    overflow: hidden; /* Empêche le contenu de dépasser les coins arrondis */
}

/* Style des éléments du dropdown */
.dropdown-item {
    display: block;
    padding: 0.6rem 1rem;
    font-size: 0.95em;
    font-family: theme('fontFamily.sans'),sans-serif;
    color: #d8d8d8; /* Couleur du texte par défaut */
    text-decoration: none;
    position: relative; /* Nécessaire pour l'effet d'apparition */
    overflow: hidden; /* Assurer que l'effet reste à l'intérieur de l'élément */
    transition: color 0.3s ease, background-color 0.3s ease; /* Transition pour le texte et le fond */
}

/* Couleur et effet hover pour les items du dropdown */
.dropdown-item:hover {
    color: theme('colors.main-green'); /* Couleur verte au survol */
}

/* Couleurs dynamiques pour l'icône utilisateur et la flèche */
.user-icon-color {
    color: #d8d8d8; /* Off-white (par défaut) */
}
.active-icon {
    color: theme('colors.main-green'); /* Couleur personnalisée main-green quand le dropdown est ouvert */
}

.arrow-icon-color {
    color: #d8d8d8; /* Off-white par défaut pour la flèche */
}
.arrow-icon-active {
    color: theme('colors.main-green'); /* Couleur verte (main-green) quand le dropdown est ouvert */
}

/* Transition de couleur pour le logo (quand la dropdown n'est pas active) */
.transition-colors {
    transition: color 0.4s ease;
}

/* Media query personnalisée pour 1100px */
@media (max-width: 1100px) {
    .dropdown {
        margin-top: 0.8rem;
    }
}
</style>
