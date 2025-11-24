<script setup>
import MemberLayouts from '@/layouts/MemberLayouts.vue'
import { Column, DataTable, useConfirm, Dialog, Image } from 'primevue'
import { onMounted, ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useMemberStore } from '@/stores/member'
import { useRouter } from 'vue-router'
import ConfirmPopup from 'primevue/confirmpopup'
import QRCode from 'qrcode'
import placeholderImage from '@/assets/images/placeholder-person.webp'

const router = useRouter()
const memberStore = useMemberStore()
const confirm = useConfirm()

const datas = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const loading = ref(true)
const visible = ref(false)
const selectedMember = ref(null)
const qrCodeUrl = ref('')

async function fetchData() {
  datas.value = memberStore.datas
  loading.value = false
}

onMounted(async () => {
  const withVariable = 'file'
  await memberStore.getByParentId(withVariable)
  fetchData()
})

function calculateAgeGroup(date) {
  if (date) {
    const thisYear = new Date().getFullYear()
    const birthYear = new Date(date).getFullYear()
    const age = thisYear - birthYear
    return age
  } else {
    return ''
  }
}

const confirmDelete = (event, id) => {
  confirm.require({
    target: event.currentTarget,
    position: 'right',
    message: 'Apakah Kamu Yakin Ingin Menghapus Data Ini?',
    appendTo: 'body',
    icon: 'fa-regular fa-circle-exclamation',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger p-button-sm !w-24 shadow-lg',
    rejectClass: 'p-button-secondary p-button-sm !w-24 shadow-lg',
    accept: async () => {
      await memberStore.destroy(id)
      fetchData()
    },
  })
}

// Fungsi enkripsi member_id
function encryptMemberId(memberId) {
  return btoa(memberId) // base64 encode
}

