<script setup>
import CoachLayouts from '@/layouts/CoachLayouts.vue'
import { DataTable, Column, Dialog } from 'primevue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
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
const saving = ref(false)
const showModal = ref(false)
const showQRScanner = ref(false)
const qrError = ref('')

const selectedMember = ref(null)
const form = ref({ member: null, status: 'present', reason: null })

// qr scanner state
const scanResult = ref(null)
const scanLoading = ref(false)
const cameraPermission = ref('')

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
          : 'Belum Absen',
        reason: attendance?.reason || null,
        attendance_id: attendance?.id || null,
      }
    })
  return result
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

function openAttendanceModal(member) {
  selectedMember.value = member

  form.value = {
    member: member,
    status:
      member.status === 'Hadir'
        ? 'present'
        : member.status === 'Tidak Hadir'
          ? 'absent'
          : 'present',
    reason: member.reason !== '-' ? member.reason : null,
  }

  showModal.value = true
}

async function saveManualAttendance() {
  if (form.value.status === 'absent' && !form.value.reason) {
    responseStore.addError('Harap isi alasan ketidakhadiran.')
    return
  }

  saving.value = true

  const attendanceForm = {
    member_id: selectedMember.value.id,
    training_schedule_id: scheduleId.value,
    status: form.value.status,
    reason: form.value.status === 'absent' ? form.value.reason : null,
  }

  try {
    if (selectedMember.value.attendance_id) {
      await attendanceStore.updateAttendance(selectedMember.value.attendance_id, attendanceForm)
    } else {
      await attendanceStore.addAttendance(attendanceForm)
    }

    showModal.value = false
    await fetchData()
  } catch (error) {
    console.error('Attendance error:', error)

    if (error.response?.status === 422) {
      // Handle validation errors
      const errorMsg = error.response.data?.message || 'Member tidak terdaftar dalam jadwal latihan ini'
      responseStore.addError(errorMsg)
    } else {
      const errorMsg = error.response?.data?.message || 'Gagal menyimpan absensi.'
      responseStore.addError(errorMsg)
    }
  } finally {
    saving.value = false
  }
}

// QR SCANNER
function openQRScanner() {
  showQRScanner.value = true
  qrError.value = ''
  scanResult.value = null
}

function closeQRScanner() {
  showQRScanner.value = false
  qrError.value = ''
  scanResult.value = null
  scanLoading.value = false
}

async function onQRCodeDetected(detectedCodes) {
  if (detectedCodes.length === 0) return
  const detectedCode = detectedCodes[0]
  const rawValue = detectedCode.rawValue

  if (!rawValue) {
    qrError.value = 'QR Code tidak valid'
    return
  }

  scanLoading.value = true
  qrError.value = ''

  try {
    await processQRCode(rawValue)
  } catch (error) {
    console.error('Error processing QR code:', error)
    qrError.value = 'Gagal memproses QR Code: ' + error.message
  } finally {
    scanLoading.value = false
  }
}

async function processQRCode(qrData) {
  try {
    if (!isValidBase64(qrData)) {
      qrError.value = 'Format QR Code tidak valid'
      return
    }

    await attendanceStore.scanQRAttendance(qrData, scheduleId.value)
    await fetchData()
    qrError.value = ''

  } catch (error) {
    if (error.response?.status === 422) {
      // Handle validation errors (member tidak termasuk jadwal/KU tidak sesuai)
      if (error.response.data?.message) {
        qrError.value = error.response.data.message
      } else {
        qrError.value = 'Member tidak terdaftar dalam jadwal latihan ini'
      }
    } else if (error.response?.data?.message) {
      qrError.value = error.response.data.message
    } else {
      qrError.value = 'Gagal melakukan absensi: ' + (error.message || 'Terjadi kesalahan')
    }
  }
}

function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

function onCameraError(error) {
  console.error('Camera error:', error)
  if (error.name === 'NotAllowedError') {
    qrError.value = 'Akses kamera ditolak. Silakan izinkan akses kamera.'
  } else if (error.name === 'NotFoundError') {
    qrError.value = 'Kamera tidak ditemukan.'
  } else if (error.name === 'NotSupportedError') {
    qrError.value = 'Browser tidak mendukung akses kamera.'
  } else if (error.name === 'NotReadableError') {
    qrError.value = 'Kamera sedang digunakan oleh aplikasi lain.'
  } else {
    qrError.value = 'Terjadi error pada kamera: ' + error.message
  }
}

