import type { Auth, GoogleAuthProvider, User as FirebaseUserType } from "firebase/auth";
import type { Ref } from "vue";
import type { FirebaseUser } from "~/types/FirebaseUser";

declare module '#app' {
    interface NuxtApp {
        $auth: Auth;
        $googleProvider: GoogleAuthProvider;
        $user: Ref<FirebaseUser | null>;
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $auth: Auth;
        $googleProvider: GoogleAuthProvider;
        $user: Ref<FirebaseUser | null>;
    }
}
