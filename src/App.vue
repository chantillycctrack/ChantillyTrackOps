<template>
  <div :class="{ 'dark': darkMode }" class="min-h-screen bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 font-sans">
    
    <header class="bg-white dark:bg-black border-b border-gray-200 dark:border-[#4B2E83]/30 px-6 py-4 flex justify-between items-center shadow-sm">
      <h1 class="text-xl font-black tracking-tight uppercase">
        Chantilly <span class="text-[#4B2E83]">Track Ops</span>
      </h1>
      
      <div class="flex items-center gap-6">
        <button @click="isAdmin = !isAdmin" class="text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-[#4B2E83] transition">
          {{ isAdmin ? '← Back to Form' : 'Coach Login' }}
        </button>
        <button @click="darkMode = !darkMode" class="hover:opacity-70 transition">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="container mx-auto px-4 py-12 flex justify-center">
      <div class="w-full max-w-3xl">
        
        <template v-if="isAdmin && isAuthorizedCoach">
          <div class="flex gap-4 mb-6">
            <button @click="activeTab = 'roster'" :class="activeTab === 'roster' ? 'text-chantilly border-b-2 border-chantilly' : 'text-gray-400'" class="pb-2 font-bold uppercase text-xs tracking-widest transition">
              Athlete Roster
            </button>
            <button @click="activeTab = 'staff'" :class="activeTab === 'staff' ? 'text-chantilly border-b-2 border-chantilly' : 'text-gray-400'" class="pb-2 font-bold uppercase text-xs tracking-widest transition">
              Staff Management
            </button>
          </div>
    
          <Roster v-if="activeTab === 'roster'" />
          <StaffManager v-if="activeTab === 'staff'" />
        </template>
    
        <SignupForm v-else />
        
      </div>
    </main>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SignupForm from './components/SignupForm.vue'
import Roster from './components/Roster.vue'
import StaffManager from './components/StaffManager.vue'

const darkMode = ref(true)
const isAdmin = ref(false) // Default is FALSE so athletes don't see the roster
const activeTab = ref('roster')
</script>
