<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <input type="file" ref="fileInput" class="hidden" accept=".csv" @change="processCSV" />
          <button @click="$refs.fileInput.click()" class="btn-secondary">Import CSV</button>
          <button @click="exportRoster" class="btn-secondary">Full Export</button>
        </div>

        <div class="flex-1 max-w-sm w-full">
          <input v-model="searchQuery" type="text" placeholder="Search by name..." 
                 class="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-chantilly outline-none" />
        </div>

        <button @click="showArchived = !showArchived" 
                class="text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-lg border transition"
                :class="showArchived ? 'bg-red-500 text-white border-red-500' : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'">
          {{ showArchived ? 'Showing All' : 'Active Only' }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
          <button v-for="g in ['All', 'Sprints', 'Distance', 'Throwers', 'Unassigned']" :key="g"
                  @click="activeGroupFilter = g"
                  :class="activeGroupFilter === g ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                  class="px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all">
            {{ g }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-chantilly/20 overflow-hidden">
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
              <th class="p-4 cursor-pointer hover:text-chantilly" @click="toggleSort('gender')">
                Gender {{ sortKey === 'gender' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="p-4 cursor-pointer hover:text-chantilly" @click="toggleSort('currentGrade')">
                Grade {{ sortKey === 'currentGrade' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="p-4 cursor-pointer hover:text-chantilly" @click="toggleSort('group')">
                Group {{ sortKey === 'group' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
              </th>
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
              <td class="p-4 text-xs">{{ athlete.gender }}</td>
              <td class="p-4 text-xs">{{ athlete.currentGrade }}</td>
              <td class="p-4 text-xs font-bold text-chantilly">{{ athlete.group }}</td>
              
              <td class="p-4 text-[10px] leading-tight space-y-1">
                <div class="flex flex-col"><span class="text-gray-400 font-bold uppercase text-[8px]">Ath:</span> {{ athlete.email || '-' }}</div>
                <div v-if="athlete.parentEmail1" class="flex flex-col"><span class="text-gray-400 font-bold uppercase text-[8px]">G1:</span> {{ athlete.parentEmail1 }}</div>
                <div v-if="athlete.parentEmail2" class="flex flex-col"><span class="text-gray-400 font-bold uppercase text-[8px]">G2:</span> {{ athlete.parentEmail2 }}</div>
              </td>

              <td class="p-4 text-right">
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
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, writeBatch } from 'firebase/firestore'

const athletes = ref([])
const showArchived = ref(false)
const activeGroupFilter = ref('All')
const searchQuery = ref('')
const sortKey = ref('lastName')
const sortOrder = ref('asc')
const fileInput = ref(null)

const gradeSortMap = { 'Freshman': 1, 'Sophomore': 2, 'Junior': 3, 'Senior': 4 }

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
    
    // 1. PRIMARY SORT
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

    // 2. SECONDARY SORT (Tie-breaker: Last Name)
    if (sortKey.value !== 'lastName') {
      const lastA = a.lastName?.toLowerCase() || '';
      const lastB = b.lastName?.toLowerCase() || '';
      if (lastA < lastB) return -1;
      if (lastA > lastB) return 1;
    }

    // 3. TERTIARY SORT (Tie-breaker: First Name)
    if (sortKey.value !== 'firstName') {
      const firstA = a.firstName?.toLowerCase() || '';
      const firstB = b.firstName?.toLowerCase() || '';
      if (firstA < firstB) return -1;
      if (firstA > firstB) return 1;
    }

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
    const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    athletes.value = fetched

    const now = new Date()
    if (now.getMonth() >= 6) {
      const batch = writeBatch(db)
      let needsUpdate = false
      fetched.forEach(ath => {
        if (ath.isActive && ath.gradYear <= now.getFullYear()) {
          batch.update(doc(db, "athletes", ath.id), { isActive: false })
          needsUpdate = true
        }
      })
      if (needsUpdate) batch.commit()
    }
  })
})

const processCSV = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    const rows = text.split(/\r?\n/).filter(r => r.trim() !== '')
    const dataRows = rows.slice(1)
    const now = new Date()
    const seniorYear = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear()

    for (const row of dataRows) {
      const cols = row.split(',')
      if (cols.length < 3) continue
      
      const [first, last, grad, gender, dob] = cols.map(c => c.replace(/"/g, '').trim())
      const gYear = parseInt(grad)
      const diff = gYear - seniorYear
      const grades = ["Senior", "Junior", "Sophomore", "Freshman"]

      try {
        await addDoc(collection(db, "athletes"), {
          firstName: first, lastName: last, gradYear: gYear, gender, birthday: dob,
          currentGrade: grades[diff] || "Other",
          seasons: { xc: false, indoor: false, outdoor: false }, // Resetting to false for auto-trigger
          isActive: true, group: 'General', createdAt: new Date()
        })
      } catch (err) { console.error(err) }
    }
    alert('Import Complete.'); event.target.value = ''
  }
  reader.readAsText(file)
}

const exportRoster = () => {
  const headers = ['First Name', 'Last Name', 'HS Grad Year', 'Gender', 'Birthday']
  const rows = sortedAthletes.value.map(a => [
    a.firstName, a.lastName, a.gradYear, a.gender, a.birthday || ''
  ])
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  link.setAttribute("href", URL.createObjectURL(blob))
  link.setAttribute("download", `Roster_Export.csv`); link.click()
}

const toggleStatus = async (a) => await updateDoc(doc(db, "athletes", a.id), { isActive: !a.isActive })
const deleteAthlete = async (a) => { if (confirm(`Delete ${a.firstName}?`)) await deleteDoc(doc(db, "athletes", a.id)) }
</script>

<style scoped>
.btn-secondary { @apply px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400; }
.action-btn { @apply px-2 py-1 text-[9px] font-black uppercase rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 transition; }
.action-btn-red { @apply px-2 py-1 text-[9px] font-black uppercase rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition; }
</style>
