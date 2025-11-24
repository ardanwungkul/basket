<script setup>
import CoachLayouts from '@/layouts/CoachLayouts.vue'
import { DataTable, Column, Dialog } from 'primevue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FilterMatchMode } from '@primevue/core/api'

import { useAttendanceStore } from '@/stores/attendance'
import { useTrainingStore } from '@/stores/training'
import { useMemberStore } from '@/stores/member'
import { useUIStore } from '@/stores/ui'
import { useResponseStore } from '@/stores/response'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const attendanceStore = useAttendanceStore()
const trainingStore = useTrainingStore()
const memberStore = useMemberStore()
const responseStore = useResponseStore()

const scheduleId = ref(route.params.id)
const attendance = ref([])
const training = ref([])
const member = ref([])

const searchQuery = ref('')
const loading = ref(true)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Fungsi untuk menghitung KU dari data
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

// Fungsi universal untuk mendapatkan KU dari berbagai tipe data
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

// computed untuk mendapatkan informasi jadwal yang dipilih
const selectedScheduleInfo = computed(() => {
  if (!scheduleId.value) return null

  // Gunakan string comparison untuk UUID
  const schedule = training.value.find((s) => s.id === scheduleId.value)
  if (!schedule) return null

  return {
    label: new Date(schedule.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    value: schedule.id,
    date: schedule.date,
    title: schedule.title,
    ku: getKUsFromData(schedule.members, 'member'),
  }
})

const datas = computed(() => {
  if (!scheduleId.value) return []

  // Gunakan string comparison langsung untuk UUID
  const selectedScheduleData = training.value.find((s) => s.id === scheduleId.value)
  if (!selectedScheduleData || !selectedScheduleData.members) {
    console.log('No schedule data or members found')
    return []
  }

  const scheduleMemberIds = selectedScheduleData.members.map((member) => member.id)

  const attendanceData = Array.isArray(attendanceStore.datas) ? attendanceStore.datas : []
  console.log('All attendance data:', attendanceData)
  console.log(
    'Filtered attendance data for schedule:',
    attendanceData.filter((a) => a.training_schedule_id === scheduleId.value),
  )

  // Gabungkan data member dengan attendance
  const result = member.value
    .filter((memberItem) => {
      const isInSchedule = scheduleMemberIds.includes(memberItem.id)
      const isActive = memberItem.status === 'active'
      return isInSchedule && isActive
    })
    .map((memberItem) => {
      const attendance = attendanceData.find(
        (a) => a.member_id === memberItem.id && a.training_schedule_id === scheduleId.value,
      )

      return {
        id: memberItem.id,
        name: memberItem.name,
        gender: memberItem.gender === 'Laki Laki' ? 'Laki-laki' : 'Perempuan',
        date_of_birth: memberItem.date_of_birth,
        status: attendance
          ? attendance.status === 'present'
            ? 'Hadir'
            : attendance.status === 'absent'
              ? 'Tidak Hadir'
              : attendance.status
          : 'Tidak Absen',
        reason: attendance?.reason || '-',
        attendance_id: attendance?.id || null,
      }
    })
  return result
})

// Statistik kehadiran
const attendanceStats = computed(() => {
  const total = datas.value.length
  const present = datas.value.filter(m => m.status === 'Hadir').length
  const absent = datas.value.filter(m => m.status === 'Tidak Hadir').length
  const notRecorded = datas.value.filter(m => m.status === 'Tidak Absen').length
  
  return {
    total,
    present,
    absent,
    notRecorded,
    presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    absentPercentage: total > 0 ? Math.round((absent / total) * 100) : 0,
    notRecordedPercentage: total > 0 ? Math.round((notRecorded / total) * 100) : 0
  }
})

async function fetchData() {
  training.value = trainingStore.datas
  console.log('Member store datas:', memberStore.datas)

  member.value = memberStore.datas.filter((member) => member.status === 'active')
  attendance.value = attendanceStore.datas
}

onMounted(async () => {
  loading.value = true
  await Promise.all([trainingStore.get(), memberStore.getByParentId(), attendanceStore.get()])
  fetchData()
  loading.value = false
})
</script>

<template>
  <CoachLayouts backRoute="coach.attendance.history.index">
    <div class="py-3 space-y-3">
      <!-- HEADER INFO -->
      <div class="bg-white rounded-lg shadow px-5 py-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-xl font-bold text-gray-800">{{ selectedScheduleInfo?.title || 'Loading...' }}</h1>
            <p class="text-gray-600 mt-1">
              <i class="far fa-calendar-alt mr-2"></i>
              {{ selectedScheduleInfo?.label || 'Loading...' }}
            </p>
            <p class="text-gray-600">
              <i class="fas fa-users mr-2"></i>
              KU: {{ selectedScheduleInfo?.ku || 'Loading...' }}
            </p>
          </div>
        </div>
      </div>

      <!-- STATISTICS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-gray-800">{{ attendanceStats.total }}</div>
          <div class="text-sm text-gray-600">Total Anggota</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ attendanceStats.present }}</div>
          <div class="text-sm text-gray-600">Hadir ({{ attendanceStats.presentPercentage }}%)</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ attendanceStats.absent }}</div>
          <div class="text-sm text-gray-600">Tidak Hadir ({{ attendanceStats.absentPercentage }}%)</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-2xl font-bold text-gray-600">{{ attendanceStats.notRecorded }}</div>
          <div class="text-sm text-gray-600">Tidak Absen ({{ attendanceStats.notRecordedPercentage }}%)</div>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="bg-white rounded-lg shadow px-5 py-4">
        <div class="flex justify-end">
          <input v-model="filters['global'].value" type="text" placeholder="Cari..."
            class="border border-gray-300 rounded-lg px-3 py-2 md:text-sm text-xs focus:outline-0 shadow-lg w-full md:w-64" />
        </div>
      </div>

      <!-- TABLE -->
      <div class="!rounded-lg !overflow-hidden shadow bg-white">
        <DataTable :value="datas" v-model:filters="filters" paginator :rows="10" dataKey="id" :loading="loading"
          stripedRows removableSort class="p-datatable-sm" :pt="{
            thead: { class: 'md:!text-sm !text-xs font-light' },
            tbody: { class: 'md:!text-sm !text-xs font-light' },
            pcPaginator: { content: { class: 'text-xs' } },
          }">
          <!-- Nama -->
          <Column field="name" header="Nama" />

          <!-- KU -->
          <Column field="ku" header="KU" class="w-20" :pt="{
            columnHeaderContent: { class: '!justify-center' },
          }">
            <template #body="{ data }">
              <p class="text-center">
                {{ calculateAgeGroup(data.date_of_birth) }}
              </p>
            </template>
          </Column>

          <!-- Jenis Kelamin -->
          <Column field="gender" header="Jenis Kelamin" class="w-40 text-center" :pt="{
            columnHeaderContent: { class: '!justify-center' },
          }">
            <template #body="{ data }">
              <p class="text-center">{{ data.gender }}</p>
            </template>
          </Column>

          <!-- Status -->
          <Column field="status" header="Status" :pt="{
            columnHeaderContent: { class: '!justify-center' },
          }">
            <template #body="{ data }">
              <div class="text-center rounded-lg px-3 py-1 w-min mx-auto whitespace-nowrap border shadow-lg text-xs"
                :class="[
                  data.status === 'Hadir'
                    ? 'bg-green-300 text-green-800 border-green-800'
                    : data.status === 'Tidak Hadir'
                      ? 'bg-red-300 text-red-800 border-red-800'
                      : 'bg-gray-200 text-gray-800 border-gray-800',
                ]">
                <p>{{ data.status }}</p>
              </div>
            </template>
          </Column>

          <!-- Alasan -->
          <Column field="reason" header="Alasan" class="w-48 text-center" :pt="{
            columnHeaderContent: { class: '!justify-center' },
          }">
            <template #body="{ data }">
              <p class="truncate block max-w-xs text-center" :title="data.reason">
                {{ data.reason || '-' }}
              </p>
            </template>
          </Column>

          <!-- Kosong -->
          <template #empty>
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-users text-2xl mb-2"></i>
              <p>Tidak ada data anggota untuk jadwal ini</p>
            </div>
          </template>

          <!-- Loading -->
          <template #loading>
            <div class="text-center text-sm py-6">
              <p>Mohon Tunggu, Sedang Memuat Data.......</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </CoachLayouts>
</template>