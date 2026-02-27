import { signInWithPopup, signOut } from "firebase/auth";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { FirebaseUser } from "~/types/FirebaseUser";

export const useAuth = () => {
    const { $auth, $googleProvider, $user: injectedUser } = useNuxtApp();
    const router = useRouter();

    // Ensure $user is always a ref
    const $user = injectedUser ?? ref<FirebaseUser | null>(null);

    // Computed login state
    const isLoggedIn = computed(() => !!$user.value);

    const loginWithGoogle = async () => {
        if (!$auth || !$googleProvider) return;
        try {
            const result = await signInWithPopup($auth, $googleProvider);
            const token = await result.user.getIdToken();

            const supabaseUser = await $fetch<FirebaseUser>('http://localhost:8080/auth/firebase', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            $user.value = {
                id: supabaseUser.id,
                firebaseId: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL
            } as FirebaseUser;

            console.log("User logged in successfully:");
            await router.push("/recipes");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const logout = async () => {
        if ($auth) await signOut($auth);
        $user.value = null;
        await router.push("/");
    };

    return {
        user: $user,
        isLoggedIn,
        loginWithGoogle,
        logout
    };
};