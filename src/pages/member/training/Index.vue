<script setup>
import MemberLayouts from '@/layouts/MemberLayouts.vue'
import { ref, computed, onMounted } from 'vue'
import { useMemberStore } from '@/stores/member'

const memberStore = useMemberStore()

const members = ref([])
const loading = ref(true)

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

onMounted(async () => {
  loading.value = true
  await memberStore.getByParentId()
  members.value = memberStore.datas.filter((member) => member.status === 'active')
  loading.value = false
})
</script>

<template>
  <MemberLayouts>
    <div class="py-3 space-y-3">
      <div class="bg-white rounded-lg shadow px-5 py-6">
        <div v-if="loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-500">Memuat data anak...</p>
        </div>

        <div v-else-if="members.length > 0" class="space-y-4">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <router-link
              v-for="member in members"
              :key="member.id"
              :to="{ name: 'member.training.show', params: { id: member.id } }"
              class="cursor-pointer rounded-xl border-2 shadow-sm md:p-6 p-3 text-left transition-all duration-300 hover:shadow-lg hover:border-piper-500 hover:scale-105 md:min-h-[160px] flex flex-col justify-between bg-white border-gray-200 text-gray-700"
            >
              <div class="w-full">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i 
                      class="fas text-piper-500 text-lg" 
                      :class="member.gender === 'Laki Laki' ? 'fa-male' : 'fa-female'"
                    ></i>
                    <p class="font-semibold text-lg leading-tight line-clamp-2">{{ member.name }}</p>
                  </div>
                </div>

                <!-- Informasi Umur/KU -->
                <div class="space-y-2 text-sm text-gray-600">
                  <p class="flex items-center gap-2">
                    <i class="fas fa-birthday-cake text-gray-400 w-4"></i>
                    <span>Usia: {{ calculateAgeGroup(member.date_of_birth) }} tahun</span>
                  </p>
                  <p class="flex items-center gap-2">
                    <i class="fas fa-venus-mars text-gray-400 w-4"></i>
                    <span>{{ member.gender === 'Laki Laki' ? 'Laki-laki' : 'Perempuan' }}</span>
                  </p>
                </div>

                <!-- Status -->
                <div class="mt-4 flex justify-between items-center">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                  >
                    <i class="fas fa-check-circle mr-1"></i>
                    Aktif
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <i class="fas fa-child text-4xl mb-3 text-gray-300"></i>
          <p class="text-lg font-medium mb-2">Belum ada anak terdaftar</p>
          <p class="text-sm">Silakan tambahkan data anak untuk memulai</p>
        </div>
      </div>
    </div>
  </MemberLayouts>
</template>