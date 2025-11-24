import { defineStore, acceptHMRUpdate } from 'pinia'
import api from '@/config/axios.js'
import { useUIStore } from '@/stores/ui'
import { useResponseStore } from '@/stores/response'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    datas: [],
    filters: {
      schedule: '',
      date: '',
      status: '',
    },
  }),

  getters: {
    filteredAttendances: (state) => {
      return state.datas.filter((attendance) => {
        let matches = true

        if (state.filters.schedule) {
          matches = matches && attendance.training_schedule_id === state.filters.schedule
        }

        if (state.filters.date) {
          matches = matches && attendance.date === state.filters.date
        }

        if (state.filters.status) {
          matches = matches && attendance.status === state.filters.status
        }

        return matches
      })
    },
  },

  actions: {
    async get(withRelations = '') {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get(
          '/attendance' + (withRelations ? `?with=${withRelations}` : ''),
        )
        this.datas = Array.isArray(response.data)
          ? response.data
          : response.data.data || []

      } catch (error) {
        console.error('Gagal mengambil data absensi:', error)
        throw error
      } finally {
        uiStore.isLoading = false
      }
    },


    async scanQRAttendance(encryptedMemberId, trainingScheduleId) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.startLoading()
      try {
        const res = await api.post('/attendance/scan-qr', {
          encrypted_member_id: encryptedMemberId,
          training_schedule_id: trainingScheduleId,
        })
        responseStore.addSuccess('Absensi QR Scan berhasil!')
        await this.get()
        return res.data
      } catch (error) {
        console.error('Gagal scan QR absensi:', error)
        const msg = error.response?.data?.message || 'Gagal melakukan absensi QR Scan'

        if (error.response?.status === 409) {
          // Member sudah absen
          responseStore.addError(msg)
        } else if (error.response?.status === 403) {
          // Member tidak aktif
          responseStore.addError(msg)
        } else if (error.response?.status === 422) {
          // KU tidak sesuai
          responseStore.addError(msg)
        } else {
          responseStore.addError(msg)
        }
        throw error
      } finally {
        uiStore.stopLoading()
      }
    },

    async addAttendance(form) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.startLoading()
      try {
        const payload = {
          ...form,
          training_schedule_id: form.training_schedule_id.toString()
        }

        const res = await api.post('/attendance', payload)
        responseStore.addSuccess('Absensi berhasil ditambahkan!')
        await this.get()
        return res.data
      } catch (error) {
        console.error('Gagal menambah absensi:', error)

        if (error.response?.status === 422) {
          // Validasi gagal - member tidak termasuk jadwal/KU tidak sesuai
          const msg = error.response.data?.message || 'Member tidak terdaftar dalam jadwal latihan ini'
          responseStore.addError(msg)
        } else if (error.response?.status === 403) {
          responseStore.addError(error.response.data?.message || 'Member tidak aktif')
        } else if (error.response?.status === 409) {
          responseStore.addError(error.response.data?.message || 'Member sudah absen')
        } else {
          responseStore.addError(error.response?.data?.message || 'Gagal menambah absensi')
        }
        throw error
      } finally {
        uiStore.stopLoading()
      }
    },

    async updateAttendance(id, form) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.startLoading()
      try {
        const res = await api.put(`/attendance/${id}`, form)
        responseStore.addSuccess('Data absensi berhasil diperbarui!')
        await this.get()
        return res.data
      } catch (error) {
        console.error('Gagal update absensi:', error)
        const msg = error.response?.data?.message || 'Gagal memperbarui data absensi'
        responseStore.addError(msg)
        throw error
      } finally {
        uiStore.stopLoading()
      }
    },

    async deleteAttendance(id) {
      const uiStore = useUIStore()
      const responseStore = useResponseStore()
      uiStore.startLoading()
      try {
        await api.delete(`/attendance/${id}`)
        responseStore.addSuccess('Absensi berhasil dihapus!')
        await this.get()
      } catch (error) {
        console.error('Gagal menghapus absensi:', error)
        const msg = error.response?.data?.message || 'Gagal menghapus data absensi'
        responseStore.addError(msg)
        throw error
      } finally {
        uiStore.stopLoading()
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        schedule: '',
        date: '',
        status: '',
      }
    },
    async getByParentId(withRelations = '') {
      const uiStore = useUIStore()
      uiStore.isLoading = true
      try {
        const response = await api.get(
          '/getByAuth/attendance' + (withRelations ? `?with=${withRelations}` : ''),
        )
        this.datas = Array.isArray(response.data)
          ? response.data
          : response.data.data || []
      } catch (error) {
        console.error('Gagal mengambil data absensi parent:', error)
        throw error
      } finally {
        uiStore.isLoading = false
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAttendanceStore, import.meta.hot))
}