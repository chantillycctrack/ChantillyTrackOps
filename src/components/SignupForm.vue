<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 class="text-xs font-black uppercase tracking-widest text-chantilly">Management Tools</h3>
          <p class="text-[10px] text-gray-500 uppercase">BCC Lists & Seasonal Data</p>
        </div>
        
        <div class="flex items-center gap-3">
          <input type="file" ref="fileInput" class="hidden" accept=".csv" @change="processCSV" />
          <button @click="$refs.fileInput.click()" class="btn-secondary">📥 Import CSV</button>
          <button @click="exportRoster" class="btn-secondary">📤 Full Export</button>
          
          <div class="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
            <input type="checkbox" v-model="includeCoaches" id="coach-toggle" class="w-4 h-4 rounded text-chantilly focus:ring-chantilly" />
            <label for="coach-toggle" class="text-[10px] font-bold uppercase text-gray-400 cursor-pointer">Include Staff</label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <button @click="copyDistributionList('athletes')" class="btn-tool">Athletes Only</button>
        <button @click="copyDistributionList('parents')" class="btn-tool">Parents Only</button>
        <button @click="copyDistributionList('all')" class="btn-tool-purple">Entire Team + Parents</button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-chantilly/20 overflow-hidden">
      <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap justify-between items-center gap-4">
        <div class="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
          <button v-for="s in ['Outdoor', 'Indoor', 'XC', 'All']" :key="s"
                  @click="activeSeasonFilter = s"
                  :class="activeSeasonFilter === s ? 'bg-white dark:bg-gray-800 text-chantilly shadow-sm' : 'text-gray-400'"
                  class="px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all">
            {{ s }}
          </button>
        </div>

        <button @click="showArchived = !showArchived" 
                class="text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-lg border transition"
                :class="showArchived ? 'bg-red-500 text-white border-red-500' : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'">
          {{ showArchived ? 'Showing All' : 'Active Only' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 dark:bg-black/20 text-gray-400 text-[10px] uppercase tracking-widest">
            <tr>
              <th class="p-4">Name</th>
              <th class="p-4">Grade / Group</th>
              <th class="p-4">Seasons</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="athlete in filteredAthletes" :key="athlete.id" 
                class="hover:bg-gray-50 dark:hover:bg-white/5 transition border-l-4" 
                :class="athlete.isActive ? 'border-l-green-500' : 'border-l-gray-500 opacity-60'">
              <td class="p-4">
                <div class="font-bold text-gray-900 dark:text-white">{{ athlete.firstName }} {{ athlete.lastName }}</div>
                <div class="text-[9px] text-gray-400 font-bold uppercase">{{ athlete.gender }}</div>
              </td>
              <td class="p-4 text-sm">
                <div class="font-medium">{{ athlete.currentGrade }}</div>
                <div class="text-chantilly font-bold text-[10px] uppercase tracking-wider">{{ athlete.group }}</div>
              </td>
              <td class="p-4">
                <div class="flex gap-1">
                  <span v-if="athlete.seasons?.xc" class="season-badge bg-orange-100 text-orange-700">XC</span>
                  <span v-if="athlete.seasons?.indoor" class="season-badge bg-blue-100 text-blue-700">IN</span>
                  <span v-if="athlete.seasons?.outdoor" class="season-badge bg-green-100 text-green-700">OUT</span>
                </div>
              </td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="toggleStatus(athlete)" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                    {{ athlete.isActive ? '📂' : '📤' }}
                  </button>
                  <button @click="deleteAthlete(athlete)" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition">🗑️</button>
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
const coachEmails = ref([])
const showArchived = ref(false)
const activeSeasonFilter = ref('Outdoor') 
const includeCoaches = ref(true)
const fileInput = ref(null)

const filteredAthletes = computed(() => {
  return athletes.value.filter(a => {
    const statusMatch = showArchived.value || a.isActive;
    let seasonMatch = false;
    if (activeSeasonFilter.value === 'All') seasonMatch = true;
    else if (activeSeasonFilter.value === 'Outdoor') seasonMatch = a.seasons?.outdoor === true;
    else if (activeSeasonFilter.value === 'Indoor') seasonMatch = a.seasons?.indoor === true;
    else if (activeSeasonFilter.value === 'XC') seasonMatch = a.seasons?.xc === true;
    return statusMatch && seasonMatch;
  });
})

onMounted(() => {
  onSnapshot(query(collection(db, "athletes")), (snap) => {
    athletes.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
  onSnapshot(collection(db, "authorized_coaches"), (snap) => {
    coachEmails.value = snap.docs.map(doc => doc.data().email).filter(e => e)
  })
})

const processCSV = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target.result
    const rows = text.split(/\r?\n/).filter(row => row.trim() !== '')
    const dataRows = rows.slice(1)
    
    // Grade Logic based on April 2026
    const now = new Date()
    const seniorYear = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear()

    for (const row of dataRows) {
      const cols = row.split(',').map(c => c.trim())
      if (cols.length < 3) continue
      const [first, last, grad, gender, dob, xc, indoor, outdoor] = cols

      const gYear = parseInt(grad)
      const diff = gYear - seniorYear
      const grades = ["Senior", "Junior", "Sophomore", "Freshman"]

      try {
        await addDoc(collection(db, "athletes"), {
          firstName: first,
          lastName: last,
          gradYear: gYear,
          currentGrade: grades[diff] || "Other",
          gender: gender,
          birthday: dob || '',
          seasons: {
            xc: xc?.toUpperCase() === 'X',
            indoor: indoor?.toUpperCase() === 'I',
            outdoor: outdoor?.toUpperCase() === 'O'
          },
          isActive: true,
          group: 'General',
          createdAt: new Date()
        })
      } catch (err) { console.error(err) }
    }
    alert('Import Complete.'); event.target.value = ''
  }
  reader.readAsText(file)
}

const exportRoster = () => {
  const headers = ['First Name', 'Last Name', 'HS Grad Year', 'Gender', 'Birthday', 'XC', 'Indoor', 'Outdoor']
  const rows = filteredAthletes.value.map(a => [
    a.firstName, a.lastName, a.gradYear, a.gender, a.birthday || '',
    a.seasons?.xc ? 'X' : '', a.seasons?.indoor ? 'I' : '', a.seasons?.outdoor ? 'O' : ''
  ])
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement("a")
  link.setAttribute("href", URL.createObjectURL(blob))
  link.setAttribute("download", `Roster_Export.csv`); link.click()
}

const copyDistributionList = (type) => {
  let emails = []
  filteredAthletes.value.forEach(a => {
    if (type === 'athletes' || type === 'all') if (a.email) emails.push(a.email)
    if (type === 'parents' || type === 'all') {
      if (a.parentEmail1) emails.push(a.parentEmail1); if (a.parentEmail2) emails.push(a.parentEmail2)
    }
  })
  if (includeCoaches.value) coachEmails.value.forEach(e => emails.push(e))
  const unique = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e !== ''))]
  navigator.clipboard.writeText(unique.join('; ')).then(() => alert('Copied!'))
}

const toggleStatus = async (a) => await updateDoc(doc(db, "athletes", a.id), { isActive: !a.isActive })
const deleteAthlete = async (a) => { if (confirm(`Delete ${a.firstName}?`)) await deleteDoc(doc(db, "athletes", a.id)) }
</script>

<style scoped>
.btn-tool { @apply px-3 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition rounded-lg text-[10px] font-bold uppercase tracking-widest; }
.btn-tool-purple { @apply px-3 py-3 bg-chantilly text-white shadow-lg shadow-chantilly/20 rounded-lg text-[10px] font-bold uppercase tracking-widest; }
.btn-secondary { @apply px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400; }
.season-badge { @apply text-[8px] font-black px-1.5 py-0.5 rounded uppercase; }
</style>
