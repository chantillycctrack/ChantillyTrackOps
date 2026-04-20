<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-chantilly/20">
      <h3 class="text-lg font-bold mb-4 uppercase tracking-wider">Schedule New Meet</h3>
      <form @submit.prevent="addMeet" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="newMeet.name" type="text" placeholder="Meet Name" class="input-field" required />
        <input v-model="newMeet.date" type="date" class="input-field" required />
        <button type="submit" class="bg-chantilly text-white font-bold rounded-lg px-4 py-2 hover:opacity-90 transition">
          Add to Calendar
        </button>
      </form>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-chantilly/20">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-black/20 text-[10px] uppercase tracking-widest text-gray-400">
          <tr>
            <th class="p-4">Date</th>
            <th class="p-4">Meet Name</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="meet in meets" :key="meet.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <td class="p-4 font-mono text-sm">{{ meet.date }}</td>
            <td class="p-4 font-bold">{{ meet.name }}</td>
            <td class="p-4 text-right">
              <button @click="deleteMeet(meet)" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'

const meets = ref([])
const newMeet = ref({ name: '', date: '' })

onMounted(() => {
  const q = query(collection(db, "meets"), orderBy("date", "asc"))
  onSnapshot(q, (snapshot) => {
    meets.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const addMeet = async () => {
  try {
    await addDoc(collection(db, "meets"), { ...newMeet.value })
    newMeet.value = { name: '', date: '' }
  } catch (e) { alert(e.message) }
}

const deleteMeet = async (meet) => {
  if (confirm(`Delete ${meet.name}?`)) {
    await deleteDoc(doc(db, "meets", meet.id))
  }
}
</script>
