<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="text-center md:text-left">
      <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
        Meet <span class="text-chantilly">Management</span>
      </h2>
      <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Schedule & Results Hub</p>
    </div>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <form @submit.prevent="createMeet" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="md:col-span-2 space-y-2">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Meet Name</label>
          <input v-model="newMeet.name" type="text" placeholder="e.g. Liberty Premier Invitational" class="input-field-comm" required />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Date</label>
          <input v-model="newMeet.date" type="date" class="input-field-comm" required />
        </div>
        <button type="submit" class="btn-purple-comm py-3.5">Add Meet</button>
      </form>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div v-for="meet in meets" :key="meet.id" 
           class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="bg-chantilly/10 p-3 rounded-xl text-chantilly font-black text-center min-w-[60px]">
            <div class="text-[10px] uppercase">{{ formatDate(meet.date, 'month') }}</div>
            <div class="text-xl">{{ formatDate(meet.date, 'day') }}</div>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ meet.name }}</h4>
            <div class="flex gap-2 mt-1">
               <span class="text-[9px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 rounded">
                 {{ meet.location || 'TBD' }}
               </span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button class="px-4 py-2 text-[10px] font-black uppercase rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            Results
          </button>
          <button @click="deleteMeet(meet.id)" class="px-4 py-2 text-[10px] font-black uppercase rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebaseConfig'
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

const meets = ref([])
const newMeet = ref({ name: '', date: '', location: '' })

onMounted(() => {
  const q = query(collection(db, "meets"), orderBy("date", "desc"))
  onSnapshot(q, (snap) => {
    meets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const createMeet = async () => {
  await addDoc(collection(db, "meets"), { ...newMeet.value, createdAt: new Date() })
  newMeet.value = { name: '', date: '', location: '' }
}

const deleteMeet = async (id) => {
  if (confirm("Delete this meet?")) await deleteDoc(doc(db, "meets", id))
}

const formatDate = (dateStr, part) => {
  const date = new Date(dateStr)
  if (part === 'month') return date.toLocaleString('default', { month: 'short' })
  if (part === 'day') return date.getDate() + 1
  return date.toLocaleDateString()
}
</script>

<style scoped>
.input-field-comm {
  @apply w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-chantilly transition;
}
.btn-purple-comm {
  @apply w-full bg-chantilly text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-chantilly/20 hover:scale-[1.02] active:scale-[0.98] transition-all;
}
</style>
