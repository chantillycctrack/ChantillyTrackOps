<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
          Athlete <span class="text-chantilly">Roster</span>
        </h2>
        <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Data Management & Team Structure</p>
      </div>

      <div class="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 px-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div class="flex flex-col border-r border-gray-100 dark:border-gray-800 pr-4">
          <label class="text-[8px] font-black uppercase text-chantilly ml-1">Manual Toggle</label>
          <button @click="toggleRegistration" 
                  :class="regSettings.isOpen ? 'text-green-500' : 'text-red-500'"
                  class="text-[10px] font-black uppercase transition-colors">
            {{ regSettings.isOpen ? '● Open' : '● Closed' }}
          </button>
        </div>
        <div class="flex flex-col">
          <label class="text-[8px] font-black uppercase text-gray-400 ml-1">Auto-Close Date</label>
          <input type="date" v-model="regSettings.closingDate" @change="updateRegSettings"
                 class="bg-transparent text-[10px] font-bold outline-none border-none text-gray-600 dark:text-gray-300 cursor-pointer" />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <input type="file" ref="fileInput" class="hidden" accept=".csv" @change="processCSV" />
        <button @click="$refs.fileInput.click()" class="btn-secondary">Import CSV</button>
        <button @click="exportRoster" class="btn-secondary text-chantilly border-chantilly/30">Export View</button>
        
        <button @click="showArchived = !showArchived" 
                class="text-[10px] uppercase tracking-widest font-black px-4 py-2.5 rounded-xl border transition"
                :class="showArchived ? 'bg-red-500 text-white border-red-500' : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'">
          {{ showArchived ? 'Showing All' : 'Active Only' }}
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl w-full md:w-auto">
          <button v-for="g in ['All', 'Sprints', 'Distance', 'Throwers', 'Unassigned']" :key="g"
                  @click="activeGroupFilter = g"
                  :class="activeGroupFilter === g ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                  class="flex-1 md:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all">
            {{ g }}
          </button>
        </div>
        <div class="w-full md:w-80 relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="Search by name..." 
                 class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-10 py-2.5 text-xs focus:ring-2 focus:ring-chantilly outline-none text-gray-900 dark:text-white" />
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 dark:bg-black/20 text-gray-400 text-[10px] uppercase tracking-[0.15em] font-black">
            <tr>
              <th class="p-5 cursor-pointer hover:text-chantilly transition" @click="toggleSort('firstName')">
                First {{ sortKey === 'firstName' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="p-5 cursor-pointer hover:text-chantilly transition" @click="toggleSort('lastName')">
                Last {{ sortKey === 'lastName' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="p-5">Gender</th>
              <th class="p-5">Grade</th>
              <th class="p-5">Group</th>
              <th class="p-5">Contact Info</th>
              <th class="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="athlete in sortedAthletes" :key="athlete.id" 
                class="hover:bg-gray-50 dark:hover:bg-white/5 transition border-l-4" 
                :class="athlete.isActive ? 'border-l-green-500' : 'border-l-gray-500 opacity-60'">
              <td class="p-5 font-bold text-gray-900 dark:text-white">{{ athlete.firstName }}</td>
              <td class="p-5 font-bold text-gray-900 dark:text-white">{{ athlete.lastName }}</td>
              <td class="p-5 text-xs text-gray-500">{{ athlete.gender }}</td>
              <td class="p-5 text-xs text-gray-500">{{ athlete.currentGrade }}</td>
              <td class="p-5">
                <span class="text-[10px] font-black uppercase px-2 py-1 rounded bg-chantilly/10 text-chantilly border border-chantilly/20">
                  {{ athlete.group }}
                </span>
              </td>
              <td class="p-5 text-[10px] leading-tight space-y-1">
                <div class="flex flex-col"><span class="text-gray-400 font-black uppercase text-[8px]">Athlete:</span> {{ athlete.email || '-' }}</div>
                <div v-if="athlete.parentEmail1" class="flex flex-col"><span class="text-gray-400 font-black uppercase text-[8px]">G1:</span> {{ athlete.parentEmail1 }}</div>
                <div v-if="athlete.parentEmail2" class="flex flex-col"><span class="text-gray-400 font-black uppercase text-[8px]">G2:</span> {{ athlete.parentEmail2 }}</div>
              </td>
              <td class="p-5 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="toggleStatus(athlete)" class="action-btn">
                    {{ athlete.isActive ? 'Archive' : 'Activate' }}
                  </button>
                  <button @click="deleteAthlete(athlete)" class="action-btn-red">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, writeBatch, setDoc } from 'firebase/firestore'

// Registration State
const regSettings = ref({ isOpen: true, closingDate: '' })

const athletes = ref([])
const showArchived = ref(false)
const activeGroupFilter = ref('All')
const searchQuery = ref('')
const sortKey = ref('lastName')
const sortOrder = ref('asc')
const fileInput = ref(null)

const gradeSortMap = { 'Freshman': 1, 'Sophomore': 2, 'Junior': 3, 'Senior': 4 }

onMounted(() => {
  // Sync Registration Settings
  onSnapshot(doc(db, "settings", "registration"), (snap) => {
    if (snap.exists()) regSettings.value = snap.docs ? snap.data() : { ...snap.data() }
  })

  onSnapshot(query(collection(db, "athletes")), (snap) => {
    const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    athletes.value = fetched
  })
})

const toggleRegistration = async () => {
  const statusRef = doc(db, "settings", "registration")
  await setDoc(statusRef, { 
    ...regSettings.value,
    isOpen: !regSettings.value.isOpen 
  }, { merge: true })
}

const updateRegSettings = async () => {
  await setDoc(doc(db, "settings", "registration"), regSettings.value, { merge: true })
}

// ... Computed Filtered/Sorted logic remains the same ...
const filteredAthletes = computed(() => {
  return athletes.value.filter(a => {
    const statusMatch = showArchived.value || a.isActive;
    const groupMatch = activeGroupFilter.value === 'All' || a.group === activeGroupFilter.value;
    const searchMatch = (a.firstName + ' ' + a.lastName).toLowerCase().includes(searchQuery.value.toLowerCase());
    return statusMatch && groupMatch && searchMatch;
  });
})

const sortedAthletes = computed(() => {
  return [...filteredAthletes.value].sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    let valA, valB;
    if (sortKey.value === 'currentGrade') {
      valA = gradeSortMap[a.currentGrade] || 0;
      valB = gradeSortMap[b.currentGrade] || 0;
    } else {
      valA = a[sortKey.value]?.toString().toLowerCase() || '';
      valB = b[sortKey.value]?.toString().toLowerCase() || '';
    }
    if (valA < valB) return -1 * modifier;
    if (valA > valB) return 1 * modifier;
    return 0;
  });
})

const exportRoster = () => {
  const headers = ['First Name', 'Last Name', 'Gender', 'Graduation Year', 'Group', 'Athlete Email', 'Guardian 1 Email', 'Guardian 2 Email']
  const rows = sortedAthletes.value.map(a => [
    a.firstName, 
    a.lastName, 
    a.gender, 
    a.gradYear, 
    a.group, 
    a.email || '', 
    a.parentEmail1 || '', 
    a.parentEmail2 || ''
  ])
  const csvContent = [headers, ...rows].map(e => e.map(field => `"${field}"`).join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  link.setAttribute("href", URL.createObjectURL(blob))
  link.setAttribute("download", `Team_Roster_${new Date().toLocaleDateString()}.csv`)
  link.click()
}

const toggleStatus = async (a) => await updateDoc(doc(db, "athletes", a.id), { isActive: !a.isActive })
const deleteAthlete = async (a) => { if (confirm(`Delete ${a.firstName}?`)) await deleteDoc(doc(db, "athletes", a.id)) }
</script>
