import { defineStore, acceptHMRUpdate } from 'pinia'
import api from '@/config/axios.js'
import { useUIStore } from '@/stores/ui'
import { useResponseStore } from './response'
import router from '@/router'

export const useReportStore = defineStore('report', {
  state: () => ({
    datas: [],
    ageGroupDatas: [],
    members: [],
    data: {},
  }),
  actions: {
    async getAgeGroup() {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get('/report/admin')
        this.ageGroupDatas = response.data.data
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
      } finally {
        uiStore.isLoading = false
      }
    },
    async getMemberByAge(age, year, type) {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get(`/report/admin/get-member-by-age/${age}/${year}/${type}`)
        this.members = response.data.data
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
      } finally {
        uiStore.isLoading = false
      }
    },
    async getByParentId(withRelations = '') {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get(
          '/getByAuth/bill' + (withRelations ? `?with=${withRelations}` : ''),
        )
        this.datas = response.data.data
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
      } finally {
        uiStore.isLoading = false
      }
    },
    async post(form) {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      const responseStore = useResponseStore()

      try {
        const response = await api.post('/bill', form)
        responseStore.addSuccess(response.data.message)
        router.push({
          name: 'payment.show',
          params: {
            id: response.data.data.id,
          },
        })
      } catch (error) {
        console.log(error)
        if (error.response && error.response.status !== 422) throw error
        const errors = error.response.data?.errors
        console.log('error', errors)
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
  import.meta.hot.accept(acceptHMRUpdate(useReportStore, import.meta.hot))
}
