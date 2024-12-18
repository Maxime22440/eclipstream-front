<template>
    <div :class="{
        'app-layout': true,
        'sidebar-open-background': isSidebarOpen && isMobile
    }">
        <Navbar
            :isSidebarOpen="isSidebarOpen"
            :isMobile="isMobile"
            @toggleSidebar="toggleSidebar"
        />
        <!-- Sidebar qui s'affiche ou se cache en fonction de l'état isSidebarOpen et isMobile -->
        <Sidebar
            v-if="!isAuthPage"
            :class="{
                'sidebar-open': isSidebarOpen && isMobile,
                'sidebar-hidden': !isSidebarOpen && isMobile,
            }"
        />
        <div :class="{'content-wrapper-auth': isAuthPage, 'content-wrapper': !isAuthPage}">
            <Notification />
          <router-view :key="$route.fullPath" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Navbar from "@/components/navbar/Navbar.vue";
import Sidebar from "@/components/Sidebar/Sidebar.vue";
import Notification from "@/components/Notification.vue";
import { useUserStore } from '@/stores/useUserStore';

const userStore = useUserStore();

// État de la sidebar (ouverte ou fermée)
const isSidebarOpen = ref(false);

// Suivre la largeur de l'écran pour savoir si on est en mode mobile ou desktop
const screenWidth = ref(window.innerWidth);
const isMobile = computed(() => screenWidth.value < 1000);

// Gérer le redimensionnement de la fenêtre
onMounted(() => {
    window.addEventListener("resize", () => {
        screenWidth.value = window.innerWidth;
    });
});

// Fonction pour ouvrir/fermer la sidebar uniquement sur mobile
const toggleSidebar = () => {
    if (isMobile.value) {
        isSidebarOpen.value = !isSidebarOpen.value;
    }
};

// Récupérer la route actuelle pour déterminer si on est sur une page d'authentification
const route = useRoute();

// Déterminer si la route est une page de login ou register
const isAuthPage = computed(() => {
    return route.path === "/login" || route.path === "/register" || route.path === "/add-requestd";
});

onMounted(() => {
    userStore.loadUserFromStorage();
});
</script>

<style>
body {
  background: #100f10; /* La couleur de fond de ton app */
  margin: 0; /* Supprime les marges du body */
  padding: 0; /* Supprime les padding du body */
  height: 100%; /* S'assure que le body occupe toute la hauteur */
}
/* Structure principale : Flexbox pour la disposition globale */
.app-layout {
    display: flex;
    flex-direction: column;
    background: #100f10;
    transition: background 0.3s ease;
    z-index: 1; /* Assure que le contenu est au-dessus du pseudo-élément */
    overflow: hidden;
}

/* Ajouter un pseudo-élément pour la transition du fond */
.app-layout::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1F1E23; /* La couleur de fond pour quand la sidebar est ouverte */
    opacity: 0; /* Caché par défaut */
    z-index: -2; /* Derrière tout le contenu */
    transition: opacity 0.3s ease; /* Transition fluide sur l'opacité */
}

/* Quand la sidebar est ouverte */
.sidebar-open-background::before {
    opacity: 1; /* Faire apparaître le fond sombre */
}

/* Le contenu principal doit occuper l'espace disponible */
.content-wrapper {
    margin-left: 250px; /* Pour être à côté de la sidebar */
    padding: 60px 10px 10px;
    flex-grow: 1; /* Occupe l'espace restant */
    overflow-y: auto;
    box-sizing: border-box; /* Inclut padding dans la hauteur totale */
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: hidden;
}

@media (max-width: 1000px) {
    .content-wrapper {
        margin-left: 0; /* Contenu occupe toute la largeur en dessous de 1000px */
    }
    .navbar {
        z-index: 101; /* Passe devant la sidebar en mobile */
    }
}
/* Style de la barre de défilement pour tous les conteneurs */
* {
  scrollbar-width: thin; /* Pour Firefox : fine barre */
  scrollbar-color: #333333 #121212; /* Barre gris foncé et fond noir */
}

/* Pour les navigateurs Webkit (Chrome, Edge, Safari) */
*::-webkit-scrollbar {
  width: 8px; /* Largeur de la barre */
  height: 8px; /* Hauteur pour le défilement horizontal */
}

*::-webkit-scrollbar-track {
  background: #121212; /* Fond noir ou très sombre */
}

*::-webkit-scrollbar-thumb {
  background-color: #333333; /* Gris foncé pour la barre */
  border-radius: 8px; /* Coins arrondis */
  border: 1px solid #1F1E23; /* Léger espace autour de la barre */
}

*::-webkit-scrollbar-thumb:hover {
  background-color: #444444; /* Gris légèrement plus clair au survol */
}

</style>
