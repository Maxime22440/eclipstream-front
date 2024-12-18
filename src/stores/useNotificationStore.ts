import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<{ type: string; message: string }[]>([]);

    const addNotification = (type: string, message: string) => {
        notifications.value.push({ type, message });

        // Supprimer automatiquement la notification après 5 secondes
        setTimeout(() => {
            notifications.value.shift();
        }, 4000); // Durée de la notification visible
    };

    const removeNotification = (index: number) => {
        notifications.value.splice(index, 1);
    };

    return { notifications, addNotification, removeNotification };
});
