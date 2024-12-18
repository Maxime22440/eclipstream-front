<template>
    <nav
        :class="['navbar', navbarClass, { 'auth-page-desktop': isAuthPage && !isMobile }]"
        class="fixed w-full top-0 left-0 z-50 transition-all duration-300"
    >
        <div class="w-full px-8 flex justify-start items-center h-16">
            <!-- Menu Burger + Logo -->
            <div class="flex items-center">
                <BurgerMenu @click="emitToggleSidebar" class="mr-6" />
                <!-- Logo pour version desktop : affiché uniquement sur les pages d'authentification -->
                <div class="flex items-center space-x-2" v-if="isAuthPage && !isMobile">
                    <a href="/" class="logo-link">
                        <img :src="logo" alt="Logo" class="h-11 w-auto logo" />
                    </a>
                </div>

                <!-- Logo pour version mobile : toujours affiché sur mobile -->
                <div class="flex items-center space-x-2" v-if="isMobile">
                    <a href="/" class="logo-link">
                        <img :src="logo" alt="Logo" class="h-11 w-auto logo" />
                    </a>
                </div>
            </div>

            <!-- Navigation Links -->
            <div class="flex justify-start items-center gap-8 links">
                <a
                    href="#"
                    class="text-off-white hover:text-main-green transition-all text-base"
                    >Films</a
                >
                <a
                    href="#"
                    class="text-off-white hover:text-main-green transition-all text-base"
                    >Séries TV</a
                >
                <a
                    href="#"
                    class="text-off-white hover:text-main-green transition-all text-base"
                    >Animé</a
                >
            </div>

            <!-- Barre de recherche et Icône Profil -->
            <div class="ml-auto flex items-center">
                <!-- Affiche l'icône de loupe sous 1100px -->
                <div
                    class="search-icon flex justify-center items-center h-full"
                >
                    <button @click="toggleSearch" class="search-button">
                        <SearchIcon />
                    </button>
                </div>

                <!-- Barre de recherche visible au-dessus de 1100px -->
                <div class="search-bar">
                    <div
                        class="flex items-center bg-gray-800 text-gray-400 px-6 py-2 rounded-full font-sans min-w-[250px]"
                    >
                        <i class="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Recherchez"
                            class="bg-transparent focus:outline-none text-white ml-2"
                        />
                        <i class="fas fa-filter ml-2"></i>
                    </div>
                </div>

                <!-- Section Profil -->
                <div class="text-off-white ml-8">
                    <UserDropdown v-if="!isAuthPage" />
                </div>
            </div>
        </div>

        <!-- Modal de recherche (affiché seulement si la recherche est ouverte) -->
        <div
            v-if="searchOpen"
            class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50 flex justify-center items-center"
        >
            <div class="bg-gray-800 p-4 rounded-lg">
                <input
                    type="text"
                    placeholder="Recherchez"
                    class="bg-transparent focus:outline-none text-off-white w-full p-2 border-b-2 border-gray-500"
                />
                <button @click="toggleSearch" class="text-off-white mt-4">
                    Fermer
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import logo from "@/assets/images/Logo_title.png";
import SearchIcon from "@/components/Icons/SearchIcon.vue";
import BurgerMenu from "@/components/navbar/BurgerMenu.vue";
// @ts-ignore
import UserDropdown from "@/components/navbar/UserDropdown.vue";

// État pour suivre si la page est défilée
const isScrolled = ref(false);
const searchOpen = ref(false); // État pour gérer l'ouverture de la recherche sur mobile
const route = useRoute();

const props = defineProps({
    isSidebarOpen: Boolean,
    isMobile: Boolean,
});

// Déclare l'émission d'événements
const emit = defineEmits(["toggleSidebar"]);

// Fonction de gestion du scroll
const handleScroll = () => {
    isScrolled.value = window.scrollY > 0;
};

// Gérer l'ajout et la suppression de l'événement scroll
onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));

// Classe calculée pour la navbar
const navbarClass = computed(() => {
    if (props.isSidebarOpen && props.isMobile) {
        return "navbar-bg-change"; // Sidebar ouverte et mobile
    } else if (isScrolled.value) {
        return "bg-dark bg-opacity-90 shadow-md"; // Fond visible dès le défilement
    } else {
        return "bg-opacity-0"; // Classe par défaut si pas scrollé et sidebar fermée
    }
});

// Fonction pour afficher/masquer la barre de recherche sur mobile
const toggleSearch = () => {
    searchOpen.value = !searchOpen.value;
};

