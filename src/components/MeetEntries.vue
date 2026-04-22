<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
          Meet <span class="text-chantilly">Entries</span>
        </h2>
        <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Roster Selection & Performance Seeding</p>
      </div>

      <div class="w-full md:w-80 space-y-2">
        <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Upcoming Meets Only</label>
        <select v-model="selectedMeetId" class="input-field-comm !py-3 !bg-white dark:!bg-gray-900 shadow-xl border-2 border-chantilly/20 focus:border-chantilly">
          <option value="" disabled>Select a Meet...</option>
          <option v-for="meet in upcomingMeets" :key="meet.id" :value="meet.id">
            {{ meet.name }} — {{ formatDateShort(meet.date) }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedMeet" class="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div class="md:col-span-4 space-y-4">
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex justify-between items-center">
            <h3 class="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              {{ viewMode === 'event' ? 'Events' : 'Athletes' }}
            </h3>
            <div class="flex bg-gray-100 dark:bg-black/40 p-1 rounded-lg scale-90">
              <button @click="viewMode = 'event'" :class="viewMode === 'event' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-500'" class="px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all">Event</button>
              <button @click="viewMode = 'athlete'" :class="viewMode === 'athlete' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-500'" class="px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all">Ath</button>
            </div>
          </div>

          <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
            <div v-if="viewMode === 'event'">
              <button v-for="event in selectedMeet.events" :key="event.name"
                      @click="activeSelection = event.name"
                      :class="activeSelection === event.name ? 'border-l-4 border-chantilly bg-chantilly/5 text-chantilly' : 'text-gray-500 dark:text-gray-400'"
                      class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
                <span class="text-xs font-bold">{{ event.name }}</span>
                <span class="text-[9px] font-black opacity-50">{{ getEntryCount(event.name) }}/{{ event.limit || '∞' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-8">
        <div v-if="activeSelection" class="bg-white dark:bg-gray-900 p-0 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[500px]">
          <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-black/10">
            <div>
              <h2 class="text-xl font-black uppercase text-gray-900 dark:text-white leading-none">{{ activeSelection }}</h2>
              <p class="text-[10px] text-chantilly font-bold uppercase tracking-widest mt-1">Seeding by {{ perfToggle === 'SB' ? 'Season Best' : 'Personal Record' }}</p>
            </div>
            <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
              <button @click="perfToggle = 'SB'" :class="perfToggle === 'SB' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'" class="px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all">SB</button>
              <button @click="perfToggle = 'PR'" :class="perfToggle === 'PR' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'" class="px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all">PR</button>
            </div>
          </div>

          <div class="p-4">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[9px] uppercase font-black text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th class="px-4 pb-3">Athlete</th>
                  <th class="px-4 pb-3">Group</th>
                  <th class="px-4 pb-3 text-center">Best Mark</th>
                  <th class="px-4 pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="athlete in filteredRoster" :key="athlete.id" class="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td class="px-4 py-4">
                    <div class="font-bold text-sm text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</div>
                    <div class="text-[9px] text-gray-400 uppercase font-black">{{ athlete.currentGrade }}</div>
                  </td>
                  <td class="px-4 py-4 text-[10px] uppercase font-black text-gray-400">{{ athlete.group }}</td>
                  <td class="px-4 py-4 text-center font-mono text-xs text-chantilly font-bold">
                    {{ getPerformanceMark(athlete, activeSelection) }}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <button @click="toggleEntry(athlete, activeSelection)"
                            :class="isEntered(athlete.id, activeSelection) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-chantilly hover:text-chantilly hover:bg-chantilly/5'"
                            class="px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all transform active:scale-95">
                      {{ isEntered(athlete.id, activeSelection) ? '✓ Entered' : '+ Entry' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 border-dashed">
          <div class="w-16 h-16 bg-chantilly/10 rounded-full flex items-center justify-center mb-4">
             <span class="text-2xl">⚡</span>
          </div>
          <p class="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">Select an event to start entries</p>
        </div>
      </div>
    </div>

    <div v-if="upcomingMeets.length === 0" class="bg-white dark:bg-gray-900 p-20 rounded-2xl shadow-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
       <p class="text-gray-400 font-black uppercase tracking-widest">No Upcoming Meets Found</p>
       <p class="text-xs text-gray-500 mt-2">Schedule a future date in the Meet Management tab.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '../firebaseConfig'
import { collection, onSnapshot, query, orderBy, where, addDoc, deleteDoc, doc } from 'firebase/firestore'

const meets = ref([])
const athletes = ref([])
const meetEntries = ref([])
const selectedMeetId = ref('')
const viewMode = ref('event') 
const activeSelection = ref(null)
const perfToggle = ref('SB') 

// SMART FILTERING: Only shows meets from Today onwards, sorted by closest first
const upcomingMeets = computed(() => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return meets.value
    .filter(m => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
})

const selectedMeet = computed(() => meets.value.find(m => m.id === selectedMeetId.value))
const activeRoster = computed(() => athletes.value.filter(a => a.isActive))

const filteredRoster = computed(() => {
  if (!activeSelection.value) return []
  const eventName = activeSelection.value.toLowerCase()
  return activeRoster.value.filter(a => {
    const isFemaleEvent = eventName.includes('girls') || eventName.includes('female')
    const isMaleEvent = eventName.includes('boys') || eventName.includes('male')
    if (isFemaleEvent) return a.gender?.toLowerCase().startsWith('f')
    if (isMaleEvent) return a.gender?.toLowerCase().startsWith('m')
    return true 
  })
})

onMounted(() => {
  onSnapshot(query(collection(db, "meets"), orderBy("date", "asc")), (snap) => {
    meets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    // Auto-select the closest upcoming meet
    if (upcomingMeets.value.length > 0 && !selectedMeetId.value) {
      selectedMeetId.value = upcomingMeets.value[0].id
    }
  })
  onSnapshot(collection(db, "athletes"), (snap) => {
    athletes.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

watch(selectedMeetId, (newId) => {
  if (!newId) return
  onSnapshot(query(collection(db, "meet_entries"), where("meetId", "==", newId)), (snap) => {
    meetEntries.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const isEntered = (athleteId, eventName) => meetEntries.value.some(e => e.athleteId === athleteId && e.eventName === eventName)
const getEntryCount = (eventName) => meetEntries.value.filter(e => e.eventName === eventName).length

const toggleEntry = async (athlete, eventName) => {
  const existing = meetEntries.value.find(e => e.athleteId === athlete.id && e.eventName === eventName)
  if (existing) {
    await deleteDoc(doc(db, "meet_entries", existing.id))
  } else {
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
  const match = athlete.performances.find(p => p.event === eventName)
  return match ? match.mark : 'No Mark'
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}`
}
</script>

<style scoped>
.input-field-comm {
  @apply w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-chantilly transition text-gray-900 dark:text-white;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-200 dark:bg-gray-800 rounded-full; }
</style>
