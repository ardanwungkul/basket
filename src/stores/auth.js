import { defineStore, acceptHMRUpdate } from 'pinia'
import { useStorage } from '@vueuse/core'
import api from '@/config/axios.js'
import router from '@/router'
import { useUIStore } from '@/stores/ui'
import CryptoJS from 'crypto-js'
import { useResponseStore } from './response'

const key = import.meta.env.VITE_APP_CRYPTO_KEY

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: [],
    userData: [],
    encryptedUserData: useStorage('userData', null),
    token: useStorage('jwt_token'),
  }),
  getters: {
    authStatus: (state) => !!state.token,
    decryptedUserData(state) {
      if (!state.encryptedUserData) return null
      try {
        const bytes = CryptoJS.AES.decrypt(state.encryptedUserData, key)
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
        return JSON.parse(decryptedStr)
      } catch (e) {
        console.error('Decryption error:', e)
        return null
      }
    },
  },
  actions: {
    async getUserData() {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get('/user')
        this.user = response.data.user
      } catch (error) {
        console.log(error)
      } finally {
        uiStore.isLoading = false
      }
    },

    async login(form) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.isLoading = true

      try {
        const response = await api.post('/login', form)

        const fullUserObject = response.data.user
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(fullUserObject), key).toString()

        this.encryptedUserData = encrypted
        this.token = response.data.token

        const userRole = fullUserObject.role
        if (userRole === 'admin') {
          router.push({ name: 'admin.dashboard' })
        } else {
          router.push({ name: 'dashboard' })
        }
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
        const errors = error.response.data?.errors
        Object.values(errors).forEach((fieldErrors) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((err) => responseStore.addError(err))
          }
        })
      } finally {
        uiStore.isLoading = false
      }
    },

    async register(form) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.isLoading = true
      try {
        const response = await api.post('/register', form)
        const fullUserObject = response.data.user
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(fullUserObject), key).toString()
        this.encryptedUserData = encrypted
        this.token = response.data.token
        router.push({ name: 'dashboard' })
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
        const errors = error.response.data?.errors
        Object.values(errors).forEach((fieldErrors) => {
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((err) => responseStore.addError(err))
          }
        })
      } finally {
        uiStore.isLoading = false
      }
    },

    // Profile
    async updateProfile(formData) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.isLoading = true

      try {
        const response = await api.put('profile', formData)

        // Update encrypted user data dengan data terbaru
        const updatedUser = { ...this.decryptedUserData, ...response.data.user }
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(updatedUser), key).toString()
        this.encryptedUserData = encrypted

        return { success: true, data: response.data }
      } catch (error) {
        console.log('Update profile error:', error)

        if (error.response && error.response.status === 422) {
          const errors = error.response.data?.errors
          if (errors) {
            Object.values(errors).forEach((fieldErrors) => {
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((err) => responseStore.addError(err))
              }
            })
          }
          return {
            success: false,
            error: error.response.data?.message || 'Terjadi kesalahan validasi'
          }
        } else if (error.response && error.response.status === 401) {
          // Token expired or invalid - redirect to login
          this.logout()
          return {
            success: false,
            error: 'Sesi telah berakhir. Silakan login kembali.'
          }
        } else if (error.response && error.response.status === 404) {
          return {
            success: false,
            error: 'User tidak ditemukan'
          }
        }

        throw error
      } finally {
        uiStore.isLoading = false
      }
    },

    async logout() {
      const uiStore = useUIStore()
      uiStore.startLoading()
      this.encryptedUserData = null
      this.token = null
      uiStore.stopLoading()

      router.push({ name: 'login' })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}