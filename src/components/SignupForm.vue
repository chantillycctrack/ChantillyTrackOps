<template>
  <div class="max-w-md mx-auto bg-gray-900 p-6 rounded-xl border border-chantilly/20 shadow-xl">
    <h2 class="text-2xl font-bold text-chantilly-light mb-4">Athlete Sign-up</h2>
    <p class="text-gray-400 mb-6">Grade: <span class="text-white font-mono">{{ displayGrade }}</span></p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <input v-model="form.firstName" type="text" placeholder="First Name" class="input-field" required />
      <input v-model="form.lastName" type="text" placeholder="Last Name" class="input-field" required />
      
      <select v-model="form.gradYear" class="input-field" required>
        <option value="">Graduation Year</option>
        <option v-for="year in gradYears" :key="year" :value="year">{{ year }}</option>
      </select>

      <select v-model="form.group" class="input-field" required>
        <option value="">Event Group</option>
        <option value="Sprinters">Sprinters</option>
        <option value="Distance">Distance</option>
        <option value="Throwers">Throwers</option>
      </select>

      <input v-model="form.email" type="email" placeholder="Athlete Email" class="input-field" required />
      <button type="submit" class="btn-purple w-full">Join the Team</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db } from '../firebaseConfig'
import { collection, addDoc } from 'firebase/firestore'

const form = ref({
  firstName: '', lastName: '', gradYear: '', group: '', email: '', isActive: true
})

const gradYears = computed(() => {
  const current = new Date().getFullYear()
  return [current, current + 1, current + 2, current + 3, current + 4]
})

const displayGrade = computed(() => {
  if (!form.value.gradYear) return "Select Year"
  const today = new Date()
  const academicYear = today.getMonth() > 5 ? today.getFullYear() + 1 : today.getFullYear()
  const diff = form.value.gradYear - academicYear
  
  if (diff === 0) return "Senior"
  if (diff === 1) return "Junior"
  if (diff === 2) return "Sophomore"
  if (diff === 3) return "Freshman"
  return "Alumni/Future"
})

const handleSubmit = async () => {
  try {
    await addDoc(collection(db, "athletes"), {
      ...form.value,
      currentGrade: displayGrade.value,
      timestamp: new Date()
    })
    alert("Success!")
    form.value = { firstName: '', lastName: '', gradYear: '', group: '', email: '', isActive: true }
  } catch (e) {
    alert("Error: " + e.message)
  }
}
</script>
