<template>
    <div class="login-page">
        <div class="login-container">
            <!-- Section gauche avec l'image -->
            <div class="login-image">
                <img src="../assets/images/Cinema_image.png" alt="Cinéma" />
            </div>

            <!-- Section droite avec le formulaire de connexion -->
            <div class="login-form">
                <h2>Connexion</h2>

                <div class="underline"></div>
                <p>Prêt à explorer votre contenu préféré ?</p>

                <form @submit.prevent="handleLogin">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input v-model="email" type="email" id="email" placeholder="Entrez votre email" required />
                        <!-- Affichage des erreurs de validation pour l'email -->
                        <p v-if="validationErrors.email" class="validation-error" v-for="err in validationErrors.email" :key="err">
                            {{ err }}
                        </p>
                    </div>

                    <div class="form-group password-group">
                        <label for="password">Mot de passe</label>
                        <input v-model="password" type="password" id="password" placeholder="Entrez votre mot de passe" required />
                        <p v-if="validationErrors.password" class="validation-error" v-for="err in validationErrors.password" :key="err">
                            {{ err }}
                        </p>
                        <a href="#" class="forgot-password">Mot de passe oublié ?</a>
                    </div>

                    <div class="form-group">
                        <button type="submit" :disabled="loading" class="btn-submit">Connexion</button>
                    </div>
                    <!-- Affichage du spinner pendant le chargement -->
                    <div v-if="loading" class="loading-spinner">Chargement...</div>
                </form>

<!--                <div class="register-link">-->
<!--                    <span class="text-white">Nouveau ? Créez votre compte</span>-->
<!--                    <a href="/register" class="register-here"> ici</a>-->
<!--                </div>-->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth'; // Import du composable pour l'authentification
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/useNotificationStore';

// Champs du formulaire
const email = ref('');
const password = ref('');

// Utilisation du composable pour gérer l'authentification
const { loginUser, error, validationErrors, loading } = useAuth();

// Utilisation du router pour rediriger après le login
const router = useRouter();
const notificationStore = useNotificationStore();

// Fonction pour gérer la soumission du formulaire de login
const handleLogin = async () => {
    await loginUser(email.value, password.value);

    // Si la connexion est réussie, afficher la notification et rediriger
    if (!error.value && Object.keys(validationErrors.value).length === 0) {
        // Ajouter une notification de succès
        notificationStore.addNotification('success', 'Connexion réussie !');

        // Redirection après succès
        await router.push('/');
    } else {
        console.error('Erreur lors de la connexion:', error.value);
    }
};
</script>

<style scoped>
/* Styles de la page de connexion */
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 120px;
    font-family: theme("fontFamily.sans"), sans-serif; /* Applique la police Lato */
}

.login-container {
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

.login-image {
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-image img {
    object-fit: cover;
    border-radius: 8px;
    width: 450px;
    height: auto;
}

.login-form {
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
    margin-bottom: 1px;
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
    position: relative;
    margin-bottom: 22px;
}

.password-group {
    margin-bottom: 10px;
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
    outline: none; /* Enlève le surlignement par défaut */
}

/* Focus: changer la bordure en vert */
input:focus {
    border-color: theme('colors.main-green');
    box-shadow: 0 0 8px rgba(0, 204, 155, 0.1);
}

input::placeholder {
    color: #888;
    font-size: 13px;
}

.forgot-password {
    position: absolute;
    bottom: -25px;
    right: 0;
    color: #ccc;
    font-size: 12px;
}

.btn-submit {
    margin-top: 35px;
    width: 100%; /* Largeur égale aux autres inputs */
    background-color: theme('colors.main-green');
    color: #000000;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-transform: uppercase; /* Met le texte en majuscules */
    font-size: 13px;
    font-weight: 600; /* Poids intermédiaire */
}

.btn-submit:hover {
    transform: scale(1.01); /* Le bouton s'agrandit légèrement au survol */
    background-color: #00b088; /* Un vert plus foncé au survol */
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3); /* Augmente l'ombre au survol */
}

.btn-submit:active {
    transform: scale(0.99); /* Le bouton rétrécit légèrement lors du clic */
    background-color: #009f76; /* Un ton encore plus foncé au clic */
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2); /* Réduit l'ombre lors du clic */
}

.register-link {
    text-align: center;
    margin-top: 20px;
    font-size: 12px;
}

.register-link .text-white {
    color: #ccc;
}

.register-link .register-here {
    color: theme('colors.main-green');
    text-decoration: none;
    font-weight: bold;
}

.register-link .register-here:hover {
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

/* Media query pour les écrans en dessous de 1100px */
@media (max-width: 1100px) {
    .login-container {
        justify-content: center; /* Centrer le formulaire si l'image est masquée */
        width: 100%; /* Prend toute la largeur disponible */
        background: none;
        box-shadow: none;
        padding-top: 0;
    }

    .login-image {
        display: none; /* Masquer l'image en dessous de 1100px */
    }
}

@media (max-width: 500px) {
    .login-container {
        padding: 0;
    }
}

</style>
