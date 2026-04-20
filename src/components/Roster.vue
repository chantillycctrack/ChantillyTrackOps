<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-chantilly/20">
    <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">Active Roster</h3>
      <span class="bg-chantilly/10 text-chantilly text-xs font-bold px-3 py-1 rounded-full">
        {{ athletes.length }} Athletes
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-black/20 text-gray-400 text-[10px] uppercase tracking-widest">
          <tr>
            <th class="p-4">Name</th>
            <th class="p-4">Grade / Group</th>
            <th class="p-4">Contact</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="athlete in athletes" :key="athlete.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <td class="p-4">
              <div class="font-bold text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</div>
              <div class="text-[10px] uppercase tracking-wider text-gray-500">
                {{ athlete.isActive ? '● Active' : '○ Inactive' }}
              </div>
            </td>
            <td class="p-4 text-sm">
              <div class="text-gray-700 dark:text-gray-300">{{ athlete.currentGrade }}</div>
              <div class="text-chantilly font-medium text-xs">{{ athlete.group }}</div>
            </td>
            <td class="p-4 text-[11px] text-gray-500 leading-tight">
              <div>A: {{ athlete.email }}</div>
              <div class="italic">P: {{ athlete.parentEmail }}</div>
            </td>
            <td class="p-4 text-right">
              <div class="flex justify-end gap-2">
                <button @click="toggleStatus(athlete)" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition" title="Archive/Unarchive">
                  {{ athlete.isActive ? '📂' : '📤' }}
                </button>
                <button @click="deleteAthlete(athlete)" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition" title="Delete Permanently">
                  🗑️
                </button>
              </div>
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
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const athletes = ref([])

onMounted(() => {
  const q = query(collection(db, "athletes"))
  onSnapshot(q, (snapshot) => {
    athletes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const toggleStatus = async (athlete) => {
  const athleteRef = doc(db, "athletes", athlete.id)
  await updateDoc(athleteRef, { isActive: !athlete.isActive })
}

const deleteAthlete = async (athlete) => {
  const confirmed = confirm(`PERMANENTLY DELETE ${athlete.firstName} ${athlete.lastName}?\n\nThis cannot be undone. Usually, you should use the Archive (Folder) button instead.`)
  if (confirmed) {
    await deleteDoc(doc(db, "athletes", athlete.id))
  }
}
</script>
