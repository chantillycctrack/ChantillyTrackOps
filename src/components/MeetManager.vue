<template>
  <div class="space-y-6">
    <div v-if="selectedMeet" class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <button @click="selectedMeet = null" class="text-chantilly font-bold text-xs uppercase flex items-center gap-2 hover:opacity-70 transition">
        <span>←</span> Back to Schedule
      </button>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <span class="text-[9px] font-black uppercase text-gray-400">Meet Limit:</span>
          <input v-model.number="meetEventLimit" type="number" class="w-10 bg-transparent text-xs font-bold focus:outline-none" />
        </div>

        <div class="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
          <button @click="viewMode = 'event'" :class="viewMode === 'event' ? 'bg-white dark:bg-gray-800 shadow-sm text-chantilly' : 'text-gray-400'" class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all">By Event</button>
          <button @click="viewMode = 'athlete'" :class="viewMode === 'athlete' ? 'bg-white dark:bg-gray-800 shadow-sm text-chantilly' : 'text-gray-400'" class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all">By Athlete</button>
        </div>
      </div>
    </div>

    <div v-if="!selectedMeet" class="space-y-6">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-chantilly/20">
        <h3 class="text-lg font-bold mb-4 uppercase tracking-wider">Schedule New Meet</h3>
        <form @submit.prevent="addMeet" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input v-model="newMeet.name" type="text" placeholder="Meet Name" class="input-field col-span-1 md:col-span-2" required />
          <input v-model="newMeet.date" type="date" class="input-field" required />
          <select v-model="newMeet.season" class="input-field" required>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
          </select>
          <button type="submit" class="bg-chantilly text-white font-bold rounded-lg px-4 py-3 hover:opacity-90 transition md:col-span-4 uppercase text-xs tracking-widest">
            Add Meet to Calendar
          </button>
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
              <td class="p-4"><button @click="loadLineup(meet)" class="font-bold hover:text-chantilly transition">{{ meet.name }}</button></td>
              <td class="p-4 text-right"><button @click="deleteMeet(meet)" class="text-red-500 p-2">🗑️</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="space-y-8">
      <div class="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-chantilly/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 class="text-2xl font-black uppercase text-chantilly">{{ selectedMeet.name }}</h2>
          <p class="text-xs text-gray-500 uppercase tracking-widest">{{ activeGender }} Lineup Builder</p>
        </div>
        <div class="flex gap-2">
          <select v-model="filterGroup" class="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold uppercase p-2 rounded-lg border-none focus:ring-1 focus:ring-chantilly">
            <option value="All">All Groups</option>
            <option value="Sprints">Sprints</option>
            <option value="Distance">Distance</option>
            <option value="Throwers">Throwers</option>
          </select>
          <div class="flex gap-1 bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
            <button v-for="g in ['Mens', 'Womens']" :key="g" @click="activeGender = g"
                    :class="activeGender === g ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                    class="px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all">
              {{ g }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'event'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="event in getEventsForSeason(selectedMeet.season)" :key="event" 
             class="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-black text-sm uppercase tracking-tight">{{ event }}</h4>
            <button @click="openSelector(event)" 
                    :disabled="getEntriesForEvent(event).length >= meetEventLimit"
                    class="text-[10px] font-bold text-white bg-chantilly px-3 py-1.5 rounded-lg uppercase disabled:bg-gray-300 disabled:cursor-not-allowed transition">
              {{ getEntriesForEvent(event).length >= meetEventLimit ? 'FULL' : '+ ADD' }}
            </button>
          </div>

          <div class="space-y-1">
            <div v-for="entry in getEntriesForEvent(event)" :key="entry.id" class="flex justify-between items-center text-xs p-2.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800">
              <span class="font-bold">{{ entry.athleteName }}</span>
              <button @click="removeEntry(entry.id)" class="text-red-400 hover:text-red-600 transition font-black">✕</button>
            </div>
            <div v-if="getEntriesForEvent(event).length === 0" class="text-[10px] text-gray-400 italic py-2">No entries assigned.</div>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'athlete'" class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-x-auto border border-gray-200 dark:border-gray-800">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-black/20 text-[9px] uppercase tracking-tighter text-gray-400">
              <th class="p-4 sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-800">Athlete / Group</th>
              <th class="p-4 text-center border-r border-gray-200 dark:border-gray-800">Limit (R/F)</th>
              <th v-for="event in getEventsForSeason(selectedMeet.season)" :key="event" class="p-2 text-center whitespace-nowrap min-w-[70px]">
                {{ event.replace(' Relay', '') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="athlete in filteredAthletes" :key="athlete.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition">
              <td class="p-4 sticky left-0 bg-white dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-800 shadow-md">
                <div class="font-bold text-xs truncate max-w-[120px]">{{ athlete.firstName }} {{ athlete.lastName }}</div>
                <div class="text-[9px] text-chantilly font-bold uppercase">{{ athlete.group }}</div>
              </td>
              <td class="p-4 text-center border-r border-gray-200 dark:border-gray-800">
                <div class="flex gap-1 justify-center">
                  <span :class="getRunningCount(athlete.id) > 3 ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'" class="text-[9px] px-1.5 py-0.5 rounded font-black">R:{{ getRunningCount(athlete.id) }}</span>
                  <span :class="getFieldCount(athlete.id) > 3 ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'" class="text-[9px] px-1.5 py-0.5 rounded font-black">F:{{ getFieldCount(athlete.id) }}</span>
                </div>
              </td>
              <td v-for="event in getEventsForSeason(selectedMeet.season)" :key="event" class="p-2 text-center">
                <input v-if="!event.includes('Relay')" 
                       type="checkbox" 
                       :checked="isAthleteInEvent(athlete.id, event)" 
                       :disabled="!isAthleteInEvent(athlete.id, event) && isBlocked(athlete, event)"
                       @change="toggleEntry(athlete, event)"
                       :title="getBlockReason(athlete, event)"
                       class="w-4 h-4 rounded border-gray-300 text-chantilly focus:ring-chantilly disabled:opacity-10 disabled:cursor-not-allowed">
                <span v-else-if="isAthleteInEvent(athlete.id, event)" class="text-[9px] text-chantilly font-black">RELAY</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showSelector" class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div class="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-6 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 class="font-black uppercase text-xs tracking-widest text-chantilly">Add to {{ activeEvent }}</h3>
            <p class="text-[10px] text-gray-400 uppercase">Filtered by Group: {{ filterGroup }}</p>
          </div>
          <button @click="showSelector = false" class="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>
        <div class="p-4 max-h-[400px] overflow-y-auto space-y-2">
          <div v-for="athlete in filteredAthletes" :key="athlete.id" 
               @click="!isBlocked(athlete, activeEvent) && addEntry(athlete)"
               :class="isBlocked(athlete, activeEvent) ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:border-chantilly cursor-pointer'"
               class="p-3 border border-gray-100 dark:border-gray-800 rounded-xl transition flex justify-between items-center group bg-white dark:bg-gray-900">
            <div>
              <div class="font-bold text-sm">{{ athlete.firstName }} {{ athlete.lastName }}</div>
              <div class="text-[9px] font-black text-gray-400 uppercase">R: {{ getRunningCount(athlete.id) }} | F: {{ getFieldCount(athlete.id) }}</div>
            </div>
            <div v-if="isBlocked(athlete, activeEvent)" class="text-[8px] font-black text-red-500 uppercase">{{ getBlockReason(athlete, activeEvent) }}</div>
            <div v-else class="text-[10px] font-black text-chantilly opacity-0 group-hover:opacity-100">SELECT +</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'

// DATA STATE
const meets = ref([])
const athletes = ref([])
const entries = ref([])
const selectedMeet = ref(null)

// UI STATE
const viewMode = ref('event')
const activeGender = ref('Mens')
const filterGroup = ref('All')
const meetEventLimit = ref(3)
const showSelector = ref(false)
const activeEvent = ref('')
const newMeet = ref({ name: '', date: '', season: 'Winter' })

const templates = {
  Winter: ["4x800m Relay", "55m Dash", "55m Hurdles", "1600m Run", "4x200m Relay", "500m Dash", "1000m Run", "300m Dash", "3200m Run", "4x400m Relay", "Shot Put", "Long Jump", "Triple Jump", "High Jump", "Pole Vault"],
  Spring: ["4x800m Relay", "100m Dash", "100 / 110m Hurdles", "1600m Run", "4x100m Relay", "400m Dash", "800m Run", "200m Dash", "3200m Run", "4x400m Relay", "Shot Put", "Discus", "Long Jump", "Triple Jump", "High Jump", "Pole Vault"]
}

// HELPERS
const getEventType = (name) => ["Shot Put", "Discus", "Long Jump", "Triple Jump", "High Jump", "Pole Vault"].includes(name) ? 'field' : 'running'
const getEventsForSeason = (season) => templates[season] || []
const getEntriesForEvent = (ev) => entries.value.filter(e => e.event === ev && e.gender === activeGender.value)
const isAthleteInEvent = (id, ev) => entries.value.some(e => e.athleteId === id && e.event === ev)
const getRunningCount = (id) => entries.value.filter(e => e.athleteId === id && getEventType(e.event) === 'running').length
const getFieldCount = (id) => entries.value.filter(e => e.athleteId === id && getEventType(e.event) === 'field').length

// BLOCKING LOGIC
const isBlocked = (athlete, ev) => getBlockReason(athlete, ev) !== null
const getBlockReason = (athlete, ev) => {
  if (isAthleteInEvent(athlete.id, ev)) return null
  if (getEntriesForEvent(ev).length >= meetEventLimit.value) return "Event Full"
  const type = getEventType(ev)
  if (type === 'running' && getRunningCount(athlete.id) >= 3) return "3/3 Running"
  if (type === 'field' && getFieldCount(athlete.id) >= 3) return "3/3 Field"
  return null
}

const filteredAthletes = computed(() => {
  return athletes.value.filter(a => (filterGroup.value === 'All' || a.group === filterGroup.value) && a.isActive)
})

// FIREBASE ACTIONS
onMounted(() => {
  onSnapshot(query(collection(db, "meets"), orderBy("date", "asc")), (snap) => {
    meets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
  onSnapshot(collection(db, "athletes"), (snap) => {
    athletes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const loadLineup = (meet) => {
  selectedMeet.value = meet
  onSnapshot(collection(db, `meets/${meet.id}/entries`), (snap) => {
    entries.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
}

const openSelector = (ev) => { activeEvent.value = ev; showSelector.value = true }

const addEntry = async (athlete) => {
  await addDoc(collection(db, `meets/${selectedMeet.value.id}/entries`), {
    athleteId: athlete.id, athleteName: `${athlete.firstName} ${athlete.lastName}`,
    event: activeEvent.value, gender: activeGender.value
  })
  showSelector.value = false
}

const toggleEntry = async (athlete, event) => {
  const existing = entries.value.find(e => e.athleteId === athlete.id && e.event === event)
  if (existing) await deleteDoc(doc(db, `meets/${selectedMeet.value.id}/entries`, existing.id))
  else await addEntry(athlete)
}

const removeEntry = async (id) => await deleteDoc(doc(db, `meets/${selectedMeet.value.id}/entries`, id))
const addMeet = async () => { await addDoc(collection(db, "meets"), { ...newMeet.value }); newMeet.value = { name: '', date: '', season: 'Winter' } }
const deleteMeet = async (m) => { if(confirm('Delete Meet?')) await deleteDoc(doc(db, "meets", m.id)) }
</script>