function onCameraInit(promise) {
  promise
    .then(() => {
      cameraPermission.value = 'granted'
      qrError.value = ''
    })
    .catch((error) => {
      onCameraError(error)
      cameraPermission.value = 'denied'
    })
}

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
  <CoachLayouts backRoute="coach.attendance.index">
    <div class="py-3 space-y-3">
      <form @submit.prevent>
        <div
          class="flex flex-row justify-between items-start md:items-center bg-white rounded-lg shadow px-5 py-4 gap-4">
          <button type="button" @click="openQRScanner"
            class="flex md:justify-between items-center gap-2 bg-piper-600 hover:bg-piper-700 text-white px-5 py-2 rounded-lg transition shadow cursor-pointer md:text-sm text-xs">
            <i class="fas fa-qrcode"></i>
            <span class="whitespace-nowrap">Scan QR Code</span>
          </button>

          <input v-model="filters['global'].value" type="text" placeholder="Cari..."
            class="border border-gray-300 rounded-lg px-2.5 py-2 md:text-sm text-xs focus:outline-0 shadow-lg w-full md:w-48" />
        </div>
      </form>

      <!-- TABLE -->
      <form @submit.prevent>
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

            <!-- Aksi -->
            <Column field="action" header="" :pt="{
              columnHeaderContent: { class: '!justify-center' },
            }">
              <template #body="{ data }">
                <div class="flex justify-center gap-3">
                  <button type="button" @click="openAttendanceModal(data)" v-tooltip.left="{
                    value: data.status === 'Belum Absen' ? 'Absen' : 'Ubah',
                    showDelay: 1000,
                    hideDelay: 300,
                  }" :class="[
                    data.status === 'Belum Absen'
                      ? 'bg-piper-600 text-white hover:bg-piper-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    'text-xs rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer',
                  ]">
                    {{ data.status === 'Belum Absen' ? 'Absen' : 'Ubah' }}
                  </button>
                </div>
              </template>
            </Column>

            <!-- Kosong -->
            <template #empty>
              <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-2xl mb-2"></i>
                <p>Tidak ada data anggota untuk KU {{ selectedScheduleInfo?.ku }}</p>
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
      </form>

      <!-- MODAL ABSENSI -->
      <Dialog v-model:visible="showModal" :header="selectedMember ? `Absen: ${selectedMember.name}` : 'Absen Manual'"
        modal class="w-full max-w-md">
        <form @submit.prevent="saveManualAttendance">
          <div v-if="selectedMember" class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p class="text-blue-700">
                <span class="font-medium">Status saat ini:</span>
                <span :class="[
                  selectedMember.status === 'Hadir'
                    ? 'text-green-600'
                    : selectedMember.status === 'Tidak Hadir'
                      ? 'text-red-600'
                      : 'text-gray-600',
                  'ml-1 font-medium',
                ]">
                  {{ selectedMember.status }}
                </span>
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
              <select v-model="form.status"
                class="border border-gray-300 rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-piper-500 focus:border-piper-500 cursor-pointer"
                :disabled="saving">
                <option value="present">Hadir</option>
                <option value="absent">Tidak Hadir</option>
              </select>
            </div>

            <div v-if="form.status === 'absent'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Alasan
                <span class="text-red-500">*</span>
              </label>
              <textarea rows="3" id="reason" name="reason" type="text" v-model="form.reason"
                placeholder="Masukkan alasan ketidakhadiran..."
                class="border border-gray-300 rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-piper-500 focus:border-piper-500"
                :disabled="saving">
        </textarea>
              <p v-if="formError" class="text-red-500 text-xs mt-1">{{ formError }}</p>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="closeModal"
                class="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                Batal
              </button>
              <button type="submit" :disabled="saving"
                class="px-4 py-2 text-sm rounded-lg bg-piper-600 text-white hover:bg-piper-700 flex items-center gap-2 cursor-pointer disabled:opacity-50">
                <i v-if="saving" class="fas fa-spinner fa-spin text-sm"></i>
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </div>
        </form>
      </Dialog>

      <!-- MODAL QR SCANNER -->
      <Dialog v-model:visible="showQRScanner" header="Scan QR Code Absensi" :modal="true" :closable="!scanLoading"
        class="w-full max-w-2xl" @hide="closeQRScanner">
        <form @submit.prevent>
          <div class="space-y-4">


            <!-- Scanner area -->
            <div class="relative">
              <div class="rounded-lg overflow-hidden bg-gray-300">
                <qrcode-stream v-if="showQRScanner && !scanLoading && cameraPermission !== 'denied'"
                  @detect="onQRCodeDetected" @error="onCameraError" @init="onCameraInit"
                  :camera="cameraPermission === 'denied' ? 'off' : 'auto'" :paused="scanLoading"
                  class="w-full h-64 md:h-96">
                  <!-- Overlay loading -->
                  <div v-if="scanLoading"
                    class="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div class="text-white text-center">
                      <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                      <p class="text-lg font-medium">Memproses QR Code...</p>
                      <p class="text-sm opacity-80 mt-1">Mohon tunggu sebentar</p>
                    </div>
                  </div>
                </qrcode-stream>

                <!-- Tampilan ketika kamera error -->
                <div v-if="cameraPermission === 'denied'"
                  class="w-full h-64 md:h-96 flex items-center justify-center bg-gray-100">
                  <div class="text-center text-gray-500">
                    <i class="fas fa-camera-slash text-3xl mb-3"></i>
                    <p class="font-medium">Akses Kamera Ditolak</p>
                    <p class="text-sm mt-1">Silakan izinkan akses kamera untuk menggunakan scanner</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <i class="fas fa-info-circle"></i> Petunjuk Scan QR
              </h3>
              <ul class="text-blue-700 text-sm space-y-1">
                <li>• Pastikan QR Code berada dalam area kotak scanner</li>
                <li>• Pastikan pencahayaan cukup</li>
                <li>• Jaga jarak yang tepat dari kamera</li>
              </ul>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="closeQRScanner" :disabled="scanLoading"
                class="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer">
                Tutup Scanner
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  </CoachLayouts>
</template>
