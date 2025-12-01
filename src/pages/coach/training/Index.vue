<script setup>
import CoachLayouts from '@/layouts/CoachLayouts.vue'
import { DataTable, Column, Dialog, ConfirmPopup, useConfirm, Dropdown } from 'primevue'
import { ref, computed, onMounted, watch } from 'vue'
import { useTrainingStore } from '@/stores/training'
import { useMemberStore } from '@/stores/member'
import { FilterMatchMode } from '@primevue/core/api'
import { useResponseStore } from '@/stores/response'

const confirm = useConfirm()
const trainingStore = useTrainingStore()
const memberStore = useMemberStore()
const datas = ref([])
const members = ref([])
const availableKUs = ref([])
const responseStore = useResponseStore()

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const loading = ref(true)
const saving = ref(false)
const visible = ref(false)
const form = ref(null)
const selectedKU = ref(null)
const filteredMembers = ref([])
const selectAllChecked = ref(false)

async function fetchData() {
  datas.value = trainingStore.datas

  members.value = memberStore.datas.filter((member) => member.status === 'active')
  availableKUs.value = getAvailableKUs(members.value)
}

onMounted(async () => {
  loading.value = true
  const withVariable = 'file'
  await trainingStore.get()
  await memberStore.getByParentId(withVariable)
  loading.value = false
  fetchData()
})

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

function getAvailableKUs(membersData) {
  const kusString = getKUsFromData(membersData, 'member')
  if (kusString === '-') return []

  return kusString.split(',').map((ku) => ku.trim())
}

function getMemberKUs(members) {
  return getKUsFromData(members, 'member')
}

function filterMembersByKU(ku) {
  if (!ku) {
    filteredMembers.value = []
    return
  }

  filteredMembers.value = members.value.filter((member) => {
    const memberKU = calculateAgeGroup(member.date_of_birth)
    return memberKU === parseInt(ku)
  })

  selectAllChecked.value = false
}

function toggleSelectAll() {
  if (selectAllChecked.value) {
    form.value.member_ids = filteredMembers.value.map((member) => member.id)
  } else {
    form.value.member_ids = []
  }
}

watch(
  () => form.value?.member_ids,
  (newMemberIds) => {
    if (!form.value || !filteredMembers.value.length) {
      selectAllChecked.value = false
      return
    }

    // Cek apakah semua member terpilih
    const allMemberIds = filteredMembers.value.map((member) => member.id)
    selectAllChecked.value =
      newMemberIds?.length === allMemberIds.length &&
      allMemberIds.every((id) => newMemberIds.includes(id))
  },
  { deep: true },
)

// Ambil data training
async function getData() {
  datas.value = trainingStore.datas
}

// Ambil data member
async function getMembers() {
  try {
    const withVariable = 'file'
    await memberStore.getByParentId(withVariable)
    // Filter hanya member dengan status aktif
    members.value = memberStore.datas.filter((member) => member.status === 'active')
    availableKUs.value = getAvailableKUs(members.value)
  } catch (error) {
    console.error('Error fetching members:', error)
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  await Promise.all([trainingStore.get(), getMembers()])
  loading.value = false
  getData()
})

// Fungsi untuk mendapatkan KU dari data member yang sudah dipilih
function getExistingKUFromMembers(selectedMembers) {
  if (!selectedMembers || selectedMembers.length === 0) return null

  // Ambil KU dari member pertama (asumsi semua member dalam satu KU yang sama)
  const firstMember = selectedMembers[0]
  return calculateAgeGroup(firstMember.date_of_birth)
}

// Fungsi untuk memfilter member berdasarkan KU yang sudah ada
function filterMembersByExistingKU(item) {
  if (!item || !item.members || item.members.length === 0) return

  // Ambil KU dari member yang sudah dipilih
  const existingKU = getExistingKUFromMembers(item.members)
  if (existingKU) {
    selectedKU.value = existingKU.toString()
    form.value.ku = existingKU.toString()
    filterMembersByKU(existingKU.toString())

    // Set member_ids yang sudah dipilih
    if (item.members && item.members.length > 0) {
      form.value.member_ids = item.members.map((member) => member.id)

      // Update select all status
      if (filteredMembers.value.length > 0) {
        const allMemberIds = filteredMembers.value.map((member) => member.id)
        selectAllChecked.value =
          form.value.member_ids.length === allMemberIds.length &&
          allMemberIds.every((id) => form.value.member_ids.includes(id))
      }
    }
  }
}

// Dialog functions
function openDialog(item = null) {
  form.value = item
    ? {
        ...item,
        // Pastikan member_ids ada
        member_ids: item.members ? item.members.map((member) => member.id) : [],
      }
    : {
        title: '',
        date: '',
        ku: null,
        member_ids: [],
      }

  selectedKU.value = null
  visible.value = true
  selectAllChecked.value = false
  filteredMembers.value = []

  // Jika edit, filter member berdasarkan KU yang sudah ada
  if (item && item.members && item.members.length > 0) {
    filterMembersByExistingKU(item)
  }
}

