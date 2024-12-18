<template>
    <div class="register-page">
        <div class="register-container">
            <!-- Section gauche avec l'image -->
            <div class="register-image">
                <img src="../assets/images/Cinema_image.png" alt="Cinéma" />
            </div>

            <!-- Section droite avec le formulaire d'inscription -->
            <div class="register-form">
                <h2>Inscription</h2>
                <div class="underline"></div>
                <p>Rejoignez-nous pour découvrir du contenu exclusif !</p>

                <!-- Affichage du message d'erreur global si présent -->
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <form @submit.prevent="handleRegister">
                    <div class="form-group">
                        <label for="username">Nom d'utilisateur</label>
                        <input v-model="username" type="text" id="username" placeholder="Choisissez un nom d'utilisateur" required />
                        <p v-if="validationErrors.username" class="validation-error" v-for="err in validationErrors.username" :key="err">
                            {{ err }}
                        </p>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input v-model="email" type="email" id="email" placeholder="Entrez votre email" required />
                        <p v-if="validationErrors.email" class="validation-error" v-for="err in validationErrors.email" :key="err">
                            {{ err }}
                        </p>
                    </div>

                    <div class="form-group password-group">
                        <label for="password">Mot de passe</label>
                        <input v-model="password" type="password" id="password" placeholder="Choisissez un mot de passe" required />
                        <p v-if="validationErrors.password" class="validation-error" v-for="err in validationErrors.password" :key="err">
                            {{ err }}
                        </p>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn-submit">Créer mon compte</button>
                    </div>
                    <!-- Affichage du spinner pendant le chargement -->
                    <div v-if="loading" class="loading-spinner">Chargement...</div>
                </form>

                <div class="login-link">
                    <span class="text-white">Déjà inscrit ? Connectez-vous</span>
                    <a href="/login" class="login-here"> ici</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth'; // Utilise le composable pour l'inscription et le login
import { useNotificationStore } from '@/stores/useNotificationStore'; // Importer le store de notifications

// Références pour les champs du formulaire
const username = ref('');
const email = ref('');
const password = ref('');

const { registerUser, error, validationErrors, loading } = useAuth(); // Utilise la méthode d'inscription
const router = useRouter();
const notificationStore = useNotificationStore(); // Référence au store de notifications

// Fonction pour gérer la soumission du formulaire d'inscription
const handleRegister = async () => {
    await registerUser(username.value, email.value, password.value);

    if (!error.value && Object.keys(validationErrors.value).length === 0) {
        // Notification de succès avec le message de bienvenue
        notificationStore.addNotification('success', `Bienvenue, ${username.value} !`);

        // Redirige l'utilisateur après une inscription réussie
        await router.push('/');
    } else {
        // En cas d'erreur, on peut afficher une notification d'erreur
        notificationStore.addNotification('error', 'Erreur lors de l\'inscription.');
    }
};
</script>


<style scoped>
/* Styles de la page d'inscription */
.register-page {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 120px;
    margin-bottom: 20px;
    font-family: theme("fontFamily.sans"), sans-serif; /* Applique la police Lato */
}

.register-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1000px;
    background-color: #292731;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(35, 35, 35, 0.3),
    0 8px 25px rgba(0, 0, 0, 0.9);
}

.register-image {
    display: flex;
    justify-content: center;
    align-items: center;
}

.register-image img {
    object-fit: cover;
    border-radius: 8px;
    margin-left: 10px;
    width: 450px;
    height: auto;
}

.register-form {
    width: 400px;
    background-color: #1a181a;
    padding: 20px 25px 25px;
    border-radius: 10px;
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.6),
        0 4px 6px rgba(0, 0, 0, 0.4),
        0 0 10px rgba(255, 255, 255, 0.1);
}

h2 {
    font-size: 28px;
    margin-bottom: 3px;
    color: theme("colors.off-white");
    font-weight: normal;
}

.underline {
    width: 135px;
    height: 1px;
    background-color: theme("colors.off-white");
    margin-bottom: 10px;
    border-radius: 3px;
}

p {
    margin-bottom: 20px;
    font-size: 14px;
    color: #ccc;
}

.form-group {
    margin-bottom: 22px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: lighter;
    color: #ccc;
    font-size: 14px;
}

input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #404040;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(97, 97, 97, 0.8) 0%, rgba(196, 196, 196, 0.1) 100%);
    color: #fff;
    outline: none;
}

input:focus {
    border-color: theme('colors.main-green');
    box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

input::placeholder {
    color: #888;
    font-size: 13px;
}

.btn-submit {
    margin-top: 20px;
    width: 100%;
    background-color: theme('colors.main-green');
    color: #000000;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 13px;
    font-weight: 600;
}

.btn-submit:hover {
    transform: scale(1.01);
    background-color: #00b088;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.btn-submit:active {
    transform: scale(0.99);
    background-color: #009f76;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.login-link {
    text-align: center;
    margin-top: 20px;
    font-size: 12px;
}

.login-link .text-white {
    color: #ccc;
}

.login-link .login-here {
    color: theme('colors.main-green');
    text-decoration: none;
    font-weight: bold;
}

.login-link .login-here:hover {
    color: theme('colors.main-green');
}

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

.loading-spinner {
    margin-top: 10px;
    color: theme('colors.main-green');
    font-size: 1.2rem;
}

/* Media query pour petits écrans */
@media (max-width: 1100px) {
    .register-container {
        justify-content: center; /* Centrer le formulaire si l'image est masquée */
        width: 100%; /* Prend toute la largeur disponible */
        background: none;
        box-shadow: none;
        padding-top: 0;
    }

    .register-image {
        display: none; /* Masquer l'image en dessous de 1100px */
    }
}

@media (max-width: 500px) {
    .register-container {
        padding: 0;
    }
}
</style>
