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
        <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Select Active Meet</label>
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
          
          <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 space-y-3">
            <div class="flex justify-between items-center">
              <h3 class="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                {{ viewMode === 'event' ? 'Events' : 'Athletes' }}
              </h3>
              <div class="flex bg-gray-100 dark:bg-black/40 p-1 rounded-lg scale-90">
                <button @click="viewMode = 'event'; activeSelection = null" :class="viewMode === 'event' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-500'" class="px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all">Event</button>
                <button @click="viewMode = 'athlete'; activeSelection = null" :class="viewMode === 'athlete' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-500'" class="px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all">Athlete</button>
              </div>
            </div>

            <div v-if="viewMode === 'event'" class="flex bg-gray-100 dark:bg-black/40 p-1 rounded-xl">
              <button @click="eventGenderFilter = 'Women'" 
                      :class="eventGenderFilter === 'Women' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'" 
                      class="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all">Women</button>
              <button @click="eventGenderFilter = 'Men'" 
                      :class="eventGenderFilter === 'Men' ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'" 
                      class="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all">Men</button>
            </div>
          </div>

          <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
            <div v-if="viewMode === 'event'">
              <button v-for="event in filteredEvents" :key="event.name"
                      @click="activeSelection = event.name"
                      :class="activeSelection === event.name ? 'border-l-4 border-chantilly bg-chantilly/5 text-chantilly' : 'text-gray-500 dark:text-gray-400'"
                      class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
                <span class="text-xs font-bold">{{ cleanEventName(event.name) }}</span>
                <span class="text-[9px] font-black opacity-50">{{ getEntryCount(event.name) }}/{{ event.limit || '∞' }}</span>
              </button>
            </div>

            <div v-else>
              <button v-for="athlete in activeRoster" :key="athlete.id"
                      @click="activeSelection = athlete.id"
                      :class="activeSelection === athlete.id ? 'border-l-4 border-chantilly bg-chantilly/5 text-chantilly' : 'text-gray-500 dark:text-gray-400'"
                      class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
                <div class="flex flex-col">
                  <span class="text-xs font-bold">{{ athlete.firstName }} {{ athlete.lastName }}</span>
                  <span class="text-[8px] font-black uppercase opacity-50">{{ athlete.group }}</span>
                </div>
                <span class="text-[9px] font-black px-2 py-0.5 bg-chantilly/10 rounded">{{ getAthleteEntryCount(athlete.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="md:col-span-8">
        <div v-if="activeSelection" class="bg-white dark:bg-gray-900 p-0 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[500px]">
          
          <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-black/10">
            <div>
              <h2 class="text-xl font-black uppercase text-gray-900 dark:text-white leading-none">
                {{ viewMode === 'event' ? activeSelection : getAthleteName(activeSelection) }}
              </h2>
              <p class="text-[10px] text-chantilly font-bold uppercase tracking-widest mt-1">
                {{ viewMode === 'event' ? 'Manage Event Roster' : 'Manage Athlete Schedule' }}
              </p>
            </div>
          </div>

          <div v-if="viewMode === 'event'" class="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center gap-2">
            <span class="text-[9px] font-black uppercase text-gray-400 ml-1 mr-1">Filter Group:</span>
            <button v-for="g in ['All', 'Sprints', 'Distance', 'Throwers', 'Unassigned']" :key="g"
                    @click="activeGroupFilter = g"
                    :class="activeGroupFilter === g ? 'bg-chantilly text-white' : 'bg-gray-100 dark:bg-black/40 text-gray-500'"
                    class="px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all shadow-sm">
              {{ g }}
            </button>
          </div>

          <div v-if="viewMode === 'event'" class="p-4 overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[9px] uppercase font-black text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th class="px-4 pb-3">Athlete</th>
                  <th class="px-4 pb-3 text-center">Mark / Seed</th>
                  <th class="px-4 pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="athlete in filteredRoster" :key="athlete.id" class="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td class="px-4 py-4">
                    <div class="font-bold text-sm text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</div>
                    <div class="text-[9px] text-gray-400 uppercase font-black">{{ athlete.group }}</div>
                  </td>
                  
                  <td class="px-4 py-4 text-center">
                    <div v-if="isEntered(athlete.id, activeSelection)" class="font-mono text-xs text-chantilly font-bold">
                      {{ getEntryMark(athlete.id, activeSelection) }}
                    </div>
                    <div v-else>
                      <div v-if="getPerformanceMark(athlete, activeSelection) !== 'No Mark'" class="font-mono text-[10px] text-gray-400">
                        {{ getPerformanceMark(athlete, activeSelection) }} (PR)
                      </div>
                      <input v-else type="text" placeholder="Auto" v-model="manualSeeds[athlete.id + activeSelection]"
                             class="w-20 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded p-1 text-[10px] text-center font-mono focus:border-chantilly outline-none" />
                    </div>
                  </td>

                  <td class="px-4 py-4 text-right">
                    <button @click="toggleEntry(athlete, activeSelection)"
                            :class="isEntered(athlete.id, activeSelection) ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-chantilly text-white shadow-lg shadow-chantilly/20'"
                            class="px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all transform active:scale-95">
                      {{ isEntered(athlete.id, activeSelection) ? 'Remove' : '+ Add' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div v-for="event in filteredEventsForAthlete" :key="event.name" 
                  @click="toggleEntry(activeRoster.find(a => a.id === activeSelection), event.name)"
                  :class="isEntered(activeSelection, event.name) ? 'border-chantilly bg-chantilly/5' : 'border-gray-100 dark:border-gray-800'"
                  class="p-4 border-2 rounded-2xl cursor-pointer hover:border-chantilly transition-all group">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold" :class="isEntered(activeSelection, event.name) ? 'text-chantilly' : 'text-gray-500'">{{ cleanEventName(event.name) }}</span>
                  <div v-if="isEntered(activeSelection, event.name)" class="w-2 h-2 rounded-full bg-chantilly shadow-[0_0_8px_rgba(75,46,131,0.5)]"></div>
                </div>
                <div class="mt-1 font-mono text-[9px] text-gray-400">
                  {{ isEntered(activeSelection, event.name) ? getEntryMark(activeSelection, event.name) : 'No Seed' }}
                </div>
             </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 border-dashed min-h-[400px]">
          <div class="w-16 h-16 bg-chantilly/10 rounded-full flex items-center justify-center mb-4 text-2xl text-chantilly">⚡</div>
          <p class="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">Select an {{ viewMode }} to begin</p>
        </div>
      </div>
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
const eventGenderFilter = ref('Women') 
const activeGroupFilter = ref('All') 
const manualSeeds = ref({}) 

const upcomingMeets = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return meets.value
    .filter(m => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
})

const selectedMeet = computed(() => meets.value.find(m => m.id === selectedMeetId.value))
const activeRoster = computed(() => athletes.value.filter(a => a.isActive))

const filteredEvents = computed(() => {
  if (!selectedMeet.value) return []
  return selectedMeet.value.events.filter(e => e.name.startsWith(eventGenderFilter.value))
})

const filteredEventsForAthlete = computed(() => {
  if (!selectedMeet.value || !activeSelection.value || viewMode.value !== 'athlete') return []
  const athlete = activeRoster.value.find(a => a.id === activeSelection.value)
  if (!athlete) return []
  const isFemale = athlete.gender?.toLowerCase().startsWith('f')
  return selectedMeet.value.events.filter(e => 
    isFemale ? (e.name.startsWith("Women's") || e.name.startsWith("Girls")) 
             : (e.name.startsWith("Men's") || e.name.startsWith("Boys"))
  )
})

const filteredRoster = computed(() => {
  if (!activeSelection.value || viewMode.value !== 'event') return []
  const eventName = activeSelection.value
  const isWomenEvent = eventName.startsWith("Women's") || eventName.startsWith("Girls")
  return activeRoster.value.filter(a => {
    const isFemale = a.gender?.toLowerCase().startsWith('f')
    const genderMatch = isWomenEvent ? isFemale : !isFemale
    const groupMatch = activeGroupFilter.value === 'All' || a.group === activeGroupFilter.value
    return genderMatch && groupMatch
  }).sort((a, b) => a.lastName.localeCompare(b.lastName))
})

onMounted(() => {
  onSnapshot(query(collection(db, "meets"), orderBy("date", "asc")), (snap) => {
    meets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
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
  activeSelection.value = null
})

const isEntered = (athleteId, eventName) => {
  return meetEntries.value.some(e => e.athleteId === athleteId && e.eventName === eventName)
}

const getEntryMark = (athleteId, eventName) => {
  const entry = meetEntries.value.find(e => e.athleteId === athleteId && e.eventName === eventName)
  return entry ? entry.seedMark : ''
}

const getEntryCount = (eventName) => meetEntries.value.filter(e => e.eventName === eventName).length
const getAthleteEntryCount = (athleteId) => meetEntries.value.filter(e => e.athleteId === athleteId).length

// SMART ABBREVIATION LOGIC
const getNoMarkAbbreviation = (eventName) => {
  const name = eventName.toLowerCase()
  if (name.includes('jump') && !name.includes('high jump')) return 'ND' // Long/Triple
  if (name.includes('put') || name.includes('discus')) return 'ND' // Throws
  if (name.includes('high jump') || name.includes('vault')) return 'NH' // Vertical
  return 'NT' // Running
}

const toggleEntry = async (athlete, eventName) => {
  if (!athlete || !eventName) return
  const existing = meetEntries.value.find(e => e.athleteId === athlete.id && e.eventName === eventName)
  
  if (existing) {
    await deleteDoc(doc(db, "meet_entries", existing.id))
  } else {
    // Limit Check
    const eventLimit = selectedMeet.value.events.find(e => e.name === eventName)?.limit
    if (eventLimit && getEntryCount(eventName) >= eventLimit) {
      alert(`Entry Limit Reached! Limit is ${eventLimit}.`)
      return
    }

    // Determine Seed
    const perfMark = getPerformanceMark(athlete, eventName)
    let finalMark = perfMark !== 'No Mark' ? perfMark : (manualSeeds.value[athlete.id + eventName] || '')
    
    // Apply Auto-Abbreviation if still empty
    if (!finalMark || finalMark.trim() === '') {
      finalMark = getNoMarkAbbreviation(eventName)
    }

    await addDoc(collection(db, "meet_entries"), {
      meetId: selectedMeetId.value,
      athleteId: athlete.id,
      eventName: eventName,
      seedMark: finalMark,
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      createdAt: new Date()
    })
    
    // Clear manual seed after entry
    manualSeeds.value[athlete.id + eventName] = ''
  }
}

const getPerformanceMark = (athlete, eventName) => {
  if (!athlete?.performances) return 'No Mark'
  const match = athlete.performances.find(p => p.event === eventName)
  return match ? match.mark : 'No Mark'
}

const getAthleteName = (id) => {
  const a = athletes.value.find(ath => ath.id === id)
  return a ? `${a.firstName} ${a.lastName}` : 'Unknown'
}

const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

const cleanEventName = (name) => {
  return name.replace("Women's ", "").replace("Men's ", "").replace("Girls ", "").replace("Boys ", "")
}
</script>

<style scoped>
.input-field-comm {
  @apply w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-chantilly transition text-gray-900 dark:text-white;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-200 dark:bg-gray-800 rounded-full; }
</style>
