<script setup>
import MemberLayouts from '@/layouts/MemberLayouts.vue'
import { DataTable, Column, Dialog } from 'primevue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FilterMatchMode } from '@primevue/core/api'

import { useAttendanceStore } from '@/stores/attendance'
import { useTrainingStore } from '@/stores/training'
import { useMemberStore } from '@/stores/member'
import { useResponseStore } from '@/stores/response'

const route = useRoute()
const router = useRouter()
const attendanceStore = useAttendanceStore()
const trainingStore = useTrainingStore()
const memberStore = useMemberStore()
const responseStore = useResponseStore()

const memberId = ref(route.params.id)
const selectedMember = ref(null)
const trainingSchedules = ref([])
const attendanceData = ref([])
const loading = ref(true)

const upcomingSchedulesFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const attendanceHistoryFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Fungsi untuk menghitung KU
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

// Computed untuk mendapatkan jadwal yang relevan untuk anak terpilih
const schedules = computed(() => {
  if (!selectedMember.value || trainingSchedules.value.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return trainingSchedules.value
    .filter((schedule) => {
      // Cek apakah anak termasuk dalam jadwal ini
      const isMemberInSchedule = schedule.members?.some((member) => member.id === memberId.value)
      if (!isMemberInSchedule) return false

      // Filter hanya jadwal yang akan datang
      const scheduleDate = new Date(schedule.date)
      scheduleDate.setHours(0, 0, 0, 0)
      return scheduleDate >= today
    })
    .map((schedule) => {
      const attendance = attendanceData.value.find(
        (a) => a.member_id === memberId.value && a.training_schedule_id === schedule.id,
      )

      return {
        id: schedule.id,
        title: schedule.title,
        date: schedule.date,
        formattedDate: new Date(schedule.date).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: attendance
          ? attendance.status === 'present'
            ? 'Hadir'
            : attendance.status === 'absent'
              ? 'Tidak Hadir'
              : attendance.status
          : 'Belum Absen',
        reason: attendance?.reason || '-',
        attendance_id: attendance?.id || null,
        ku: calculateAgeGroup(selectedMember.value.date_of_birth),
      }
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

// Computed untuk riwayat kehadiran (jadwal yang sudah lewat)
const attendanceHistory = computed(() => {
  if (!selectedMember.value || trainingSchedules.value.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return trainingSchedules.value
    .filter((schedule) => {
      // Cek apakah anak termasuk dalam jadwal ini
      const isMemberInSchedule = schedule.members?.some((member) => member.id === memberId.value)
      if (!isMemberInSchedule) return false

      // Filter hanya jadwal yang sudah lewat
      const scheduleDate = new Date(schedule.date)
      scheduleDate.setHours(0, 0, 0, 0)
      return scheduleDate < today
    })
    .map((schedule) => {
      const attendance = attendanceData.value.find(
        (a) => a.member_id === memberId.value && a.training_schedule_id === schedule.id,
      )

      return {
        id: schedule.id,
        title: schedule.title,
        date: schedule.date,
        formattedDate: new Date(schedule.date).toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: attendance
          ? attendance.status === 'present'
            ? 'Hadir'
            : attendance.status === 'absent'
              ? 'Tidak Hadir'
              : 'Tidak Absen'
          : 'Tidak Absen',
        reason: attendance?.reason || '-',
        attendance_id: attendance?.id || null,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Urutkan dari yang terbaru
})

async function fetchData() {
    // Ambil data member yang dipilih
    const members = memberStore.datas.filter(member => member.status === 'active')
    selectedMember.value = members.find(member => member.id === memberId.value)

    if (!selectedMember.value) {
        router.push({ name: 'member.training.index' })
        return
    }

    // Ambil data training schedules
    trainingSchedules.value = trainingStore.datas

    // Ambil data attendance untuk member ini
    const allAttendance = Array.isArray(attendanceStore.datas) ? attendanceStore.datas : []
    attendanceData.value = allAttendance.filter(att => att.member_id === memberId.value)
}

onMounted(async () => {
    loading.value = true
    await Promise.all([
        trainingStore.get(),
        memberStore.getByParentId(),
        attendanceStore.getByParentId('trainingSchedule,member')
    ])
    await fetchData()
    loading.value = false
})
</script>

<template>
    <MemberLayouts backRoute="member.training.index">
        <div class="py-3 space-y-6">
            <!-- Header Informasi Anak -->
            <div class="bg-white rounded-lg shadow px-5 py-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold text-gray-800">{{ selectedMember?.name }}</h1>
                            <span v-if="selectedMember?.status === 'active'"
                                class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <i class="fas fa-check-circle mr-1"></i>
                                Aktif
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span class="flex items-center gap-2">
                                <i class="fas fa-birthday-cake text-piper-500"></i>
                                Usia: {{ selectedMember ? calculateAgeGroup(selectedMember.date_of_birth) : '' }} tahun
                            </span>
                            <span class="flex items-center gap-2">
                                <i class="fas fa-venus-mars text-piper-500"></i>
                                {{ selectedMember?.gender === 'Laki Laki' ? 'Laki-laki' : 'Perempuan' }}
                            </span>
                            <span class="flex items-center gap-2">
                                <i class="fas fa-id-card text-piper-500"></i>
                                KU: {{ selectedMember ? calculateAgeGroup(selectedMember.date_of_birth) : '' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Jadwal yang Akan Datang -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-5 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-calendar-alt text-piper-500"></i>
                        Jadwal Latihan Mendatang
                    </h2>
                    <p class="text-sm text-gray-600 mt-1">Jadwal latihan yang akan datang</p>
                </div>

                <div class="p-5">
                    <div v-if="loading" class="text-center py-8">
                        <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500">Memuat jadwal latihan...</p>
                    </div>

                    <div v-else-if="schedules.length > 0">
                        <div class="relative w-full md:w-64 mb-4">
                            <input
                                v-model="upcomingSchedulesFilter['global'].value"
                                type="text"
                                placeholder="Cari jadwal..."
                                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-0 shadow-sm w-full pl-10"
                            />
                            <span class="absolute left-3 top-2.5 text-gray-400">
                                <i class="fas fa-search"></i>
                            </span>
                        </div>

                        <DataTable
                            :value="schedules"
                            v-model:filters="upcomingSchedulesFilter"
                            paginator
                            :rows="10"
                            dataKey="id"
                            :loading="loading"
                            stripedRows
                            removableSort
                            class="p-datatable-sm"
                            :pt="{
                                thead: { class: 'text-sm font-light' },
                                tbody: { class: 'text-sm font-light' },
                                pcPaginator: { content: { class: 'text-xs' } },
                            }"
                        >
                            <!-- Judul Jadwal -->
                            <Column field="title" header="Judul Latihan" />

                            <!-- Tanggal -->
                            <Column field="formattedDate" header="Tanggal" class="w-48" />

                            <!-- Status -->
                            <Column
                                field="status"
                                header="Status"
                                class="w-32"
                                :pt="{
                                    columnHeaderContent: { class: '!justify-center' },
                                }"
                            >
                                <template #body="{ data }">
                                    <div
                                        class="text-center rounded-lg px-3 py-1 w-min mx-auto whitespace-nowrap border shadow text-xs"
                                        :class="[
                                            data.status === 'Hadir'
                                                ? 'bg-green-300 text-green-800 border-green-800'
                                                : data.status === 'Tidak Hadir'
                                                ? 'bg-red-300 text-red-800 border-red-800'
                                                : 'bg-blue-300 text-blue-800 border-blue-800',
                                        ]"
                                    >
                                        <p>{{ data.status }}</p>
                                    </div>
                                </template>
                            </Column>

                            <!-- Alasan -->
                            <Column
                                field="reason"
                                header="Alasan"
                                class="w-64"
                                :pt="{
                                    columnHeaderContent: { class: '!justify-center' },
                                }"
                            >
                                <template #body="{ data }">
                                    <p class="truncate block max-w-xs text-center" :title="data.reason">
                                        {{ data.reason }}
                                    </p>
                                </template>
                            </Column>

                            <!-- Kosong -->
                            <template #empty>
                                <div class="text-center py-8 text-gray-500">
                                    <i class="fas fa-clipboard-list text-2xl mb-2"></i>
                                    <p>Tidak ada jadwal mendatang</p>
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

                    <div v-else class="text-center py-8 text-gray-500">
                        <i class="far fa-calendar-times text-3xl mb-3 text-gray-400"></i>
                        <p class="text-lg font-medium mb-2">Tidak ada jadwal mendatang</p>
                        <p class="text-sm">Tidak ada jadwal latihan yang akan datang</p>
                    </div>
                </div>
            </div>

            <!-- Riwayat Kehadiran -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-5 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-history text-piper-500"></i>
                        Riwayat Kehadiran
                    </h2>
                    <p class="text-sm text-gray-600 mt-1">Riwayat kehadiran pada latihan sebelumnya</p>
                </div>

                <div class="p-5">
                    <div class="relative w-full md:w-64 mb-4">
                        <input
                            v-model="attendanceHistoryFilter['global'].value"
                            type="text"
                            placeholder="Cari jadwal..."
                            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-0 shadow-sm w-full pl-10"
                        />
                        <span class="absolute left-3 top-2.5 text-gray-400">
                            <i class="fas fa-search"></i>
                        </span>
                    </div>

                    <DataTable
                        :value="attendanceHistory"
                        v-model:filters="attendanceHistoryFilter"
                        paginator
                        :rows="10"
                        dataKey="id"
                        :loading="loading"
                        stripedRows
                        removableSort
                        class="p-datatable-sm"
                        :pt="{
                            thead: { class: 'text-sm font-light' },
                            tbody: { class: 'text-sm font-light' },
                            pcPaginator: { content: { class: 'text-xs' } },
                        }"
                    >
                        <!-- Judul Jadwal -->
                        <Column field="title" header="Judul Latihan" />

                        <!-- Tanggal -->
                        <Column field="formattedDate" header="Tanggal" class="w-48" />

                        <!-- Status -->
                        <Column
                            field="status"
                            header="Status"
                            class="w-32"
                            :pt="{
                                columnHeaderContent: { class: '!justify-center' },
                            }"
                        >
                            <template #body="{ data }">
                                <div
                                    class="text-center rounded-lg px-3 py-1 w-min mx-auto whitespace-nowrap border shadow text-xs"
                                    :class="[
                                        data.status === 'Hadir'
                                            ? 'bg-green-300 text-green-800 border-green-800'
                                            : data.status === 'Tidak Hadir'
                                            ? 'bg-red-300 text-red-800 border-red-800'
                                            : 'bg-gray-200 text-gray-800 border-gray-800',
                                    ]"
                                >
                                    <p>{{ data.status }}</p>
                                </div>
                            </template>
                        </Column>

                        <!-- Alasan -->
                        <Column
                            field="reason"
                            header="Alasan"
                            class="w-64"
                            :pt="{
                                columnHeaderContent: { class: '!justify-center' },
                            }"
                        >
                            <template #body="{ data }">
                                <p class="truncate block max-w-xs text-center" :title="data.reason">
                                    {{ data.reason }}
                                </p>
                            </template>
                        </Column>

                        <!-- Kosong -->
                        <template #empty>
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-clipboard-list text-2xl mb-2"></i>
                                <p>Belum ada riwayat kehadiran</p>
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
        </div>
    </MemberLayouts>
</template>