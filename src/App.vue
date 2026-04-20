<template>
  <div :class="darkMode ? 'dark' : 'light'" class="min-h-screen bg-gray-50 dark:bg-darkBg transition-colors duration-300">
    <header class="bg-white dark:bg-black border-b border-chantilly/30 p-4 flex justify-between items-center shadow-md">
      <h1 class="text-2xl font-bold dark:text-white text-gray-900">
        Charger Track <span class="text-chantilly">Ops</span>
      </h1>
      <button @click="darkMode = !darkMode" class="text-sm dark:bg-gray-800 bg-gray-200 px-3 py-1 rounded-lg border border-gray-400 dark:border-gray-600">
        {{ darkMode ? '☀️ Light' : '🌙 Dark' }}
      </button>
    </header>

    <main class="p-8">
      <SignupForm />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SignupForm from './components/SignupForm.vue' // Import the component

const darkMode = ref(true)
</script>