// Generate QR code
async function showQRCode(member) {
  selectedMember.value = member
  const encryptedId = encryptMemberId(member.id)

  try {
    qrCodeUrl.value = await QRCode.toDataURL(encryptedId, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  } catch (err) {
    console.error('Gagal generate QR Code:', err)
  }

  visible.value = true
}

function downloadQR() {
  const link = document.createElement('a')
  link.href = qrCodeUrl.value
  link.download = `${selectedMember.value.name}_QR.png`
  link.click()
}

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
</script>

<template>
  <MemberLayouts>
    <ConfirmPopup
      :appendTo="'body'"
      :position="'topleft'"
      :pt="{
        root: {
          class: '!rounded-lg !shadow-lg !text-sm',
        },
      }"
    />
    <div class="py-3 space-y-3">
      <div class="rounded-lg bg-white shadow px-5 py-3">
        <div>
          <div class="flex justify-between items-center">
            <div>
              <router-link
                :to="{ name: 'member.create' }"
                class="md:text-sm text-xs bg-piper-600 text-white rounded-lg px-5 py-2 font-light cursor-pointer hover:opacity-90 transition-all duration-300 shadow-lg"
              >
                Tambah +
              </router-link>
            </div>
            <div>
              <input
                type="text"
                v-model="filters['global'].value"
                placeholder="Cari...."
                class="border border-gray-300 rounded-lg px-2.5 py-2 md:text-sm text-xs focus:outline-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="!rounded-lg !overflow-hidden shadow bg-white">
        <DataTable
          v-model:filters="filters"
          :value="datas"
          paginator
          :rows="10"
          dataKey="id"
          :loading="loading"
          :pt="{
            thead: {
              class: 'md:text-sm text-xs font-light',
            },
            tbody: {
              class: 'md:text-sm text-xs font-light',
            },
            pcPaginator: {
              content: {
                class: 'text-xs',
              },
            },
          }"
        >
          <Column field="image" header="" class="w-24">
            <template #body="{ data }">
              <div class="flex items-center">
                <Image
                  preview
                  :pt="{
                    image: {
                      class:
                        '!w-20 !h-20 shadow-lg border border-gray-300 !object-cover rounded-lg',
                    },
                    previewMask: {
                      class: '!rounded-lg',
                    },
                  }"
                  class="!w-20 !h-20 shadow-lg !object-cover !rounded-lg"
                  :src="
                    data?.file?.photo
                      ? backendUrl + 'storage/images/files/' + data?.id + '/' + data?.file?.photo
                      : placeholderImage
                  "
                  alt="Image"
                />
              </div>
            </template>
          </Column>
          <Column field="name" header="Nama">
            <template #body="{ data }">
              <p>
                {{ data.name }}
              </p>
            </template>
          </Column>
          <Column
            field="ku"
            header="KU"
            class="w-20"
            :pt="{
              columnHeaderContent: {
                class: '!justify-center',
              },
            }"
          >
            <template #body="{ data }">
              <p class="text-center">
                {{ calculateAgeGroup(data.date_of_birth) }}
              </p>
            </template>
          </Column>
          <Column
            field="gender"
            header="Jenis Kelamin"
            class="w-40"
            :pt="{
              columnHeaderContent: {
                class: '!justify-center',
              },
            }"
          >
            <template #body="{ data }">
              <p class="text-center">
                {{ data.gender }}
              </p>
            </template>
          </Column>
          <Column
            field="monthly_fee"
            header="Biaya Iuran"
            class="w-40"
            :pt="{
              columnHeaderContent: {
                class: '!justify-center',
              },
            }"
          >
            <template #body="{ data }">
              <p class="text-center">
                {{
                  Number(data.monthly_fee || 0).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
              </p>
            </template>
          </Column>
          <Column
            field="status"
            header="Status"
            :pt="{
              columnHeaderContent: {
                class: '!justify-center',
              },
            }"
          >
            <template #body="{ data }">
              <div
                class="text-center rounded-lg px-3 py-1 w-min mx-auto whitespace-nowrap border shadow-lg text-xs"
                :class="
                  data.status == 'active'
                    ? 'bg-green-300 text-green-800 border-green-800'
                    : 'bg-red-300 text-red-800 border-red-800'
                "
              >
                <p>{{ data.status == 'active' ? 'Aktif' : 'Tidak Aktif' }}</p>
              </div>
            </template>
          </Column>
          <Column field="action" header="">
            <template #body="{ data }">
              <div class="flex justify-center gap-3">
                <router-link
                  :to="{
                    name: 'member.show',
                    params: {
                      id: data?.id,
                    },
                  }"
                  v-tooltip.left="{ value: 'Show Detail', showDelay: 1000, hideDelay: 300 }"
                >
                  <i class="fa-solid fa-eye"></i>
                </router-link>
                <button
                  @click="showQRCode(data)"
                  v-if="data?.status == 'active'"
                  v-tooltip.left="{ value: 'QR Code', showDelay: 1000, hideDelay: 300 }"
                  class="cursor-pointer text-rhino-950"
                >
                  <i class="fa-solid fa-qrcode"></i>
                </button>

                <button
                  @click="
                    router.push({
                      name: 'member.verification',
                      params: {
                        id: data.id,
                      },
                    })
                  "
                  v-if="!data?.file"
                  v-tooltip.left="{
                    value: 'Complete Verification',
                    showDelay: 1000,
                    hideDelay: 300,
                  }"
                  class="cursor-pointer text-rhino-950"
                >
                  <i class="fa-solid fa-badge-check"></i>
                </button>
                <button
                  @click="
                    router.push({
                      name: 'member.edit',
                      params: {
                        id: data.id,
                      },
                    })
                  "
                  v-tooltip.left="{ value: 'Edit', showDelay: 1000, hideDelay: 300 }"
                  class="cursor-pointer text-rhino-950"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  @click="confirmDelete($event, data.id)"
                  v-tooltip.left="{ value: 'Delete', showDelay: 1000, hideDelay: 300 }"
                  class="cursor-pointer text-rhino-950"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center md:text-sm text-xs">
              <p>Tidak ada data ditemukan.</p>
            </div>
          </template>
          <template #loading>
            <div class="text-center text-sm">
              <p>Mohon Tunggu, Sedang Memuat Data.......</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
     <!-- Dialog QR Code -->
    <Dialog
      v-model:visible="visible"
      modal
      header="QR Code Member"
      :style="{ width: '350px' }"
      :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    >
      <div class="flex flex-col items-center gap-2">
        <div v-if="selectedMember">
          <p class="text-center font-semibold">{{ selectedMember.name }}</p>
        </div>

        <div class="border-2 border-gray-200 p-4 rounded-lg">
          <img :src="qrCodeUrl" alt="QR Code" class="w-48 h-48 mx-auto" v-if="qrCodeUrl" />
          <div v-else class="w-48 h-48 flex items-center justify-center bg-gray-100">
            <p class="text-gray-500">Generating QR Code...</p>
          </div>
        </div>

        <div class="flex justify-center gap-2 mt-4">
          <button
            @click="visible = false"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
          >
            Tutup
          </button>
          <button
            v-if="qrCodeUrl"
            @click="downloadQR"
            class="px-4 py-2 bg-piper-600 text-white rounded-lg text-sm hover:bg-piper-700 transition-colors"
          >
            Download QR
          </button>
        </div>
      </div>
    </Dialog>
  </MemberLayouts>
</template>
