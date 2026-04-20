<template>
  <div class="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-chantilly/30">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
        Athlete <span class="text-chantilly">Registration</span>
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Join the Charger Track & Field Team</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <input v-model="form.firstName" type="text" placeholder="First Name" class="input-field" required />
        <input v-model="form.lastName" type="text" placeholder="Last Name" class="input-field" required />
      </div>
      
      <select v-model="form.gradYear" class="input-field" required>
        <option value="">Graduation Year</option>
        <option v-for="year in gradYears" :key="year" :value="year">{{ year }}</option>
      </select>

      <select v-model="form.group" class="input-field" required>
        <option value="">Primary Event Group</option>
        <option value="Sprinters">Sprints/Hurdles</option>
        <option value="Distance">Distance</option>
        <option value="Throwers">Throws</option>
        <option value="Jumpers">Jumps</option>
      </select>

      <input v-model="form.email" type="email" placeholder="Athlete Email" class="input-field" required />

      <button type="submit" :disabled="loading" class="btn-purple w-full py-3 mt-4 flex justify-center items-center">
        <span v-if="loading">Processing...</span>
        <span v-else>Submit Registration</span>
      </button>
    </form>
    
    <p v-if="success" class="mt-4 text-center text-green-500 font-bold animate-pulse">
      ✓ You are registered, Charger!
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db } from '../firebaseConfig'
import { collection, addDoc } from 'firebase/firestore'

const form = ref({ firstName: '', lastName: '', gradYear: '', group: '', email: '', isActive: true })
const loading = ref(false)
const success = ref(false)

const gradYears = computed(() => {
  const current = new Date().getFullYear()
  return [current, current + 1, current + 2, current + 3, current + 4]
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const academicYear = new Date().getMonth() > 5 ? new Date().getFullYear() + 1 : new Date().getFullYear()
    const diff = form.value.gradYear - academicYear
    const gradeLabels = ["Senior", "Junior", "Sophomore", "Freshman"]
    const grade = gradeLabels[diff] || "Alumni/Other"

    await addDoc(collection(db, "athletes"), {
      ...form.value,
      currentGrade: grade,
      timestamp: new Date()
    })
    
    success.value = true
    form.value = { firstName: '', lastName: '', gradYear: '', group: '', email: '', isActive: true }
    setTimeout(() => { success.value = false }, 5000)
  } catch (e) {
    alert("Error saving: " + e.message)
  } finally {
    loading.value = false
  }
}
</script>
