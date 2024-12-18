<template>
    <div class="burger-menu" @click="toggleMenu">
        <span :class="{ open: isOpen }"></span>
        <span :class="{ open: isOpen }"></span>
        <span :class="{ open: isOpen }"></span>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const isOpen = ref(false);

// Fonction pour ouvrir/fermer le menu et émettre l'événement au parent
const toggleMenu = () => {
    isOpen.value = !isOpen.value;
    emit("toggle-sidebar"); // On émet un événement vers le parent
};

const emit = defineEmits(["toggle-sidebar"]);
</script>

<style scoped>
.burger-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 25px;
    height: 15px;
    cursor: pointer;
    z-index: 6;
}

/* Styles des barres */
.burger-menu span {
    display: block;
    height: 2px;
    width: 100%;
    background-color: #efefef; /* Couleur des barres */
    transition: all 0.4s ease-in-out;
    border-radius: 2px;
}

/* Animation quand le menu est ouvert */
.burger-menu span.open:nth-child(1) {
    transform: rotate(45deg);
    transform-origin: 10% 10%;
}

.burger-menu span.open:nth-child(2) {
    opacity: 0; /* Cache la barre du milieu */
}

.burger-menu span.open:nth-child(3) {
    transform: rotate(-45deg);
    transform-origin: 10% 90%;
}

/* Animation du retour au menu burger */
.burger-menu span:not(.open):nth-child(1) {
    transform: rotate(0);
}

.burger-menu span:not(.open):nth-child(2) {
    opacity: 1;
}

.burger-menu span:not(.open):nth-child(3) {
    transform: rotate(0);
}
</style>
