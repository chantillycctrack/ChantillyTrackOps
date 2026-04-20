<template>
  <div :class="darkMode ? 'dark' : 'light'" class="min-h-screen">
    <header class="bg-black border-b border-chantilly/30 p-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-white">
        Charger Track <span class="text-chantilly">Ops</span>
      </h1>
      
      <button @click="darkMode = !darkMode" class="text-sm bg-gray-800 px-3 py-1 rounded border border-gray-600">
        {{ darkMode ? '☀️ Light' : '🌙 Dark' }}
      </button>
    </header>

    <main class="p-6">
      <div class="max-w-4xl mx-auto bg-gray-900 border border-chantilly/20 p-8 rounded-xl shadow-2xl">
        <h2 class="text-chantilly-light text-xl mb-4">Management Dashboard</h2>
        <p class="text-gray-400">Database connection active. Ready for intake.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// Default to dark mode as requested
const darkMode = ref(true)
</script>
