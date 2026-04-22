<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="w-full md:w-1/3 space-y-2">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-widest ml-1">Select Meet</label>
          <select v-model="selectedMeetId" class="input-field-comm">
            <option value="" disabled>Choose a meet...</option>
            <option v-for="meet in meets" :key="meet.id" :value="meet.id">
              {{ meet.name }} ({{ formatDate(meet.date) }})
            </option>
          </select>
        </div>

        <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
          <button @click="viewMode = 'event'; activeSelection = null"
                  :class="viewMode === 'event' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                  class="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all">
            By Event
          </button>
          <button @click="viewMode = 'athlete'; activeSelection = null"
                  :class="viewMode === 'athlete' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                  class="px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all">
            By Athlete
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedMeet" class="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      <div class="md:col-span-4 space-y-4">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
            <h3 class="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              {{ viewMode === 'event' ? 'Meet Events' : 'Active Roster' }}
            </h3>
          </div>
          <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
            <div v-if="viewMode === 'event'">
              <button v-for="event in selectedMeet.events" :key="event.name"
                      @click="activeSelection = event.name"
                      :class="activeSelection === event.name ? 'border-l-4 border-chantilly bg-chantilly/5' : ''"
                      class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition flex justify-between items-center">
                <span class="text-xs font-bold text-gray-900 dark:text-white">{{ event.name }}</span>
                <div class="flex flex-col items-end">
                  <span class="text-[10px] font-black text-gray-400 uppercase">Lim: {{ event.limit || '∞' }}</span>
                  <span class="text-[8px] font-bold text-chantilly">Ent: {{ getEntryCount(event.name) }}</span>
                </div>
              </button>
            </div>
            <div v-else>
              <button v-for="athlete in activeRoster" :key="athlete.id"
                      @click="activeSelection = athlete.id"
                      :class="activeSelection === athlete.id ? 'border-l-4 border-chantilly bg-chantilly/5' : ''"
                      class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</span>
                  <span class="text-[8px] font-black text-gray-400 uppercase">{{ athlete.group }}</span>
                </div>
                <span class="text-[9px] font-black text-chantilly px-2 py-0.5 bg-chantilly/10 rounded">{{ getAthleteEntryCount(athlete.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-8">
        <div v-if="activeSelection" class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 min-h-[400px]">
          <div class="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 class="text-xl font-black uppercase text-gray-900 dark:text-white">
              {{ viewMode === 'event' ? activeSelection : getAthleteName(activeSelection) }}
            </h2>
            <div class="flex items-center gap-4">
              <span class="text-[9px] font-black uppercase text-gray-400 tracking-tighter">View Performance:</span>
              <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
                <button @click="perfToggle = 'SB'" :class="perfToggle === 'SB' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'" class="px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all">SB</button>
                <button @click="perfToggle = 'PR'" :class="perfToggle === 'PR' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'" class="px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ml-1">PR</button>
              </div>
            </div>
          </div>

          <div v-if="viewMode === 'event'" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="text-[10px] uppercase tracking-widest text-gray-400 font-black">
                <tr>
                  <th class="pb-3">Athlete</th>
                  <th class="pb-3">Group</th>
                  <th class="pb-3 text-center">{{ perfToggle }} Mark</th>
                  <th class="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="athlete in filteredRoster" :key="athlete.id" class="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td class="py-4 font-bold text-sm text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</td>
                  <td class="py-4 text-[10px] uppercase font-black text-gray-400">{{ athlete.group }}</td>
                  <td class="py-4 text-center font-mono text-xs text-chantilly">
                    {{ getPerformanceMark(athlete, activeSelection) }}
                  </td>
                  <td class="py-4 text-right">
                    <button @click="toggleEntry(athlete, activeSelection)"
                            :class="isEntered(athlete.id, activeSelection) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-chantilly hover:text-chantilly'"
                            class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all">
                      {{ isEntered(athlete.id, activeSelection) ? 'Entered' : 'Add Entry' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div v-for="event in selectedMeet.events" :key="event.name" 
                  @click="toggleEntry(activeRoster.find(a => a.id === activeSelection), event.name)"
                  :class="isEntered(activeSelection, event.name) ? 'border-chantilly bg-chantilly/5' : 'border-gray-100 dark:border-gray-800'"
                  class="p-4 border-2 rounded-2xl cursor-pointer hover:border-chantilly transition-all group">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold" :class="isEntered(activeSelection, event.name) ? 'text-chantilly' : 'text-gray-500'">{{ event.name }}</span>
                  <div v-if="isEntered(activeSelection, event.name)" class="w-2 h-2 rounded-full bg-chantilly"></div>
                </div>
                <div class="mt-2 text-[10px] font-mono text-gray-400">
                  Mark: {{ getPerformanceMark(activeRoster.find(a => a.id === activeSelection), event.name) }}
                </div>
             </div>
          </div>

        </div>
        <div v-else class="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-black/10 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 min-h-[400px]">
          <span class="text-3xl mb-4 opacity-20">🏃‍♂️</span>
          <p class="text-gray-400 text-xs uppercase font-black tracking-widest">Select an {{ viewMode }} to start entries</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '../firebaseConfig'
import { collection, onSnapshot, query, orderBy, where, addDoc, deleteDoc, doc } from 'firebase/firestore'

// REFS
const meets = ref([])
const athletes = ref([])
const meetEntries = ref([])
const selectedMeetId = ref('')
const viewMode = ref('event') 
const activeSelection = ref(null)
const perfToggle = ref('SB') 

// COMPUTED
const selectedMeet = computed(() => meets.value.find(m => m.id === selectedMeetId.value))
const activeRoster = computed(() => athletes.value.filter(a => a.isActive))

const filteredRoster = computed(() => {
  if (!activeSelection.value || viewMode.value !== 'event') return []
  const eventName = activeSelection.value.toLowerCase()
  
  return activeRoster.value.filter(a => {
    const isFemaleEvent = eventName.includes('girls') || eventName.includes('female')
    const isMaleEvent = eventName.includes('boys') || eventName.includes('male')
    const isFemaleAthlete = a.gender?.toLowerCase().startsWith('f')
    const isMaleAthlete = a.gender?.toLowerCase().startsWith('m')

    if (isFemaleEvent) return isFemaleAthlete
    if (isMaleEvent) return isMaleAthlete
    return true 
  })
})

// ACTIONS
onMounted(() => {
  onSnapshot(query(collection(db, "meets"), orderBy("date", "desc")), (snap) => {
    meets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
  onSnapshot(collection(db, "athletes"), (snap) => {
    athletes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

watch(selectedMeetId, (newId) => {
  if (!newId) return
  const q = query(collection(db, "meet_entries"), where("meetId", "==", newId))
  onSnapshot(q, (snap) => {
    meetEntries.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
  activeSelection.value = null
})

const isEntered = (athleteId, eventName) => {
  return meetEntries.value.some(e => e.athleteId === athleteId && e.eventName === eventName)
}

const getEntryCount = (eventName) => meetEntries.value.filter(e => e.eventName === eventName).length
const getAthleteEntryCount = (athleteId) => meetEntries.value.filter(e => e.athleteId === athleteId).length

const toggleEntry = async (athlete, eventName) => {
  if (!athlete || !eventName) return
  const existing = meetEntries.value.find(e => e.athleteId === athlete.id && e.eventName === eventName)
  
  if (existing) {
    await deleteDoc(doc(db, "meet_entries", existing.id))
  } else {
    // Check Limit
    const eventLimit = selectedMeet.value.events.find(e => e.name === eventName)?.limit
    if (eventLimit && getEntryCount(eventName) >= eventLimit) {
      alert(`Entry Limit Reached! Limit is ${eventLimit}.`)
      return
    }

    await addDoc(collection(db, "meet_entries"), {
      meetId: selectedMeetId.value,
      athleteId: athlete.id,
      eventName: eventName,
      seedMark: getPerformanceMark(athlete, eventName),
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      createdAt: new Date()
    })
  }
}

const getPerformanceMark = (athlete, eventName) => {
  if (!athlete?.performances) return 'No Mark'
  // Logic looks for exact match or general distance match
  const match = athlete.performances.find(p => p.event === eventName)
  return match ? match.mark : 'No Mark'
}

const getAthleteName = (id) => {
  const a = athletes.value.find(ath => ath.id === id)
  return a ? `${a.firstName} ${a.lastName}` : 'Unknown'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}`
}
</script>

<style scoped>
.input-field-comm {
  @apply w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-chantilly transition text-gray-900 dark:text-white;
}
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-200 dark:bg-gray-800 rounded-full; }
</style>
