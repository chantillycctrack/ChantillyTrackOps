<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="text-center md:text-left">
      <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
        Meet <span class="text-chantilly">Management</span>
      </h2>
      <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Schedule & Event Setup</p>
    </div>

    <div v-if="!editingMeet" class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-3">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Select Season</label>
          <div class="grid grid-cols-3 gap-2 mt-2">
            <button v-for="s in ['Fall (XC)', 'Winter (Indoor)', 'Spring (Outdoor)']" :key="s"
                    @click="newMeet.season = s" type="button"
                    :class="newMeet.season === s ? 'bg-chantilly text-white border-chantilly' : 'bg-gray-50 dark:bg-black/20 text-gray-400 border-gray-200 dark:border-gray-700'"
                    class="py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all">
              {{ s }}
            </button>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Meet Name</label>
          <input v-model="newMeet.name" type="text" placeholder="e.g. Liberty Premier" class="input-field-comm" required />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em] ml-1">Date</label>
          <input v-model="newMeet.date" type="date" class="input-field-comm" required />
        </div>
      </div>
      <button @click="createMeet" :disabled="!newMeet.season || !newMeet.name || !newMeet.date" class="btn-purple-comm py-4">
        Add Meet (Unlimited Entries)
      </button>
    </div>

    <div v-if="editingMeet" class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border-2 border-chantilly space-y-6 animate-in fade-in zoom-in duration-200">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 class="font-black uppercase text-lg text-gray-900 dark:text-white">
            Edit Events: <span class="text-chantilly">{{ editingMeet.name }}</span>
          </h3>
          <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Set Limits & Custom Events</p>
        </div>
        <button @click="editingMeet = null" class="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition">
          Close Editor
        </button>
      </div>

      <div class="bg-chantilly/5 border border-chantilly/20 p-4 rounded-xl flex flex-wrap items-center gap-4">
        <span class="text-[10px] font-black uppercase text-chantilly tracking-widest">Bulk Set Individual Limits:</span>
        <div class="flex gap-2">
          <button v-for="n in [1, 2, 3, 4]" :key="n" @click="bulkSetLimits(n)" 
                  class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold hover:bg-chantilly hover:text-white transition text-gray-600 dark:text-gray-300">
            {{ n }}
          </button>
          <button @click="bulkSetLimits(null)" 
                  class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-bold hover:bg-chantilly hover:text-white transition text-gray-600 dark:text-gray-300">
            Unlimited
          </button>
        </div>
        <p class="text-[9px] text-gray-400 italic ml-auto">*Relays (4x...) are excluded from bulk set</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <div v-for="(event, index) in editingMeet.events" :key="index" 
             class="flex items-center gap-2 bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          
          <input v-model="event.name" 
                 class="flex-1 bg-transparent border-none text-xs font-bold text-gray-900 dark:text-white focus:ring-0" />
          
          <div class="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3">
             <span class="text-[8px] font-black uppercase text-gray-400">{{ event.name.toLowerCase().includes('4x') ? 'Teams' : 'Limit' }}</span>
             <input v-model.number="event.limit" type="number" placeholder="∞" 
                    class="w-12 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-[10px] p-1 text-center text-gray-900 dark:text-white outline-none focus:border-chantilly transition" />
          </div>

          <button @click="editingMeet.events.splice(index, 1)" class="text-red-400 hover:text-red-600 px-2 text-xl font-light">×</button>
        </div>
        
        <button @click="editingMeet.events.push({name: 'New Event', limit: null})" 
                class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-3 text-[10px] font-black uppercase text-gray-400 hover:border-chantilly hover:text-chantilly transition">
          + Add Custom Event
        </button>
      </div>

      <button @click="saveEvents" class="btn-purple-comm py-4">Save Configuration</button>
    </div>

    <div v-if="!editingMeet" class="grid grid-cols-1 gap-4">
      <div v-for="meet in meets" :key="meet.id" 
           class="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="bg-chantilly/10 p-3 rounded-xl text-chantilly font-black text-center min-w-[70px]">
            <div class="text-[10px] uppercase">{{ formatDate(meet.date, 'month') }}</div>
            <div class="text-xl leading-none">{{ formatDate(meet.date, 'day') }}</div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[8px] font-black uppercase px-1.5 py-0.5 bg-chantilly text-white rounded">{{ meet.season }}</span>
              <h4 class="font-bold text-gray-900 dark:text-white text-lg">{{ meet.name }}</h4>
            </div>
            <div class="flex gap-4 mt-1">
               <span class="text-[9px] font-black uppercase text-gray-500">📍 {{ meet.location || 'TBD' }}</span>
               <span class="text-[9px] font-black uppercase text-chantilly">⚡ {{ meet.events?.length || 0 }} Events</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button @click="editingMeet = JSON.parse(JSON.stringify(meet))" class="px-4 py-2 text-[10px] font-black uppercase rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition text-gray-500 dark:text-gray-400">
            Edit Events
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
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore'

