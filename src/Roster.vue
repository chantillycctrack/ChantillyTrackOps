<template>
  <div class="mt-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">Team <span class="text-chantilly">Roster</span></h2>
      <button @click="showInactive = !showInactive" class="text-sm border border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-800 transition">
        {{ showInactive ? 'View Active Roster' : 'View Inactive/Alumni' }}
      </button>
    </div>

    <div class="overflow-x-auto bg-gray-900 border border-chantilly/20 rounded-xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-black/50 text-chantilly-light uppercase text-xs tracking-wider">
            <th class="p-4 border-b border-gray-800">Athlete Name</th>
            <th class="p-4 border-b border-gray-800">Grade</th>
            <th class="p-4 border-b border-gray-800">Group</th>
            <th class="p-4 border-b border-gray-800 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="athlete in athletes" :key="athlete.id" class="hover:bg-white/5 transition">
            <td class="p-4 font-medium">{{ athlete.lastName }}, {{ athlete.firstName }}</td>
            <td class="p-4 text-gray-400">{{ athlete.currentGrade }}</td>
            <td class="p-4 text-gray-400">{{ athlete.group }}</td>
            <td class="p-4 text-right">
              <button 
                @click="toggleStatus(athlete.id, athlete.isActive)"
                :class="athlete.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'"
                class="text-xs font-bold uppercase tracking-widest"
              >
                {{ athlete.isActive ? 'Deactivate' : 'Re-activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="athletes.length === 0" class="p-10 text-center text-gray-500">
        No athletes found in this category.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'

const athletes = ref([])
const showInactive = ref(false)
let unsubscribe = null

const fetchAthletes = () => {
  // If we have an old listener, stop it
  if (unsubscribe) unsubscribe()

  const q = query(
    collection(db, "athletes"), 
    where("isActive", "==", !showInactive.value)
  )

  unsubscribe = onSnapshot(q, (snapshot) => {
    athletes.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

const toggleStatus = async (id, currentStatus) => {
  const athleteRef = doc(db, "athletes", id)
  await updateDoc(athleteRef, { isActive: !currentStatus })
}

// Run fetch when component loads
onMounted(() => fetchAthletes())

// Re-run fetch whenever the "showInactive" toggle changes
watch(showInactive, () => fetchAthletes())
</script>
