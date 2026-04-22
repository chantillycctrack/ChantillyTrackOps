<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="text-center md:text-left">
      <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
        Team <span class="text-chantilly">Communication</span>
      </h2>
      <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Generate BCC Distribution Lists</p>
    </div>

    <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 space-y-8">
      
      <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800">
        <div>
          <h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Include Coaching Staff</h4>
          <p class="text-[10px] text-gray-400 font-medium">Adds authorized coaches to every generated list</p>
        </div>
        <div @click="includeCoaches = !includeCoaches" 
             class="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300"
             :class="includeCoaches ? 'bg-chantilly' : 'bg-gray-300 dark:bg-gray-700'">
          <div class="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
               :class="{ 'translate-x-6': includeCoaches }"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button @click="copyList('athletes')" class="comm-btn group">
          <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">🏃</span>
          <span class="font-black uppercase tracking-widest text-[10px]">Athletes Only</span>
        </button>

        <button @click="copyList('parents')" class="comm-btn group">
          <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">👪</span>
          <span class="font-black uppercase tracking-widest text-[10px]">Parents Only</span>
        </button>

        <button @click="copyList('all')" class="comm-btn group">
          <span class="text-2xl mb-2 group-hover:scale-110 transition-transform">📢</span>
          <span class="font-black uppercase tracking-widest text-[10px]">Entire Team + Parents</span>
        </button>
      </div>

      <transition name="fade">
        <div v-if="copyFeedback" class="text-center p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold uppercase tracking-widest border border-green-100 dark:border-green-900/30">
          ✓ List Copied to Clipboard
        </div>
      </transition>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
      <span class="text-blue-500 font-bold">ℹ</span>
      <p class="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed uppercase font-bold">
        These buttons generate a list of emails for <span class="underline">Active</span> athletes only. 
        Paste the result into the "BCC" field of your email client to protect privacy.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebaseConfig'
import { collection, query, onSnapshot, where } from 'firebase/firestore'

const athletes = ref([])
const coachEmails = ref([])
const includeCoaches = ref(true)
const copyFeedback = ref(false)

onMounted(() => {
  // Only pull ACTIVE athletes for communication
  const q = query(collection(db, "athletes"), where("isActive", "==", true))
  onSnapshot(q, (snap) => {
    athletes.value = snap.docs.map(doc => doc.data())
  })

  onSnapshot(collection(db, "authorized_coaches"), (snap) => {
    coachEmails.value = snap.docs.map(doc => doc.data().email).filter(e => e)
  })
})

const copyList = (type) => {
  let emails = []

  athletes.value.forEach(a => {
    if (type === 'athletes' || type === 'all') {
      if (a.email) emails.push(a.email)
    }
    if (type === 'parents' || type === 'all') {
      if (a.parentEmail1) emails.push(a.parentEmail1)
      if (a.parentEmail2) emails.push(a.parentEmail2)
    }
  })

  if (includeCoaches.value) {
    coachEmails.value.forEach(e => emails.push(e))
  }

  // Deduplicate, trim, and lowercase
  const unique = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e !== ''))]
  
  navigator.clipboard.writeText(unique.join('; ')).then(() => {
    copyFeedback.value = true
    setTimeout(() => { copyFeedback.value = false }, 3000)
  })
}
</script>

<style scoped>
.comm-btn {
  @apply flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-black/40 border-2 border-gray-100 dark:border-gray-800 rounded-2xl hover:border-chantilly dark:hover:border-chantilly hover:bg-white dark:hover:bg-white/5 transition-all;
}
.comm-btn-purple {
  @apply flex flex-col items-center justify-center p-8 bg-chantilly text-white border-2 border-chantilly rounded-2xl shadow-lg shadow-chantilly/20 hover:scale-[1.02] active:scale-[0.98] transition-all;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
