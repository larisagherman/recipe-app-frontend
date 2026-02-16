<script setup>
import { signInWithPopup } from "firebase/auth";

const { $auth, $googleProvider } = useNuxtApp();

const login = async () => {
  const result = await signInWithPopup($auth, $googleProvider);
  const token = await result.user.getIdToken();
  console.log("FIREBASE TOKEN:", token);
};
</script>

<template>
  <button @click="login">
    Login with Google
  </button>
</template>