// Émettre l'événement de toggling du sidebar à l'app
const emitToggleSidebar = () => {
    // Émet l'événement vers l'App
    emit("toggleSidebar");
};

// Déterminer si la route est une page de login ou register
const isAuthPage = computed(() => {
    return route.path === "/login" || route.path === "/register";
});
</script>

<style scoped>
/* Couleur pleine lorsque la sidebar est ouverte */

/* Effet de transition quand la sidebar est ouverte */
.navbar::before {
    content: "";
    position: absolute;
    top: 0;
    left: -130%; /* La couleur commence hors de l'écran, à gauche */
    width: 100%;
    height: 100%;
    background-color: #100f10; /* La couleur que tu veux appliquer */
    transition: left 0.3s ease; /* Transition de glissement de gauche à droite */
    z-index: -1; /* S'assurer que le pseudo-élément reste derrière le contenu */
}

/* Navbar initialement transparente */
.bg-opacity-20 {
  background-color: rgba(16, 15, 16, 0.2); /* Couleur sombre légèrement transparente */
  transition: background-color 0.5s ease, box-shadow 0.5s ease;
}

/* Navbar avec fond visible au défilement */
.bg-dark {
  background-color: rgba(16, 15, 16, 0.9); /* Couleur sombre presque opaque */
  transition: background-color 0.5s ease, box-shadow 0.5s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Ajouter une légère ombre */
}

.shadow-md {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Ombre visible */
}

/* Barre sous les liens */
.nav-link {
    position: relative;
    text-decoration: none;
    color: #e8e8e8;
    transition: all 0.3s ease;
}

/* Barre verte au survol et quand le lien est actif */
.nav-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: theme("colors.main-green");
    transform: scaleX(0); /* Barre cachée par défaut */
    transform-origin: right;
    transition: transform 0.3s ease;
}

/* Barre visible sur hover ou si le lien est actif */
.nav-link:hover::after,
.nav-link.active::after {
    transform: scaleX(1);
    transform-origin: left;
}

.nav-link:hover {
    color: theme("colors.main-green");
}

/* Flexbox pour espacer les liens uniformément */
.navbar .links {
    display: flex;
    gap: 80px; /* Ajuste l'espacement entre les liens */
}

.navbar .links :first-child {
    margin-left: 290px; /* Ajoute un espacement supplémentaire au premier lien */
}

/* Réduction de l'espacement pour les pages d'authentification en version desktop */
.auth-page-desktop .links :first-child {
    margin-left: 130px; /* Réduire l'espace uniquement sur les pages d'authentification */
}


/* Rechercher modal en mode mobile */
.modal-research {
    background-color: rgba(0, 0, 0, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.search-bar .flex {
    background-color: #100f10; /* Couleur personnalisée du fond de la barre */
    color: #e0e0e0; /* Couleur du texte */
    padding: 0.5rem 1.3rem; /* Ajuste les marges internes */
    border-radius: 10px; /* Rendre la barre plus arrondie */
    border: 1px solid rgba(122, 122, 122, 0.5); /* Légère bordure grise avec transparence */
}

.search-bar input {
    margin-left: 25px; /* Augmente l'espace entre l'icône de recherche et le placeholder */
}

/* Par défaut, en dehors de la media query */
.search-icon {
    display: none;
}

.search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.search-bar {
    display: flex;
}

/* Media query personnalisée pour 1100px */
@media (max-width: 1150px) {
    nav .search-bar {
        display: none;
    }

    nav .search-icon {
        display: block;
    }
}

/* Media query pour en dessous de 1000px */
@media (max-width: 1000px) {
    .logo {
        height: 38px; /* Réduire la hauteur du logo */
        width: auto; /* Garder le ratio d'aspect */
        margin-top: -11px;
    }
    .navbar .links a:first-child {
        margin-left: 85px;
    }
}

/* Cacher le Burger Menu au-dessus de 1000px */
@media (min-width: 1000px) {
    .burger-menu {
        display: none;
    }
}

/* Media query pour en dessous de 900px */
@media (max-width: 800px) {
    .navbar .links {
        display: none; /* Cacher les liens de navigation sous 900px */
    }
}

/* Media query pour en dessous de 490px */
@media (max-width: 490px) {
    nav .w-full.px-8 {
        padding-left: 1.5rem; /* Réduire l'espace à gauche */
        padding-right: 1.5rem; /* Réduire l'espace à droite */
    }
}
</style>
