<template>
  <div class="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-chantilly/30">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
        Athlete <span class="text-chantilly">Registration</span>
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Join Chantilly Track & Field</p>
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
            <option v-for="item in availableYears" :key="item.year" :value="item.year">
              {{ item.year }} ({{ item.label }})
            </option>
          </select>

          <select v-model="form.group" class="input-field" required>
            <option value="">Event Group *</option>
            <option value="Sprints">Sprints</option>
            <option value="Distance">Distance</option>
            <option value="Throwers">Throwers</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <select v-model="form.gender" class="input-field" required>
            <option value="">Gender *</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          <input v-if="form.gender === 'Prefer not to say'" 
                 v-model="customGenderText" 
                 type="text" 
                 placeholder="Specify (optional)" 
                 class="input-field" />
          <input v-else v-model="form.email" type="email" placeholder="Email *" class="input-field" required />
        </div>
        
        <input v-if="form.gender === 'Prefer not to say'" v-model="form.email" type="email" placeholder="Athlete Email address *" class="input-field" required />
      </div>

      <hr class="border-gray-100 dark:border-gray-800 my-6" />

      <div class="space-y-4">
        <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Parent / Guardian 1</label>
        <input v-model="form.parentName1" type="text" placeholder="Guardian 1 Name" class="input-field" />
        <input v-model="form.parentEmail1" type="email" placeholder="Guardian 1 Email" class="input-field" />
      </div>

      <div class="space-y-4 pt-2">
        <label class="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Parent / Guardian 2 (Optional)</label>
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

const customGenderText = ref('')
const form = ref({ 
  firstName: '', 
  lastName: '', 
  gradYear: '', 
  group: '', 
  gender: '', // New Field
  email: '', 
  seasons: { xc: false, indoor: false, outdoor: false },
  parentName1: '', 
  parentEmail1: '',
  parentName2: '',
  parentEmail2: '',
  isActive: true 
})

const loading = ref(false)
const success = ref(false)

const currentSeniorYear = computed(() => {
  const now = new Date()
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear()
})

const availableYears = computed(() => {
  const senior = currentSeniorYear.value
  return [
    { year: senior, label: 'Senior' },
    { year: senior + 1, label: 'Junior' },
    { year: senior + 2, label: 'Sophomore' },
    { year: senior + 3, label: 'Freshman' }
  ]
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const seniorYear = currentSeniorYear.value
    const diff = form.value.gradYear - seniorYear
    const grades = ["Senior", "Junior", "Sophomore", "Freshman"]
    const grade = grades[diff] || "Other"

    // Final Gender Logic
    const finalGender = (form.value.gender === 'Prefer not to say' && customGenderText.value) 
                        ? customGenderText.value 
                        : form.value.gender;

    await addDoc(collection(db, "athletes"), {
      ...form.value,
      gender: finalGender, // Save the final calculated gender
      currentGrade: grade,
      timestamp: new Date()
    })
    
    success.value = true
    
    // Reset form
    form.value = { 
      firstName: '', lastName: '', gradYear: '', group: '', gender: '', email: '', 
      seasons: { xc: false, indoor: false, outdoor: false },
      parentName1: '', parentEmail1: '', parentName2: '', parentEmail2: '', isActive: true 
    }
    customGenderText.value = ''
    
    setTimeout(() => { success.value = false }, 5000)
  } catch (e) {
    alert("Error: " + e.message)
  } finally {
    loading.value = false
  }
}
</script>
