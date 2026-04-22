<template>
  <div class="max-w-md mx-auto">
    <div v-if="!isAccessPermitted" class="bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 text-center animate-in fade-in zoom-in duration-500">
      <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="text-4xl">🔒</span>
      </div>
      <h2 class="text-2xl font-black uppercase text-gray-900 dark:text-white">Registration Closed</h2>
      <p class="text-gray-500 mt-4 text-sm leading-relaxed">
        Tryouts have concluded or the roster is currently locked. 
        <span v-if="regData.closingDate" class="block mt-2 font-bold text-chantilly">Deadline was: {{ regData.closingDate }}</span>
      </p>
      <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-[10px] uppercase font-black text-gray-400 tracking-widest">
        Chantilly Track & Field
      </div>
    </div>

    <div v-else class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-chantilly/30">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
          Athlete <span class="text-chantilly">Registration</span>
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Join Chantilly Track & Field</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-4">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em]">Athlete Details</label>
          <div class="grid grid-cols-2 gap-4">
            <input v-model="form.firstName" type="text" placeholder="First Name *" class="input-field" required />
            <input v-model="form.lastName" type="text" placeholder="Last Name *" class="input-field" required />
          </div>
          </div>

        <button type="submit" :disabled="loading" class="btn-purple w-full py-4 mt-6 flex justify-center items-center text-sm uppercase tracking-widest font-black">
          <span v-if="loading">Processing...</span>
          <span v-else>Complete Registration</span>
        </button>
      </form>
      
      <p v-if="success" class="mt-6 text-center text-green-500 font-bold animate-bounce text-sm">
        ✓ Welcome to the team, Charger!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebaseConfig'
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore'

// Registration Data State
const regData = ref({ isOpen: true, closingDate: '' })

onMounted(() => {
  onSnapshot(doc(db, "settings", "registration"), (snap) => {
    if (snap.exists()) regData.value = snap.data()
  })
})

const isAccessPermitted = computed(() => {
  const { isOpen, closingDate } = regData.value
  if (!isOpen) return false
  if (closingDate) {
    const today = new Date().toISOString().split('T')[0]
    if (today > closingDate) return false
  }
  return true
})

// ... rest of your existing form logic (form ref, handleSubmit, etc.)
</script>
