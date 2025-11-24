<script setup>
import AdminLayouts from '@/layouts/AdminLayouts.vue'
import { useMemberStore } from '@/stores/member'
import { useParentStore } from '@/stores/parent'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const memberStore = useMemberStore()
const route = useRoute()
const member = ref()

onMounted(async () => {
  await memberStore.getById(route.params.id)

  member.value = memberStore.data
})

function validatePhoneNumber(event) {
  form.value.parent_phone_number = event.target.value.replace(/\D/g, '')
}
function validatePhoneFormat() {
  let phone = form.value.parent_phone_number

  if (phone.startsWith('08')) {
    form.value.parent_phone_number = '628' + phone.slice(2)
  }
}

async function submit() {
  await memberStore.update(form.value, route.params.id)
}

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
</script>
<template>
  <AdminLayouts backRoute="admin.member.index">
    <div class="py-3 space-y-3">
      <div class="rounded-lg bg-white shadow p-5">
        <form @submit.prevent="submit" class="space-y-3">
          <div class="grid md:grid-cols-2 gap-3">
            <div>
              <fieldset class="border border-gray-300 rounded-lg shadow p-5 pt-3">
                <legend class="md:text-sm text-xs px-3">Informasi Member</legend>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Nama Lengkap</p>
                  <p>{{ member?.name }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Jenis Kelamin</p>
                  <p>{{ member?.gender }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Tempat Lahir</p>
                  <p>{{ member?.place_of_birth }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Tanggal Lahir</p>
                  <p>{{ member?.date_of_birth }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Kelompok Umur</p>
                  <p>{{ calculateAgeGroup(member?.date_of_birth) }}</p>
                </div>
                <div class="border w-full my-3 border-gray-200" />
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Asal Sekolah</p>
                  <p>{{ member?.school }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Kelas</p>
                  <p>{{ member?.school_grade }}</p>
                </div>
                <div class="border w-full my-3 border-gray-200" />
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Penyakit</p>
                  <p>{{ member?.disease ?? '-' }}</p>
                </div>
                <div class="border w-full my-3 border-gray-200" />
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Club Lama</p>
                  <p>{{ member?.former_club ?? '-' }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Tahun Bergabung di Club</p>
                  <p>{{ member?.former_club_year ?? '-' }}</p>
                </div>
              </fieldset>
            </div>
            <div class="space-y-3">
              <fieldset class="border border-gray-300 rounded-lg shadow p-5 pt-3">
                <legend class="md:text-sm text-xs px-3">Informasi Umum</legend>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Iuran Bulanan</p>
                  <p>
                    {{
                      Number(member?.monthly_fee || 0).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    }}
                  </p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Status</p>
                  <p>{{ member?.status }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Bergabung Tanggal</p>
                  <p>{{ member?.join_date }}</p>
                </div>
              </fieldset>
              <fieldset class="border border-gray-300 rounded-lg shadow p-5 pt-3">
                <legend class="md:text-sm text-xs px-3">Informasi Orang Tua</legend>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Nama Orang Tua</p>
                  <p>{{ member?.parent_name }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Nomor Hp</p>
                  <p>{{ member?.parent_phone_number }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Email</p>
                  <p>{{ member?.parent_email }}</p>
                </div>
                <div class="flex justify-between md:text-sm text-xs">
                  <p class="">Alamat</p>
                  <p class="text-end max-w-1/2">{{ member?.parent_address }}</p>
                </div>
              </fieldset>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <router-link
              :to="{
                name: 'admin.member.edit',
                params: {
                  id: member?.id,
                },
              }"
              class="md:text-sm text-xs bg-rhino-900 text-white rounded-lg px-5 py-2 font-light cursor-pointer hover:opacity-90 transition-all duration-300 shadow-lg w-24 text-center"
            >
              Edit
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </AdminLayouts>
</template>
