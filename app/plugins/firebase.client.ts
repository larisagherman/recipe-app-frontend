// app/plugins/firebase.client.ts
import { defineNuxtPlugin } from "#app";
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import type {FirebaseUser} from "~/types/FirebaseUser";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const firebaseConfig = {
        apiKey: config.public.apiKey,
        authDomain: "recipe-app-7c933.firebaseapp.com",
        projectId: "recipe-app-7c933",
        storageBucket: "recipe-app-7c933.firebasestorage.app",
        messagingSenderId: "464154420264",
        appId: "1:464154420264:web:e1460e69579f2e385a011d"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();

    // Create a reactive user
    const user =ref<FirebaseUser | null>(null);

    // Provide auth, provider, and user globally
    nuxtApp.provide("auth", auth);
    nuxtApp.provide("googleProvider", googleProvider);
    nuxtApp.provide("user", user);
});
