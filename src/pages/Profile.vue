<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useResponseStore } from '@/stores/response'
import MemberLayouts from '@/layouts/MemberLayouts.vue'
import CoachLayouts from '@/layouts/CoachLayouts.vue'
import AdminLayouts from '@/layouts/AdminLayouts.vue'

const authStore = useAuthStore()
const uiStore = useUIStore()
const responseStore = useResponseStore()

const profileForm = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const isLoading = ref(false)
const isEditing = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const errors = ref({})

const auth = computed(() => authStore.decryptedUserData)

const currentLayout = computed(() => {
  switch (auth.value?.role) {
    case 'parent':
      return MemberLayouts
    case 'coach':
      return CoachLayouts
    case 'admin':
      return AdminLayouts
    default:
      return MemberLayouts
  }
})

const pageTitle = computed(() => {
  switch (auth.value?.role) {
    case 'parent':
      return 'Profil Orang Tua'
    case 'coach':
      return 'Profil Pelatih'
    case 'admin':
      return 'Profil Admin'
    default:
      return 'Profil'
  }
})

function validateForm() {
  errors.value = {}

  if (!profileForm.value.name.trim()) {
    errors.value.name = 'Nama lengkap wajib diisi'
  }

  if (!profileForm.value.username.trim()) {
    errors.value.username = 'Username wajib diisi'
  }

  if (!profileForm.value.email.trim()) {
    errors.value.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    errors.value.email = 'Format email tidak valid'
  }

  // Validasi password hanya jika diisi
  if (profileForm.value.password) {
    if (profileForm.value.password.length < 6) {
      errors.value.password = 'Password minimal 6 karakter'
    } else if (profileForm.value.password !== profileForm.value.password_confirmation) {
      errors.value.password_confirmation = 'Konfirmasi password tidak sesuai'
    }
  }

  return Object.keys(errors.value).length === 0
}

function loadProfileData() {
  if (!auth.value) return
  profileForm.value = {
    name: auth.value.name || '',
    username: auth.value.username || '',
    email: auth.value.email || '',
    password: '',
    password_confirmation: ''
  }
  errors.value = {}
}

async function updateProfile() {
  if (!validateForm()) {
    responseStore.addError('Harap perbaiki kesalahan pada form')
    return
  }

  isLoading.value = true

  try {
    // Hanya kirim password jika diisi
    const formData = { ...profileForm.value }
    if (!formData.password) {
      delete formData.password
      delete formData.password_confirmation
    }

    await authStore.updateProfile(formData)

    isEditing.value = false
    profileForm.value.password = ''
    profileForm.value.password_confirmation = ''

  } catch (error) {
    console.error('Update profile error:', error)
  } finally {
    isLoading.value = false
  }
}

function enableEdit() {
  isEditing.value = true
  errors.value = {}
}

function cancelEdit() {
  loadProfileData()
  isEditing.value = false
  errors.value = {}
}

watch(auth, (newVal) => {
  if (newVal) loadProfileData()
}, { immediate: true })

onMounted(() => {
  loadProfileData()
})
</script>

<template>
  <component :is="currentLayout">
    <div class="py-6 space-y-6">
      <div class="rounded-lg bg-white shadow p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
            <p class="text-gray-600" v-if="!isEditing">Kelola informasi profil Anda</p>
            <p class="text-gray-600" v-else>Edit informasi profil Anda</p>
          </div>
          <button v-if="!isEditing" @click="enableEdit"
            class="flex items-center gap-2 text-sm bg-piper-600 text-white rounded-lg px-5 py-2.5 font-medium cursor-pointer hover:bg-piper-700 transition-all duration-300 shadow-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profil
          </button>
        </div>

        <!-- Tampilan View (Read-only) -->
        <div v-if="!isEditing" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nama Lengkap -->
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-2">
                Nama Lengkap
              </label>
              <div
                class="px-2.5 py-2 bg-gray-200 border border-gray-400 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500">
                {{ profileForm.name || '-' }}
              </div>
            </div>

            <!-- Username -->
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-2">
                Username
              </label>
              <div
                class="px-2.5 py-2 bg-gray-200 border border-gray-400 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500">
                {{ profileForm.username || '-' }}
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-2">
                Email
              </label>
              <div
                class="px-2.5 py-2 bg-gray-200 border border-gray-400 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500">
                {{ profileForm.email || '-' }}
              </div>
            </div>
          </div>

          <!-- Informasi Password -->
          <div class="bg-rhino-50 border border-rhino-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium">Informasi Keamanan:</p>
                <ul class="mt-1 list-disc list-inside space-y-1">
                  <li>Klik tombol "Edit Profil" untuk mengubah informasi pribadi</li>
                  <li>Password dapat diubah melalui form edit profil</li>
                  <li>Pastikan informasi yang Anda berikan selalu terbaru</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Tampilan Edit -->
        <form v-else @submit.prevent="updateProfile" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nama Lengkap -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span class="text-red-500">*</span>
              </label>
              <input v-model="profileForm.name" type="text" :class="[
               'px-2.5 py-2 border border-gray-300 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500',
                errors.name
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              ]" />
              <div v-if="errors.name" class="text-red-600 text-sm mt-1 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                {{ errors.name }}
              </div>
            </div>

            <!-- Username -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Username <span class="text-red-500">*</span>
              </label>
              <input v-model="profileForm.username" type="text" :class="[
                 'px-2.5 py-2 border border-gray-300 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500',
                errors.username
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              ]" />
              <div v-if="errors.username" class="text-red-600 text-sm mt-1 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                {{ errors.username }}
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input v-model="profileForm.email" type="email" :class="[
                 'px-2.5 py-2 border border-gray-300 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500',
                errors.email
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              ]" />
              <div v-if="errors.email" class="text-red-600 text-sm mt-1 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                {{ errors.email }}
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div class="relative">
                <input v-model="profileForm.password" :type="showPassword ? 'text' : 'password'"
                  placeholder="Kosongkan jika tidak ingin mengubah" :class="[
                     'px-2.5 py-2 border border-gray-300 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500',
                    errors.password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  ]" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div v-if="errors.password" class="text-red-600 text-sm mt-1 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                {{ errors.password }}
              </div>
            </div>

            <!-- Konfirmasi Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div class="relative">
                <input v-model="profileForm.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Konfirmasi password baru" :class="[
                     'px-2.5 py-2 border border-gray-300 shadow md:text-sm text-xs rounded-lg w-full focus:outline-1 focus:outline-gray-500',
                    errors.password_confirmation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  ]" />
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showConfirmPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div v-if="errors.password_confirmation" class="text-red-600 text-sm mt-1 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                {{ errors.password_confirmation }}
              </div>
            </div>
          </div>

          <!-- Informasi Password -->
          <div class="bg-rhino-50 border border-rhino-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-blue-800">
                <p class="font-medium">Informasi Password:</p>
                <ul class="mt-1 list-disc list-inside space-y-1">
                  <li>Kosongkan field password jika tidak ingin mengubah password</li>
                  <li>Password minimal 6 karakter</li>
                  <li>Pastikan konfirmasi password sesuai dengan password baru</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="flex gap-3 pt-6 border-t border-gray-200">
            <button type="submit" :disabled="isLoading"
              class="flex items-center gap-2 text-sm bg-piper-600 text-white rounded-lg px-5 py-2.5 font-medium cursor-pointer hover:bg-piper-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
            </button>

            <button type="button" @click="cancelEdit" :disabled="isLoading"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-5 py-2.5 font-medium cursor-pointer transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  </component>
</template>