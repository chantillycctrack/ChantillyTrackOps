<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="text-center md:text-left">
      <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
        Staff <span class="text-chantilly">Management</span>
      </h2>
      <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Authorized Coaching Access</p>
    </div>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 space-y-2">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">New Coach Email</label>
          <input v-model="newCoachEmail" type="email" placeholder="coach@fcps.edu" 
                 class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-chantilly transition" />
        </div>
        <button @click="addCoach" class="btn-purple-comm px-8 py-3.5 whitespace-nowrap">
          Grant Access
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
        <h4 class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Coaching Staff</h4>
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <div v-for="coach in coaches" :key="coach.id" class="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition">
          <div>
            <p class="font-bold text-gray-900 dark:text-white">{{ coach.email }}</p>
            <p class="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Authorized User</p>
          </div>
          <button @click="removeCoach(coach)" class="px-3 py-1.5 text-[9px] font-black uppercase rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition">
            Revoke Access
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebaseConfig'
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

const coaches = ref([])
const newCoachEmail = ref('')

onMounted(() => {
  onSnapshot(collection(db, "authorized_coaches"), (snap) => {
    coaches.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const addCoach = async () => {
  if (!newCoachEmail.value) return
  await addDoc(collection(db, "authorized_coaches"), { email: newCoachEmail.value.toLowerCase().trim() })
  newCoachEmail.value = ''
}

const removeCoach = async (coach) => {
  if (confirm(`Remove ${coach.email}?`)) await deleteDoc(doc(db, "authorized_coaches", coach.id))
}
</script>

<style scoped>
.btn-purple-comm {
  @apply bg-chantilly text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-chantilly/20 hover:scale-[1.02] active:scale-[0.98] transition-all;
}
</style>
