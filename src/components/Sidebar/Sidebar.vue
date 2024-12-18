<template>
    <div class="sidebar">
        <!-- Image au-dessus du menu -->
        <div class="sidebar-logo">
            <a href="#">
                <img :src="logo" alt="Logo" class="h-11 w-auto logo" />
            </a>
        </div>
        <div class="menu">
            <h3>Menu</h3>
            <ul>
                <!-- Accueil -->
                <li>
                    <a href="#">
                        <HomeIcon class="icon" />
                        Accueil
                    </a>
                </li>

                <!-- Contenu récent -->
                <li>
                    <a href="#">
                        <RecentIcon class="icon" />
                        Contenu récent
                    </a>
                </li>

                <!-- Tendances -->
                <li>
                    <a href="#">
                        <TrendsIcon class="icon" />
                        Tendances
                    </a>
                </li>

                <!-- Récompenses -->
                <li>
                    <a href="#">
                        <AwardsIcon class="icon" />
                        Récompenses
                    </a>
                </li>

                <!-- Mieux notés -->
                <li>
                    <a href="#">
                        <TopRatedIcon class="icon" />
                        Mieux notés
                    </a>
                </li>

                <!-- Demande d'ajout -->
                <li>
                    <a href="/add-request">
                        <AddRequestIcon class="icon" />
                        Demande d'ajout
                    </a>
                </li>

                <!-- Communauté -->
                <li>
                    <a href="#">
                        <CommunityIcon class="icon" />
                        Communauté
                    </a>
                </li>
            </ul>
        </div>
      <div class="menu-separator"></div>
    </div>
</template>

<script setup lang="ts">
import HomeIcon from "@/components/Icons/HomeIcon.vue";
import TrendsIcon from "@/components/Icons/TrendsIcon.vue";
import CommunityIcon from "@/components/Icons/CommunityIcon.vue";
import AddRequestIcon from "@/components/Icons/AddRequestIcon.vue";
import TopRatedIcon from "@/components/Icons/TopRatedIcon.vue";
import AwardsIcon from "@/components/Icons/AwardsIcon.vue";
import RecentIcon from "@/components/Icons/RecentIcon.vue";
import logo from "@/assets/images/Logo_title.png";
</script>

<style scoped>
.sidebar {
    position: fixed;
    left: 0;
    width: 250px;
    height: 100vh; /* Sidebar prend la hauteur de l'écran moins la navbar */
    padding: 17px;
    overflow-y: auto;
    font-family: theme("fontFamily.sans"), sans-serif;
    transition: transform 0.3s ease; /* Retirer width de la transition */
    transform: translateX(0); /* Par défaut affichée */
    will-change: transform;
    z-index: 100;
    background: #100f10;
  border-right: 1px solid rgba(201, 192, 192, 0.1); /* Bordure blanche semi-transparente */
}

.sidebar-logo {
    text-align: center; /* Centrer l'image dans la sidebar */
    margin-bottom: 30px; /* Ajouter un espacement entre l'image et le menu */
    margin-left: -60px;
    margin-top: -5px;
}

.sidebar-logo a {
    display: inline-block; /* Limite la taille du lien à celle de l'image */
}

/* Sidebar ouverte en mode mobile */
.sidebar.sidebar-open {
    transform: translateX(0); /* Annuler le translate si fermé */
}

/* Appliquer la logique d'affichage seulement en mobile */
@media (max-width: 1000px) {
    .sidebar.sidebar-open {
        width: 100%; /* Pas de transition sur width */
    }

    /* Sidebar fermée en mode mobile (translate hors écran) */
    .sidebar:not(.sidebar-open) {
        transform: translateX(-100%); /* La faire sortir de l'écran */
    }
}

/* Style du menu */
.menu h3 {
    font-size: 1.1em;
    margin-bottom: 15px;
    margin-top: 10px;
    color: #a3a3a3;
    letter-spacing: 1px;
    padding-left: 16px;
    font-weight: bold;
}

.menu ul li {
    margin-bottom: 5px;
}

.menu ul li a {
    display: flex;
    align-items: center;
    color: theme("colors.off-white");
    text-decoration: none;
    font-size: 0.95em;
    padding: 10px 10px 10px 16px;
    border-radius: 8px;
    transition:
        background-color 0.3s ease,
        color 0.3s ease;
    gap: 15px;
}

/* Icônes du menu */
.icon {
    color: theme("colors.off-white");
    transition: color 0.3s ease;
}

/* Effet de survol */
.menu ul li a:hover {
  background-color: #232123; /* Une teinte légèrement plus claire */
  border-left: 4px solid theme("colors.main-green"); /* Une bordure gauche colorée */
}

.menu::after {
  content: "";
  position: absolute; /* Position absolue pour ignorer le padding */
  left: 0; /* Débuter à gauche */
  right: 0; /* Aller jusqu'à la droite */
  height: 1px; /* Épaisseur de la bordure */
  background-color: rgba(255, 255, 255, 0.1); /* Couleur subtile */
  bottom: 0; /* Place la bordure tout en bas de la liste */
}

.menu-separator {
  height: 1px;
  width: 90%;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 40px auto 0; /* Centre horizontalement avec `auto` */
}

@media (max-width: 1000px) {
    .sidebar-logo {
        display: none; /* Cacher le logo sous 1000px */
    }

    .menu h3 {
        display: none;
    }

    .sidebar {
        padding-top: 70px;
    }

    .menu ul li a {
        font-size: 0.95em;
        padding: 10px 10px 10px 13px;
    }
}

@media (max-width: 490px) {
    .menu ul li a {
        font-size: 0.95em;
        padding: 10px 10px 10px 8px;
    }
}
</style>
