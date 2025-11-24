<script setup>
import CoachLayouts from '@/layouts/CoachLayouts.vue'
import { ref, computed, onMounted } from 'vue'

import { useTrainingStore } from '@/stores/training'
import { useMemberStore } from '@/stores/member'
import { FilterMatchMode } from '@primevue/core/api'

const trainingStore = useTrainingStore()
const memberStore = useMemberStore()

const filters = ref({
  ku: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const training = ref([])
const loading = ref(true)
const selectedKU = ref(null)
const availableKUs = ref([])

function calculateAgeGroup(dateOfBirth) {
  if (dateOfBirth) {
    const thisYear = new Date().getFullYear()
    const birthYear = new Date(dateOfBirth).getFullYear()
    const age = thisYear - birthYear
    return age
  } else {
    return ''
  }
}

function getKUsFromData(data, dataType = 'member') {
  if (!data || data.length === 0) {
    return '-'
  }

  const kuSet = new Set()

  data.forEach((item) => {
    const dateOfBirth = dataType === 'member' ? item.date_of_birth : item.member?.date_of_birth

    const ku = calculateAgeGroup(dateOfBirth)
    if (ku) kuSet.add(ku)
  })

  const kus = Array.from(kuSet).sort((a, b) => a - b)
  return kus.length > 0 ? kus.join(', ') : '-'
}

function getMemberKUs(members) {
  return getKUsFromData(members, 'member')
}

// Function to extract all unique KUs from all schedules
function extractAllKUs(schedules) {
  const kuSet = new Set()
  
  schedules.forEach(schedule => {
    if (schedule.ku && schedule.ku !== '-') {
      const kus = schedule.ku.split(', ').map(ku => ku.trim())
      kus.forEach(ku => kuSet.add(ku))
    }
  })
  
  return Array.from(kuSet).sort((a, b) => a - b)
}

const schedules = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filter untuk mengambil hanya jadwal yang sudah lewat
  const allSchedules = training.value
    .filter((schedule) => {
      const scheduleDate = new Date(schedule.date)
      scheduleDate.setHours(0, 0, 0, 0)
      return scheduleDate < today // Hanya jadwal yang sudah lewat
    })
    .map((schedule) => ({
      label: new Date(schedule.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      value: schedule.id,
      date: schedule.date,
      title: schedule.title,
      ku: getMemberKUs(schedule.members),
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Urutkan dari yang terbaru

  // Update available KUs whenever schedules change
  availableKUs.value = extractAllKUs(allSchedules)

  // Filter by selected KU if any
  if (selectedKU.value) {
    return allSchedules.filter(schedule => 
      schedule.ku.includes(selectedKU.value)
    )
  }
  
  return allSchedules
})

async function fetchData() {
  training.value = trainingStore.datas
}

function clearFilter() {
  selectedKU.value = null
}

onMounted(async () => {
  loading.value = true
  await Promise.all([trainingStore.get(), memberStore.getByParentId()])
  fetchData()
  loading.value = false
})
</script>

<template>
  <CoachLayouts backRoute="coach.attendance.index">
    <div class="py-3 space-y-3">

      <!-- HEADER -->
      <div class="rounded-lg bg-white shadow px-5 py-3">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-bold text-gray-800">Riwayat Jadwal Latihan</h1>
            <p class="text-sm text-gray-600 mt-1">Menampilkan jadwal latihan yang sudah berlalu</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- KU Filter -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600 font-medium">Filter KU:</label>
              <select 
                v-model="selectedKU"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-0 shadow-lg focus:border-piper-500 min-w-[100px]"
              >
                <option :value="null">Semua KU</option>
                <option 
                  v-for="ku in availableKUs" 
                  :key="ku" 
                  :value="ku"
                >
                  {{ ku }}
                </option>
              </select>
              
              <!-- Clear Filter Button -->
              <button
                v-if="selectedKU"
                @click="clearFilter"
                class="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Hapus filter"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Active Filter Info -->
        <div v-if="selectedKU" class="mt-3 flex items-center gap-2 text-sm">
          <span class="text-gray-600">Menampilkan riwayat untuk:</span>
          <span class="bg-piper-100 text-piper-800 px-2 py-1 rounded-md font-medium">
            KU {{ selectedKU }}
          </span>
          <span class="text-gray-500 text-xs">
            ({{ schedules.length }} jadwal ditemukan)
          </span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-5">
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-500">Memuat riwayat jadwal latihan...</p>
        </div>

        <div v-else-if="schedules.length > 0" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link
              v-for="s in schedules"
              :key="s.value"
              :to="`/coach/attendance/history/${s.value}`"
              class="cursor-pointer rounded-xl border-2 shadow-sm p-3 text-left transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-105 flex flex-col justify-between bg-white border-gray-200 text-gray-700"
            >
              <div class="w-full">
                <!-- Title -->
                <div class="mb-3">
                  <p class="font-semibold md:text-base text-sm leading-tight line-clamp-2">
                    {{ s.title }}
                  </p>
                </div>

                <!-- Date -->
                <p class="md:text-sm text-xs mb-1 text-gray-600">
                  {{ s.label }}
                </p>

                <!-- Status Past -->
                <div class="mb-2">
                  <span class="inline-block px-2 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-700">
                    <i class="fas fa-history mr-1"></i>Sudah Berlalu
                  </span>
                </div>

                <!-- KU Information -->
                <div class="mt-auto">
                  <span
                    class="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-rhino-100 text-grey-600"
                  >
                    KU: {{ s.ku }}
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <i class="far fa-calendar-times text-3xl mb-3 text-gray-400"></i>
          <p class="text-lg font-medium mb-2">
            {{ selectedKU ? `Tidak ada riwayat untuk KU ${selectedKU}` : 'Tidak ada riwayat jadwal latihan' }}
          </p>
          <p class="text-sm">
            {{ selectedKU ? 'Tidak ada riwayat jadwal latihan yang sesuai dengan filter KU' : 'Belum ada jadwal latihan yang sudah berlalu' }}
          </p>
          <button 
            v-if="selectedKU"
            @click="clearFilter"
            class="mt-3 text-sm text-piper-600 hover:text-piper-700 font-medium"
          >
            Tampilkan semua riwayat
          </button>
        </div>
      </div>
    </div>
  </CoachLayouts>
</template>