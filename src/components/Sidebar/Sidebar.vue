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
          <a href="/home">
            <HomeIcon class="icon" />
            Accueil
          </a>
        </li>

        <!-- Films -->
        <li>
          <a href="/movies">
            <MovieIcon class="icon" />
            Films
          </a>
        </li>

        <!-- Séries -->
        <li>
          <a href="/series">
            <SeriesIcon class="icon" />
            Séries
          </a>
        </li>

        <!-- Animés -->
        <li>
          <a href="/anime">
            <AnimeIcon class="icon" />
            Animés
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
      </ul>
    </div>
    <div class="menu-separator"></div>
  </div>
</template>

<script setup lang="ts">
import HomeIcon from "@/components/Icons/HomeIcon.vue";
import MovieIcon from "@/components/Icons/MovieIcon.vue";
import SeriesIcon from "@/components/Icons/SeriesIcon.vue";  // Ajout de l'icône Séries
import AnimeIcon from "@/components/Icons/AnimeIcon.vue";    // Ajout de l'icône Animés
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
  transition: transform 0.3s ease;
  transform: translateX(0);
  will-change: transform;
  z-index: 100;
  background: #100f10;
  border-right: 1px solid rgba(201, 192, 192, 0.1);
}

.sidebar-logo {
  text-align: center;
  margin-bottom: 30px;
  margin-left: -60px;
  margin-top: -5px;
}

.sidebar-logo a {
  display: inline-block;
}

/* Sidebar ouverte en mode mobile */
.sidebar.sidebar-open {
  transform: translateX(0);
}

/* Affichage en mobile */
@media (max-width: 1000px) {
  .sidebar.sidebar-open {
    width: 100%;
  }

  .sidebar:not(.sidebar-open) {
    transform: translateX(-100%);
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
  transition: background-color 0.3s ease, color 0.3s ease;
  gap: 15px;
}

/* Icônes du menu */
.icon {
  color: theme("colors.off-white");
  transition: color 0.3s ease;
}

/* Effet de survol */
.menu ul li a:hover {
  background-color: #232123;
  border-left: 4px solid theme("colors.main-green");
}

.menu::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  bottom: 0;
}

.menu-separator {
  height: 1px;
  width: 90%;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 40px auto 0;
}

@media (max-width: 1000px) {
  .sidebar-logo {
    display: none;
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
