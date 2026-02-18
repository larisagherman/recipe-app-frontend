// app/plugins/firebase.client.ts
import { defineNuxtPlugin } from "#app";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { ref } from "vue";
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
    const baseUrl = config.public.apiBaseUrl || 'http://localhost:8080';

    // Create a reactive user
    const user =ref<FirebaseUser | null>(null);

    const syncUserFromFirebase = async (firebaseUser: { getIdToken: () => Promise<string>; displayName: string | null; email: string | null; photoURL: string | null } | null) => {
        if (!firebaseUser) {
            user.value = null;
            return;
        }

        try {
            const token = await firebaseUser.getIdToken();
            const supabaseUser = await $fetch<FirebaseUser>(`${baseUrl}/auth/firebase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            user.value = {
                id: supabaseUser.id,
                firebaseId: firebaseUser.uid,
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL
            } as FirebaseUser;
        } catch (error) {
            console.error('Failed to sync user:', error);
            user.value = null;
        }
    };

    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Failed to set auth persistence:', error);
    });

    // Try to hydrate from any existing session immediately.
    void syncUserFromFirebase(auth.currentUser ?? null);

    onAuthStateChanged(auth, (firebaseUser) => {
        void syncUserFromFirebase(firebaseUser);
    });

    // Provide auth, provider, and user globally
    nuxtApp.provide("auth", auth);
    nuxtApp.provide("googleProvider", googleProvider);
    nuxtApp.provide("user", user);
});
