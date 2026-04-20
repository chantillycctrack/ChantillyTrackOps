<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-chantilly/20">
    <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
      <div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ showArchived ? 'Full Database' : 'Current Roster' }}
        </h3>
        <p class="text-xs text-gray-500">{{ filteredAthletes.length }} Athletes Shown</p>
      </div>
      
      <button @click="showArchived = !showArchived" 
              class="text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-lg border transition shadow-sm"
              :class="showArchived ? 'bg-chantilly text-white border-chantilly' : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'">
        {{ showArchived ? 'Hide Archived' : 'Show Archived' }}
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-black/20 text-gray-400 text-[10px] uppercase tracking-widest">
          <tr>
            <th class="p-4">Name</th>
            <th class="p-4">Grade / Group</th>
            <th class="p-4">Contact Info</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="athlete in filteredAthletes" :key="athlete.id" 
              class="hover:bg-gray-50 dark:hover:bg-white/5 transition border-l-4" 
              :class="athlete.isActive ? 'border-l-green-500' : 'border-l-gray-500 opacity-60'">
            
            <td class="p-4">
              <div class="font-bold text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</div>
              <div class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                {{ athlete.isActive ? 'Active' : 'Archived' }}
              </div>
            </td>

            <td class="p-4 text-sm">
              <div class="text-gray-700 dark:text-gray-300 font-medium">{{ athlete.currentGrade }}</div>
              <div class="text-chantilly font-bold text-[10px] uppercase tracking-wider">{{ athlete.group }}</div>
            </td>

            <td class="p-4 text-[11px] leading-tight space-y-2">
              <div class="flex flex-col">
                <span class="text-gray-400 uppercase font-black text-[9px] tracking-tighter">Athlete</span>
                <span class="text-gray-700 dark:text-gray-300">{{ athlete.email }}</span>
              </div>
              
              <div v-if="athlete.parentName1 || athlete.parentEmail1" class="flex flex-col border-t border-gray-100 dark:border-gray-800 pt-1">
                <span class="text-gray-400 uppercase font-black text-[9px] tracking-tighter">Guardian 1</span>
                <span class="text-gray-800 dark:text-gray-200 font-medium">{{ athlete.parentName1 || 'No Name Provided' }}</span>
                <span class="text-gray-500 italic">{{ athlete.parentEmail1 || 'No Email' }}</span>
              </div>

              <div v-if="athlete.parentName2 || athlete.parentEmail2" class="flex flex-col border-t border-gray-100 dark:border-gray-800 pt-1">
                <span class="text-gray-400 uppercase font-black text-[9px] tracking-tighter">Guardian 2</span>
                <span class="text-gray-800 dark:text-gray-200 font-medium">{{ athlete.parentName2 || 'No Name Provided' }}</span>
                <span class="text-gray-500 italic">{{ athlete.parentEmail2 || 'No Email' }}</span>
              </div>
            </td>

            <td class="p-4 text-right">
              <div class="flex justify-end gap-2">
                <button @click="toggleStatus(athlete)" 
                        class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition" 
                        :title="athlete.isActive ? 'Archive Athlete' : 'Restore Athlete'">
                  {{ athlete.isActive ? '📂' : '📤' }}
                </button>
                <button @click="deleteAthlete(athlete)" 
                        class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition" 
                        title="Delete Permanently">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredAthletes.length === 0" class="p-12 text-center text-gray-500 text-sm italic">
        No athletes found in this view.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const athletes = ref([])
const showArchived = ref(false)

const filteredAthletes = computed(() => {
  if (showArchived.value) {
    return athletes.value 
  }
  return athletes.value.filter(a => a.isActive === true)
})

onMounted(() => {
  const q = query(collection(db, "athletes"))
  onSnapshot(q, (snapshot) => {
    athletes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const toggleStatus = async (athlete) => {
  const athleteRef = doc(db, "athletes", athlete.id)
  try {
    await updateDoc(athleteRef, { isActive: !athlete.isActive })
  } catch (e) {
    console.error("Update failed:", e)
  }
}

const deleteAthlete = async (athlete) => {
  const msg = `PERMANENTLY DELETE ${athlete.firstName} ${athlete.lastName}?\n\nThis cannot be undone.`
  if (confirm(msg)) {
    try {
      await deleteDoc(doc(db, "athletes", athlete.id))
    } catch (e) {
      alert("Error: " + e.message)
    }
  }
}
</script>
