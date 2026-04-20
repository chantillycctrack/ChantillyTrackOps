<template>
  <div :class="darkMode ? 'dark' : 'light'" class="min-h-screen bg-white dark:bg-darkBg transition-colors duration-300">
    <main class="max-w-5xl mx-auto p-6 space-y-12">
      <section>
        <SignupForm />
      </section>

      <hr class="border-gray-800" />

      <section>
        <Roster />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SignupForm from './components/SignupForm.vue'
import Roster from './components/Roster.vue' // Add this

const darkMode = ref(true)
</script>
