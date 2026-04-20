<template>
  <div :class="darkMode ? 'dark' : 'light'" class="min-h-screen bg-gray-50 dark:bg-darkBg transition-colors duration-300">
    <header class="bg-white dark:bg-black border-b border-gray-200 dark:border-chantilly/30 p-4 flex justify-between items-center shadow-lg">
      <h1 class="text-xl font-black tracking-tighter dark:text-white text-gray-900 uppercase">
        Chantilly <span class="text-chantilly font-normal">Track Ops</span>
      </h1>
      
      <div class="flex gap-3">
        <button @click="isAdmin = !isAdmin" class="text-[10px] uppercase tracking-widest text-gray-500 hover:text-chantilly">
          {{ isAdmin ? 'Close Admin' : 'Coach Entry' }}
        </button>
        <button @click="darkMode = !darkMode" class="text-lg">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto p-6 pt-12">
      <Roster v-if="isAdmin" />
      
      <SignupForm v-else />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SignupForm from './components/SignupForm.vue'
import Roster from './components/Roster.vue'

const darkMode = ref(true)
const isAdmin = ref(false) // Default is FALSE so athletes don't see the roster
</script>