function closeDialog() {
  visible.value = false
  form.value = null
  selectedKU.value = null
  filteredMembers.value = []
  selectAllChecked.value = false
}

function onKUChange(ku) {
  selectedKU.value = ku
  form.value.ku = ku
  form.value.member_ids = []
  selectAllChecked.value = false
  filterMembersByKU(ku)
}

async function saveSchedule() {
  if (!form.value.title || !form.value.date || !form.value.ku) {
    responseStore.addError('Silahkan lengkapi terlebih dahulu')
  } else if (form.value.ku && (!form.value.member_ids || form.value.member_ids.length === 0)) {
    responseStore.addError('Harap pilih minimal 1 member untuk KU yang dipilih.')
  } else {
    saving.value = true
    try {
      const payload = {
        title: form.value.title,
        date: form.value.date,
        ku: form.value.ku,
        member_ids: form.value.member_ids || [],
      }

      if (form.value.id) {
        await trainingStore.update(form.value.id, payload)
      } else {
        await trainingStore.create(payload)
      }

      getData()
      closeDialog()
    } catch (error) {
      console.error('Error saving schedule:', error)
      responseStore.addError('Terjadi kesalahan saat menyimpan jadwal.')
    } finally {
      saving.value = false
    }
  }
}

const confirmDelete = (event, id) => {
  confirm.require({
    target: event.currentTarget,
    position: 'right',
    message: 'Apakah kamu yakin ingin menghapus jadwal ini?',
    icon: 'fa-regular fa-circle-exclamation',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger p-button-sm !w-24 shadow-lg',
    rejectClass: 'p-button-secondary p-button-sm !w-24 shadow-lg',
    accept: async () => {
      await trainingStore.destroy(id)
      getData()
    },
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Computed untuk menampilkan informasi member yang dipilih
const getSelectedMemberNames = computed(() => {
  if (!form.value?.member_ids?.length) return []

  const selectedMembers = members.value.filter((member) =>
    form.value.member_ids.includes(member.id),
  )
  return selectedMembers
})

const getLimitedMemberNames = computed(() => {
  return getSelectedMemberNames.value.slice(0, 3)
})

const getRemainingMemberNames = computed(() => {
  if (getSelectedMemberNames.value.length <= 3) return ''

  const remainingMembers = getSelectedMemberNames.value.slice(3)
  return remainingMembers.map((member) => member.name).join(', ')
})
</script>

<template>
  <CoachLayouts>
    <ConfirmPopup
      :appendTo="'body'"
      :pt="{
        root: { class: '!rounded-lg !shadow-lg !text-sm' },
      }"
    />

    <div class="py-3 space-y-3">
      <!-- HEADER -->
      <div class="rounded-lg bg-white shadow px-5 py-3">
        <div class="flex justify-between items-center">
          <button
            @click="openDialog()"
            class="flex items-center gap-2 text-sm bg-piper-600 text-white rounded-lg px-5 py-2.5 font-medium cursor-pointer hover:bg-piper-700 transition-all duration-300 shadow-lg"
          >
            <i class="fa-solid fa-plus"></i>
            Tambah Jadwal
          </button>
          <div>
            <input
              type="text"
              v-model="filters['global'].value"
              placeholder="Cari...."
              class="border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="!rounded-lg !overflow-hidden shadow bg-white">
        <DataTable
          v-model:filters="filters"
          :value="datas"
          paginator
          :rows="10"
          dataKey="id"
          :loading="loading"
          :pt="{
            thead: { class: 'text-sm font-light' },
            tbody: { class: 'text-sm font-light' },
            pcPaginator: { content: { class: 'text-xs' } },
          }"
        >
          <Column field="title" header="Judul Jadwal" class="min-w-48">
            <template #body="{ data }">
              <div class="font-medium text-gray-900">{{ data.title }}</div>
            </template>
          </Column>

          <Column field="ku" header="KU" class="min-w-48">
            <template #body="{ data }">
              <div class="font-medium text-gray-900">{{ getMemberKUs(data.members) }}</div>
            </template>
          </Column>

          <Column field="date" header="Tanggal" class="min-w-48">
            <template #body="{ data }">
              <div class="text-gray-700">{{ formatDate(data.date) }}</div>
            </template>
          </Column>

          <Column field="action" header="" class="w-32">
            <template #body="{ data }">
              <div class="flex justify-center gap-2">
                <button
                  @click="openDialog(data)"
                  v-tooltip.left="{ value: 'Edit', showDelay: 500, hideDelay: 300 }"
                  class="cursor-pointer text-rhino-950"
                >
                  <i class="fa-solid fa-pen text-sm"></i>
                </button>
                <button
                  @click="confirmDelete($event, data.id)"
                  v-tooltip.left="{ value: 'Hapus', showDelay: 500, hideDelay: 300 }"
                  class="cursor-pointer text-rhino-950"
                >
                  <i class="fa-solid fa-trash text-sm"></i>
                </button>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-8">
              <i class="fa-regular fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
              <div class="text-gray-500 text-sm">Tidak ada jadwal ditemukan.</div>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-6">
              <span class="text-sm text-gray-600">Memuat data jadwal...</span>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <Dialog
      v-model:visible="visible"
      :header="form?.id ? 'Edit Jadwal Latihan' : 'Tambah Jadwal Latihan'"
      modal
      dismissableMask
      v-on:hide="closeDialog"
      class="w-full max-w-2xl"
      :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
      :pt="{ root: { class: '!rounded-xl' }, content: { class: 'pt-4' } }"
    >
      <form @submit.prevent="saveSchedule" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Judul Jadwal <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            class="px-2.5 py-2 border border-gray-300 shadow text-sm rounded-lg w-full focus:outline-1 focus:outline-gray-500"
            placeholder="Masukkan Judul"
          />
        </div>

        <!-- Tanggal -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tanggal <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.date"
            type="date"
            class="px-2.5 py-2 border border-gray-300 shadow text-sm rounded-lg w-full focus:outline-1 focus:outline-gray-500"
          />
        </div>

        <!-- KU Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Kelompok Umur (KU) <span class="text-red-500">*</span>
          </label>
          <Dropdown
            v-model="selectedKU"
            :options="availableKUs"
            placeholder="Pilih KU"
            class="w-full"
            @change="onKUChange($event.value)"
            :pt="{
              root: {
                class:
                  'w-full h-9 flex items-center rounded-lg border border-gray-300 text-sm focus-within:outline-1 focus-within:outline-gray-500',
                style: 'border-radius: 0.5rem;',
              },
              input: { class: 'w-full text-sm px-2.5 focus:outline-none focus:ring-0' },
              trigger: { class: 'bg-transparent pr-2' },
            }"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value">{{ slotProps.value }}</span>
              <span v-else class="text-gray-400">Pilih KU</span>
            </template>
            <template #option="slotProps">
              <span>{{ slotProps.option }}</span>
            </template>
          </Dropdown>
          <p class="text-xs text-gray-500 mt-1">
            Pilih Kelompok Umur untuk menampilkan daftar member
          </p>
        </div>

        <!-- Member Selection -->
        <div v-if="selectedKU">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Pilih Member </label>

          <!-- Select All Checkbox -->
          <div
            v-if="filteredMembers.length > 0"
            class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div class="flex items-center space-x-3">
              <input
                type="checkbox"
                id="select-all"
                v-model="selectAllChecked"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-piper-600 focus:ring-piper-500"
              />
              <label for="select-all" class="flex-1 text-sm font-medium cursor-pointer">
                <span class="text-rhino-800">Pilih Semua Member</span>
                <span class="text-gray-500 text-xs ml-2"
                  >({{ filteredMembers.length }} member aktif tersedia)</span
                >
              </label>
            </div>
          </div>

          <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
            <div v-if="filteredMembers.length === 0" class="text-center text-gray-500 py-4">
              <i class="fa-solid fa-users-slash text-xl mb-2"></i>
              <p class="text-sm">Tidak ada member aktif untuk KU {{ selectedKU }}</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="member in filteredMembers"
                :key="member.id"
                class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  :id="`member-${member.id}`"
                  :value="member.id"
                  v-model="form.member_ids"
                  class="rounded border-gray-300 text-piper-600 focus:ring-piper-500"
                />
                <label :for="`member-${member.id}`" class="flex-1 text-sm cursor-pointer">
                  <div class="font-medium">{{ member.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ member.gender }} • Status:
                    <span class="text-green-600 font-medium">Aktif</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            <span
              v-for="member in getLimitedMemberNames"
              :key="member.id"
              class="text-xs bg-piper-100 text-rhino-700 px-2 py-1 rounded-full border border-piper-300"
            >
              {{ member.name }}
            </span>

            <span
              v-if="getSelectedMemberNames.length > 3"
              v-tooltip="{
                value: getRemainingMemberNames,
                showDelay: 500,
                hideDelay: 300,
              }"
              class="text-xs bg-piper-300 text-rhino-800 px-2 py-1 rounded-full border border-piper-400 cursor-help"
            >
              +{{ getSelectedMemberNames.length - 3 }} lainnya
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeDialog"
            :disabled="saving"
            class="text-sm bg-gray-200 rounded-lg px-5 py-2 font-medium cursor-pointer hover:opacity-90 transition-all duration-300 shadow-lg w-34"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="text-sm bg-piper-600 text-white rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 transition-all duration-300 shadow-lg w-34 font-medium flex items-center gap-2 justify-center"
          >
            <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-check"></i>
            <p>{{ saving ? 'Menyimpan...' : form?.id ? 'Update' : 'Simpan' }}</p>
          </button>
        </div>
      </form>
    </Dialog>
  </CoachLayouts>
</template>