const meets = ref([])
const newMeet = ref({ name: '', date: '', season: '', location: '' })
const editingMeet = ref(null)

const defaultEvents = {
  'Fall (XC)': ['JV Girls 5k', 'JV Boys 5k', 'Varsity Girls 5k', 'Varsity Boys 5k'],
  'Winter (Indoor)': ['55m Dash', '300m Dash', '500m Dash', '1000m Run', '1600m Run', '3200m Run', '55m Hurdles', '4x200m Relay', '4x400m Relay', '4x800m Relay', 'High Jump', 'Long Jump', 'Triple Jump', 'Shot Put', 'Pole Vault'],
  'Spring (Outdoor)': ['100m Dash', '200m Dash', '400m Dash', '800m Run', '1600m Run', '3200m Run', '110m Hurdles', '300m Hurdles', '4x100m Relay', '4x400m Relay', '4x800m Relay', 'High Jump', 'Long Jump', 'Triple Jump', 'Shot Put', 'Discus', 'Pole Vault']
}

onMounted(() => {
  const q = query(collection(db, "meets"), orderBy("date", "desc"))
  onSnapshot(q, (snap) => {
    meets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

const bulkSetLimits = (val) => {
  if (!editingMeet.value) return
  editingMeet.value.events.forEach(ev => {
    // Exclude relays (names containing "4x")
    if (!ev.name.toLowerCase().includes('4x')) {
      ev.limit = val
    }
  })
}

const createMeet = async () => {
  const events = defaultEvents[newMeet.value.season].map(name => ({
    name: name,
    limit: null
  }))
  await addDoc(collection(db, "meets"), { ...newMeet.value, events, createdAt: new Date() })
  newMeet.value = { name: '', date: '', season: '', location: '' }
}

const saveEvents = async () => {
  const meetRef = doc(db, "meets", editingMeet.value.id)
  await updateDoc(meetRef, { events: editingMeet.value.events })
  editingMeet.value = null
}

const deleteMeet = async (id) => {
  if (confirm("Delete this meet?")) await deleteDoc(doc(db, "meets", id))
}

const formatDate = (dateStr, part) => {
  if (!dateStr) return '-'
  const [year, month, day] = dateStr.split('-')
  const date = new Date(year, month - 1, day)
  if (part === 'month') return date.toLocaleString('default', { month: 'short' })
  if (part === 'day') return day
  return date.toLocaleDateString()
}
</script>

<style scoped>
.input-field-comm {
  @apply w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-chantilly transition text-gray-900 dark:text-white;
}
.btn-purple-comm {
  @apply w-full bg-chantilly text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-chantilly/20 hover:scale-[1.02] active:scale-[0.98] transition-all;
}
/* Style the browser's date picker icon */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  cursor: pointer;
}
input[type="date"] {
  color-scheme: dark;
}
/* Scrollbar styling for the event list */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-gray-200 dark:bg-gray-800 rounded-full;
}
</style>
