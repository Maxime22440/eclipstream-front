<template>
    <!-- Wrapper des notifications avec styles conditionnels pour mobile -->
    <div :style="{ zIndex: 9999 }"
         class="fixed top-3 right-4 w-full max-w-md sm:w-auto flex sm:justify-end justify-center px-4 sm:px-0">
        <!-- Notifications avec transition -->
        <transition-group name="fade" tag="div" class="w-full sm:w-auto">
            <div v-for="(notification, index) in notifications"
                 :key="index"
                 :style="{ backgroundColor: notification.type === 'success' ? '#00CC9B' : '#FF3364', color: 'black', fontWeight: 'bold' }"
                 class="notification-container p-4 mb-4 rounded-xl shadow-md hover:shadow-xl w-full sm:w-auto transition duration-500 ease-out transform flex items-center relative pr-10">

                <!-- Icône selon le type de notification -->
                <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"
                   class="mr-4 text-white text-lg"></i>

                <!-- Message de la notification -->
                <span class="text-shadow-lg flex-grow">{{ notification.message }}</span>

                <!-- Bouton pour fermer la notification -->
                <button @click="closeNotification(index)"
                        class="close-button absolute top-2 right-2 focus:outline-none">
                    &times;
                </button>
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/useNotificationStore';

// Importation du store des notifications
const notificationStore = useNotificationStore();
const notifications = notificationStore.notifications;

// Fonction pour fermer une notification
const closeNotification = (index: number) => {
    notificationStore.removeNotification(index);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}

.fade-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* Ajout d'une légère ombre pour le texte */
.text-shadow-lg {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Style pour le bouton de fermeture */
.close-button {
    background-color: transparent;
    border: 2px solid rgba(0, 0, 0, 0.2);
    color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.close-button:hover {
    background-color: #ff3364;
    border-color: #ff3364;
    color: #fff;
    transform: scale(1.1);
}

.close-button:active {
    transform: scale(0.9);
    background-color: #ff0033;
    border-color: #ff0033;
}

@media (max-width: 500px) {
    .notification-container {
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        width: 85%;
        padding: 13px 40px 13px 13px;
        margin: 0;
    }

    .text-shadow-lg {
        font-size: 14px;
    }

    .close-button {
        width: 20px;
        height: 20px;
        font-size: 16px;
    }
}

</style>
