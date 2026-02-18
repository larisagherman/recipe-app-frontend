import { signInWithPopup, signOut } from "firebase/auth";
import { computed } from "vue";
import { useRouter } from "vue-router";
import type {FirebaseUser} from "~/types/FirebaseUser";

export const useAuth = () => {
    const { $auth, $googleProvider, $user } = useNuxtApp();
    const router = useRouter();

    // Computed login state
    const isLoggedIn = computed(() => !!$user?.value);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup($auth, $googleProvider);
            // Get Firebase ID token
            const token = await result.user.getIdToken();

            const supabaseUser = await $fetch<FirebaseUser>('http://localhost:8080/auth/firebase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            $user.value = {
                id: supabaseUser.id,
                firebaseId: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL
            } as FirebaseUser;

            console.log("User logged in successfully:");
            await router.push("/recipes"); // redirect after login
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = async () => {
        await signOut($auth);
        $user.value = null;
        await router.push("/"); // redirect after logout
    };

    return {
        user: $user,
        isLoggedIn,
        loginWithGoogle,
        logout
    };
};
