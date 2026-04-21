<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 class="text-xs font-black uppercase tracking-widest text-chantilly">Management Tools</h3>
          <p class="text-[10px] text-gray-500 uppercase">BCC Lists & Data Export</p>
        </div>
        
        <div class="flex items-center gap-3">
          <input type="file" ref="fileInput" class="hidden" accept=".csv" @change="processCSV" />
          <button @click="$refs.fileInput.click()" class="btn-secondary">📥 Import CSV</button>
          <button @click="exportRoster" class="btn-secondary">📤 Full Export</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <button @click="copyDistributionList('athletes')" class="btn-tool">Athletes Only</button>
        <button @click="copyDistributionList('parents')" class="btn-tool">Parents Only</button>
        <button @click="copyDistributionList('all')" class="btn-tool-purple">Entire Team + Parents</button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-chantilly/20 overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        
        <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
          <button v-for="s in ['Outdoor', 'Indoor', 'XC', 'All']" :key="s"
                  @click="activeSeasonFilter = s"
                  :class="activeSeasonFilter === s ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                  class="px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all">
            {{ s }}
          </button>
        </div>

        <div class="flex items-center gap-4">
          <select v-model="activeGroupFilter" class="bg-transparent text-[10px] font-bold uppercase tracking-wider border-b-2 border-gray-200 dark:border-gray-700 focus:border-chantilly outline-none py-1">
            <option value="All">All Groups</option>
            <option value="Sprints">Sprints</option>
            <option value="Distance">Distance</option>
            <option value="Throwers">Throwers</option>
            <option value="General">General</option>
          </select>

          <button @click="showArchived = !showArchived" 
                  class="text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-lg border transition"
                  :class="showArchived ? 'bg-red-500 text-white border-red-500' : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'">
            {{ showArchived ? 'Showing All' : 'Active Only' }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 dark:bg-black/20 text-gray-400 text-[10px] uppercase tracking-widest">
            <tr>
              <th class="p-4 cursor-pointer hover:text-chantilly" @click="toggleSort('firstName')">
                First Name {{ sortKey === 'firstName' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="p-4 cursor-pointer hover:text-chantilly" @click="toggleSort('lastName')">
                Last Name {{ sortKey === 'lastName' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="p-4">Grade/Group/Seasons</th>
              <th class="p-4">Contact Info</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="athlete in sortedAthletes" :key="athlete.id" 
                class="hover:bg-gray-50 dark:hover:bg-white/5 transition border-l-4" 
                :class="athlete.isActive ? 'border-l-green-500' : 'border-l-gray-500 opacity-60'">
              
              <td class="p-4 font-bold text-gray-900 dark:text-white">{{ athlete.firstName }}</td>
              <td class="p-4 font-bold text-gray-900 dark:text-white">{{ athlete.lastName }}</td>
              
              <td class="p-4 space-y-1">
                <div class="text-xs font-medium">{{ athlete.currentGrade }} — <span class="text-chantilly font-bold">{{ athlete.group }}</span></div>
                <div class="flex gap-1">
                  <span v-if="athlete.seasons?.xc" class="season-badge bg-orange-100 text-orange-700">XC</span>
                  <span v-if="athlete.seasons?.indoor" class="season-badge bg-blue-100 text-blue-700">IN</span>
                  <span v-if="athlete.seasons?.outdoor" class="season-badge bg-green-100 text-green-700">OUT</span>
                </div>
              </td>

              <td class="p-4 text-[10px] leading-tight space-y-1">
                <div class="flex flex-col"><span class="text-gray-400 font-bold uppercase text-[8px]">Athlete:</span> {{ athlete.email || 'None' }}</div>
                <div v-if="athlete.parentEmail1" class="flex flex-col"><span class="text-gray-400 font-bold uppercase text-[8px]">G1:</span> {{ athlete.parentEmail1 }}</div>
                <div v-if="athlete.parentEmail2" class="flex flex-col"><span class="text-gray-400 font-bold uppercase text-[8px]">G2:</span> {{ athlete.parentEmail2 }}</div>
              </td>

              <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="toggleStatus(athlete)" 
                          class="px-2 py-1 text-[9px] font-black uppercase rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                    {{ athlete.isActive ? 'Archive' : 'Activate' }}
                  </button>
                  <button @click="deleteAthlete(athlete)" 
                          class="px-2 py-1 text-[9px] font-black uppercase rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition">
                    Delete
                  </button>
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
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'

const athletes = ref([])
const showArchived = ref(false)
const activeSeasonFilter = ref('Outdoor')
const activeGroupFilter = ref('All')
const sortKey = ref('lastName')
const sortOrder = ref('asc')

const filteredAthletes = computed(() => {
  return athletes.value.filter(a => {
    const statusMatch = showArchived.value || a.isActive;
    const groupMatch = activeGroupFilter.value === 'All' || a.group === activeGroupFilter.value;
    
    let seasonMatch = false;
    if (activeSeasonFilter.value === 'All') seasonMatch = true;
    else if (activeSeasonFilter.value === 'Outdoor') seasonMatch = a.seasons?.outdoor === true;
    else if (activeSeasonFilter.value === 'Indoor') seasonMatch = a.seasons?.indoor === true;
    else if (activeSeasonFilter.value === 'XC') seasonMatch = a.seasons?.xc === true;

    return statusMatch && seasonMatch && groupMatch;
  });
})

const sortedAthletes = computed(() => {
  return [...filteredAthletes.value].sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });
})

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

onMounted(() => {
  onSnapshot(query(collection(db, "athletes")), (snap) => {
    athletes.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const toggleStatus = async (a) => await updateDoc(doc(db, "athletes", a.id), { isActive: !a.isActive })
const deleteAthlete = async (a) => { if (confirm(`Delete ${a.firstName}?`)) await deleteDoc(doc(db, "athletes", a.id)) }
// ... keep processCSV and exportRoster from previous version ...
</script>

<style scoped>
.btn-tool { @apply px-3 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition rounded-lg text-[10px] font-bold uppercase tracking-widest; }
.btn-tool-purple { @apply px-3 py-3 bg-chantilly text-white shadow-lg shadow-chantilly/20 rounded-lg text-[10px] font-bold uppercase tracking-widest; }
.btn-secondary { @apply px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400; }
.season-badge { @apply text-[8px] font-black px-1.5 py-0.5 rounded uppercase; }
</style>
