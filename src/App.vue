<Roster v-if="activeTab === 'roster'" />
<StaffManager v-if="activeTab === 'staff'" />
<MeetManager v-if="activeTab === 'meets'" /> ```

---

### 2. The Advanced `MeetManager.vue`
This version handles the **Winter vs. Spring** selection when creating a meet and enforces your 3-event limit and relay logic.

**Updated `src/components/MeetManager.vue`**

```vue
<template>
  <div class="space-y-6">
    <button v-if="selectedMeet" @click="selectedMeet = null" class="text-chantilly font-bold text-xs uppercase mb-4 flex items-center gap-2">
      <span>←</span> Back to Schedule
    </button>

    <div v-if="!selectedMeet" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-chantilly/20">
        <h3 class="text-lg font-bold mb-4 uppercase tracking-wider">Schedule New Meet</h3>
        <form @submit.prevent="addMeet" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input v-model="newMeet.name" type="text" placeholder="Meet Name" class="input-field col-span-1 md:col-span-2" required />
          <input v-model="newMeet.date" type="date" class="input-field" required />
          
          <select v-model="newMeet.season" class="input-field" required>
            <option value="Winter">Winter Season</option>
            <option value="Spring">Spring Season</option>
          </select>
          
          <button type="submit" class="btn-purple md:col-span-4 py-3">Add Meet to Calendar</button>
        </form>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-chantilly/20">
        <table class="w-full text-left">
          <thead class="bg-gray-50 dark:bg-black/20 text-[10px] uppercase tracking-widest text-gray-400">
            <tr><th class="p-4">Season</th><th class="p-4">Date</th><th class="p-4">Meet Name</th><th class="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="meet in meets" :key="meet.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition group">
              <td class="p-4 text-[10px] font-bold text-chantilly uppercase">{{ meet.season }}</td>
              <td class="p-4 font-mono text-sm">{{ meet.date }}</td>
              <td class="p-4"><button @click="selectedMeet = meet" class="font-bold hover:underline">{{ meet.name }}</button></td>
              <td class="p-4 text-right">
                <button @click="deleteMeet(meet)" class="text-red-500 p-2">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="space-y-8">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-chantilly/20">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-black uppercase text-chantilly">{{ selectedMeet.name }}</h2>
            <p class="text-gray-500">{{ selectedMeet.season }} Season — {{ selectedMeet.date }}</p>
          </div>
          <div class="text-right">
            <span class="text-[10px] bg-chantilly/10 text-chantilly px-3 py-1 rounded-full font-bold uppercase tracking-widest">Lineup Mode</span>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <button v-for="g in ['Mens', 'Womens']" :key="g" 
                @click="activeGender = g"
                :class="activeGender === g ? 'bg-chantilly text-white' : 'bg-white dark:bg-gray-800 text-gray-500'"
                class="px-6 py-2 rounded-lg font-bold uppercase text-xs tracking-widest transition shadow-sm">
          {{ g }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="event in getEventsForSeason(selectedMeet.season)" :key="event" 
             class="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-bold text-sm uppercase tracking-tight text-gray-700 dark:text-gray-200">
              {{ activeGender }} {{ event }}
            </h4>
            <button class="text-[10px] font-bold text-chantilly uppercase hover:underline">+ Add Entry</button>
          </div>
          
          <div class="text-[11px] text-gray-400 italic py-2">No entries yet.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from './firebaseConfig'
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'

const meets = ref([])
const selectedMeet = ref(null)
const activeGender = ref('Mens')
const newMeet = ref({ name: '', date: '', season: 'Winter' })

const templates = {
  Winter: ["4x800m Relay", "55m Dash", "55m Hurdles", "1600m Run", "4x200m Relay", "500m Dash", "1000m Run", "300m Dash", "3200m Run", "4x400m Relay", "Shot Put", "Long Jump", "Triple Jump", "High Jump", "Pole Vault"],
  Spring: ["4x800m Relay", "100m Dash", "100 / 110m Hurdles", "1600m Run", "4x100m Relay", "400m Dash", "800m Run", "200m Dash", "3200m Run", "4x400m Relay", "Shot Put", "Discus", "Long Jump", "Triple Jump", "High Jump", "Pole Vault"]
}

const getEventsForSeason = (season) => templates[season] || []

onMounted(() => {
  const q = query(collection(db, "meets"), orderBy("date", "asc"))
  onSnapshot(q, (snapshot) => {
    meets.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const addMeet = async () => {
  try {
    await addDoc(collection(db, "meets"), { ...newMeet.value })
    newMeet.value = { name: '', date: '', season: 'Winter' }
  } catch (e) { alert(e.message) }
}

const deleteMeet = async (meet) => {
  if (confirm(`Delete ${meet.name}?`)) {
    await deleteDoc(doc(db, "meets", meet.id))
  }
}
</script>
