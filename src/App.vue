<template>
  <div :class="{ 'dark': darkMode }">
    
    <div class="min-h-screen bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      
      <header class="bg-white dark:bg-black border-b border-gray-200 dark:border-[#4B2E83]/30 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 class="text-xl font-black tracking-tight uppercase">
          Chantilly <span class="text-[#4B2E83]">Track Ops</span>
        </h1>
        
        <div class="flex items-center gap-6">
          <button v-if="!user" @click="login" class="text-xs font-bold uppercase text-gray-400 hover:text-[#4B2E83] transition">
            Coach Login
          </button>
          
          <template v-else-if="isAuthorizedCoach">
            <div class="flex items-center gap-4 border-r border-gray-200 dark:border-gray-700 pr-4 mr-2">
              <button @click="isAdmin = !isAdmin" class="text-xs font-bold uppercase text-chantilly">
                {{ isAdmin ? '← Athlete Form' : 'View Roster' }}
              </button>
            </div>
            <button @click="logout" class="text-[10px] uppercase text-gray-500 hover:text-red-500">
              Logout
            </button>
          </template>

          <div v-else class="flex items-center gap-3">
            <span class="text-[10px] text-red-400 uppercase font-bold italic">Not Staff</span>
            <button @click="logout" class="text-[10px] underline text-gray-500 uppercase">Logout</button>
          </div>

          <button @click="darkMode = !darkMode" class="hover:opacity-70 transition p-2 rounded-lg">
            {{ darkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <main class="container mx-auto px-4 py-12 flex justify-center">
        <div class="w-full max-w-4xl">
          
          <template v-if="isAdmin && isAuthorizedCoach">
            <div class="flex gap-6 mb-8 border-b border-gray-200 dark:border-gray-800">
              <button @click="activeTab = 'roster'" 
                      :class="activeTab === 'roster' ? 'text-chantilly border-b-2 border-chantilly' : 'text-gray-400'" 
                      class="pb-2 font-bold uppercase text-xs tracking-widest transition-all">
                Athlete Roster
              </button>
              <button @click="activeTab = 'staff'" 
                      :class="activeTab === 'staff' ? 'text-chantilly border-b-2 border-chantilly' : 'text-gray-400'" 
                      class="pb-2 font-bold uppercase text-xs tracking-widest transition-all">
                Staff Management
              </button>
              <button @click="activeTab = 'meets'" 
                      :class="activeTab === 'meets' ? 'text-chantilly border-b-2 border-chantilly' : 'text-gray-400'" 
                      class="pb-2 font-bold uppercase text-xs tracking-widest transition-all">
                Meet Management
              </button>
            </div>

            <Roster v-if="activeTab === 'roster'" />
            <StaffManager v-if="activeTab === 'staff'" />
            <MeetManager v-if="activeTab === 'meets'" />
          </template>

          <SignupForm v-else />
          
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from './firebaseConfig'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'

// Components
import SignupForm from './components/SignupForm.vue'
import Roster from './components/Roster.vue'
import StaffManager from './components/StaffManager.vue'
import MeetManager from './components/MeetManager.vue'

// State
const darkMode = ref(true)
const isAdmin = ref(false)
const activeTab = ref('roster')
const user = ref(null)
const isAuthorizedCoach = ref(false)

// Lifecycle: Check Auth and Firestore Permissions
onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      const q = query(collection(db, "authorized_coaches"), where("email", "==", currentUser.email))
      const querySnapshot = await getDocs(q)
      isAuthorizedCoach.value = !querySnapshot.empty
      
      // AUTO-REDIRECT: If they are a coach, skip the signup form
      if (isAuthorizedCoach.value) {
        isAdmin.value = true
      }
    } else {
      isAuthorizedCoach.value = false
      isAdmin.value = false
    }
  })
})

const login = async () => {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error("Auth Error:", error)
    alert("Login failed. Check your browser settings.")
  }
}

const logout = () => {
  signOut(auth)
  isAdmin.value = false
  isAuthorizedCoach.value = false
}
</script>
