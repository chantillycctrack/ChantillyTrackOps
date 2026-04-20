<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-chantilly/20 mt-8">
    <div class="p-6 border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Staff Management</h3>
      <p class="text-xs text-gray-500 mt-1">Authorized emails can access the Roster and delete athletes.</p>
    </div>

    <div class="p-6">
      <form @submit.prevent="addCoach" class="flex gap-2 mb-6">
        <input v-model="newCoachEmail" type="email" placeholder="New Coach Email" 
               class="flex-1 p-2 rounded-lg border bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-chantilly" required />
        <button type="submit" class="bg-chantilly text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition">
          Add Coach
        </button>
      </form>

      <div class="space-y-2">
        <div v-for="coach in coaches" :key="coach.id" class="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800">
          <span class="text-sm font-medium">{{ coach.email }}</span>
          <button @click="removeCoach(coach)" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition text-xs uppercase font-bold">
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'

const coaches = ref([])
const newCoachEmail = ref('')

onMounted(() => {
  const q = query(collection(db, "authorized_coaches"))
  onSnapshot(q, (snapshot) => {
    coaches.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const addCoach = async () => {
  if (!newCoachEmail.value) return
  try {
    await addDoc(collection(db, "authorized_coaches"), {
      email: newCoachEmail.value.toLowerCase().trim()
    })
    newCoachEmail.value = ''
  } catch (e) {
    alert("Error adding coach: " + e.message)
  }
}

const removeCoach = async (coach) => {
  if (confirm(`Remove access for ${coach.email}?`)) {
    await deleteDoc(doc(db, "authorized_coaches", coach.id))
  }
}
</script>
