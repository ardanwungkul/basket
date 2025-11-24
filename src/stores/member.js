import { defineStore, acceptHMRUpdate } from 'pinia'
import api from '@/config/axios.js'
import { useUIStore } from '@/stores/ui'
import { useResponseStore } from './response'
import router from '@/router'
import { useAuthStore } from './auth'

export const useMemberStore = defineStore('member', {
  state: () => ({
    datas: [],
    data: {},
  }),
  actions: {
    async getByParentId(withRelations = '') {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get(
          '/getByAuth/member' + (withRelations ? `?with=${withRelations}` : ''),
        )
        this.datas = response.data.data
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
      } finally {
        uiStore.isLoading = false
      }
    },
    async getById(id, withRelations = '') {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get(
          '/member/' + id + (withRelations ? `?with=${withRelations}` : ''),
        )
        this.data = response.data.data
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
      } finally {
        uiStore.isLoading = false
      }
    },
    async get(withRelations = '') {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get('/member' + (withRelations ? `?with=${withRelations}` : ''))
        this.datas = response.data.data
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
      } finally {
        uiStore.isLoading = false
      }
    },

    async post(form, isNext) {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      const responseStore = useResponseStore()
      const authStore = useAuthStore()

      try {
        const response = await api.post('/member', form)
        responseStore.addSuccess(response.data.message)
        if (isNext) {
          router.push({
            name: 'member.verification',
            params: {
              id: response.data.data.id,
            },
          })
        } else {
          if (authStore.decryptedUserData.role == 'admin') {
            router.push({ name: 'admin.member.index' })
          } else {
            router.push({ name: 'member.index' })
          }
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
    async update(form, id) {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      const responseStore = useResponseStore()
      const authStore = useAuthStore()
      const auth = authStore.decryptedUserData

      try {
        const response = await api.put('/member/' + id, form)
        responseStore.addSuccess(response.data.message)
        if(auth.role == 'admin'){
          router.push({ name: 'admin.member.index' })
        }else{
          router.push({ name: 'member.index' })
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
    async destroy(id) {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      const responseStore = useResponseStore()

      try {
        const response = await api.delete('/member/' + id)
        responseStore.addSuccess(response.data.message)
        this.datas = this.datas.filter((data) => data.id !== id)
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
    async verificationFiles(form) {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      const responseStore = useResponseStore()
      try {
        const formData = new FormData()
        formData.append('member_id', form.member_id)
        formData.append('is_have_bpjs', form.is_have_bpjs ? '1' : '0')
        if (form.photo) formData.append('photo', form.photo)
        if (form.birth_certificate) formData.append('birth_certificate', form.birth_certificate)
        if (form.family_card) formData.append('family_card', form.family_card)
        if (form.club_release_letter)
          formData.append('club_release_letter', form.club_release_letter)
        if (form.bpjs) formData.append('bpjs', form.bpjs)

        const response = await api.post('/member-verification', formData)
        responseStore.addSuccess(response.data.message)
        router.push({ name: 'member.index' })
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
  },
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMemberStore, import.meta.hot))
}
