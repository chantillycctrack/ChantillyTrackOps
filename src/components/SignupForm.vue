<template>
  <div class="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-chantilly/30">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
        Athlete <span class="text-chantilly">Registration</span>
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Chantilly Track & Field Operations</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-4">
        <label class="text-[10px] font-black uppercase text-chantilly tracking-[0.2em]">Athlete Details</label>
        <div class="grid grid-cols-2 gap-4">
          <input v-model="form.firstName" type="text" placeholder="First Name *" class="input-field" required />
          <input v-model="form.lastName" type="text" placeholder="Last Name *" class="input-field" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <select v-model="form.gradYear" class="input-field" required>
            <option value="">Grad Year *</option>
            <option v-for="year in gradYears" :key="year" :value="year">{{ year }}</option>
          </select>

          <select v-model="form.group" class="input-field" required>
            <option value="">Event Group *</option>
            <option value="Sprints">Sprints</option>
            <option value="Distance">Distance</option>
            <option value="Throwers">Throwers</option>
          </select>
        </div>

        <input v-model="form.email" type="email" placeholder="Athlete Email address *" class="input-field" required />
      </div>

      <hr class="border-gray-100 dark:border-gray-800 my-6" />

      <div class="space-y-4">
        <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Guardian 1 (Optional)</label>
        <input v-model="form.parentName1" type="text" placeholder="Guardian 1 Name" class="input-field" />
        <input v-model="form.parentEmail1" type="email" placeholder="Guardian 1 Email" class="input-field" />
      </div>

      <div class="space-y-4 pt-2">
        <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Guardian 2 (Optional)</label>
        <input v-model="form.parentName2" type="text" placeholder="Guardian 2 Name" class="input-field" />
        <input v-model="form.parentEmail2" type="email" placeholder="Guardian 2 Email" class="input-field" />
      </div>

      <button type="submit" :disabled="loading" class="btn-purple w-full py-4 mt-6 flex justify-center items-center text-sm uppercase tracking-widest font-black">
        <span v-if="loading">Processing...</span>
        <span v-else>Complete Registration</span>
      </button>
    </form>
    
    <p v-if="success" class="mt-6 text-center text-green-500 font-bold animate-bounce text-sm">
      ✓ Welcome to the team, Charger!
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db } from '../firebaseConfig'
import { collection, addDoc } from 'firebase/firestore'

const form = ref({ 
  firstName: '', 
  lastName: '', 
  gradYear: '', 
  group: '', 
  email: '', 
  parentName1: '', 
  parentEmail1: '',
  parentName2: '',
  parentEmail2: '',
  isActive: true 
})

const loading = ref(false)
const success = ref(false)

const gradYears = computed(() => {
  const current = new Date().getFullYear()
  return [current, current + 1, current + 2, current + 3, current + 4]
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // Corrected Grade Logic
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() 
    const schoolYearEnd = currentMonth > 5 ? currentYear + 1 : currentYear
    const diff = form.value.gradYear - schoolYearEnd

    let grade = ""
    if (diff === 0) grade = "Senior"
    else if (diff === 1) grade = "Junior"
    else if (diff === 2) grade = "Sophomore"
    else if (diff === 3) grade = "Freshman"
    else if (diff < 0) grade = "Alumni"
    else grade = "Future"

    await addDoc(collection(db, "athletes"), {
      ...form.value,
      currentGrade: grade,
      timestamp: new Date()
    })
    
    success.value = true
    // Reset Form
    form.value = { 
      firstName: '', lastName: '', gradYear: '', group: '', email: '', 
      parentName1: '', parentEmail1: '', parentName2: '', parentEmail2: '', isActive: true 
    }
    setTimeout(() => { success.value = false }, 5000)
  } catch (e) {
    alert("Submission Error: " + e.message)
  } finally {
    loading.value = false
  }
}
</script>
