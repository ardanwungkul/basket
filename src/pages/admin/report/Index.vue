<script setup>
import AdminLayouts from '@/layouts/AdminLayouts.vue'
import { Column, ColumnGroup, DataTable, DatePicker, InputText, Row, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useReportStore } from '@/stores/report'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const reportStore = useReportStore()
const loading = ref(true)

const datas = ref([])
const ageGroup = ref([])

const year = ref(new Date())
const selectedAgeGroup = ref('')
const selectedFilterType = ref({ type: 'attendance', label: 'Absensi' })
const dt = ref()

onMounted(async () => {
  await reportStore.getAgeGroup()
  loading.value = false
  ageGroup.value = reportStore.ageGroupDatas
})

async function getMembersByAge() {
  if (selectedAgeGroup.value && year.value && selectedFilterType.value) {
    loading.value = true
    datas.value = []
    const yearOnly = new Date(year.value).getFullYear()
    await reportStore.getMemberByAge(
      selectedAgeGroup.value.age,
      yearOnly,
      selectedFilterType.value.type,
    )

    if (selectedFilterType.value.type == 'attendance') {
      datas.value = reportStore.members.map((member) => {
        const months = {
          jan: [],
          feb: [],
          mar: [],
          apr: [],
          mei: [],
          jun: [],
          jul: [],
          agu: [],
          sep: [],
          okt: [],
          nov: [],
          des: [],
        }

        member?.attendance?.forEach((att) => {
          const monthIndex = new Date(att.date).getMonth()

          const monthKeys = [
            'jan',
            'feb',
            'mar',
            'apr',
            'mei',
            'jun',
            'jul',
            'agu',
            'sep',
            'okt',
            'nov',
            'des',
          ]
          const key = monthKeys[monthIndex]
          months[key].push(att)
        })

        return {
          id: member.id,
          name: member.name,
          date_of_birth: member.date_of_birth,
          parent_name: member.parent_name,
          parent_phone_number: member.parent_phone_number,
          sibling: member.sibling,
          ...months,
        }
      })
    } else if (selectedFilterType.value.type == 'payment') {
      datas.value = reportStore.members.map((member) => {
        const months = {
          jan: [],
          feb: [],
          mar: [],
          apr: [],
          mei: [],
          jun: [],
          jul: [],
          agu: [],
          sep: [],
          okt: [],
          nov: [],
          des: [],
        }

        member?.bill?.forEach((bill) => {
          const payment = bill?.payment_detail?.[0]?.payment

          if (!payment) return

          const paymentDate = new Date(payment.payment_date)
          const monthIndex = paymentDate.getMonth()

          const monthKeys = [
            'jan',
            'feb',
            'mar',
            'apr',
            'mei',
            'jun',
            'jul',
            'agu',
            'sep',
            'okt',
            'nov',
            'des',
          ]

          const key = monthKeys[monthIndex]
          months[key].push(bill)
        })

        return {
          id: member.id,
          name: member.name,
          date_of_birth: member.date_of_birth,
          parent_name: member.parent_name,
          parent_phone_number: member.parent_phone_number,
          sibling: member.sibling,
          ...months,
        }
      })
    }
    loading.value = false
  }
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const exportCsv = async () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Data Member')

  worksheet.columns = [
    { header: 'Nama', key: 'name', width: 30 },
    { header: 'Tanggal Lahir', key: 'date_of_birth', width: 20 },
    { header: 'Nama Orang Tua', key: 'parent_name', width: 20 },
    { header: 'No Orang Tua', key: 'parent_phone_number', width: 20 },
    { header: 'Sibling', key: 'sibling', width: 30 },
    { header: 'Jan', key: 'jan', width: 10 },
    { header: 'Feb', key: 'feb', width: 10 },
    { header: 'Mar', key: 'mar', width: 10 },
    { header: 'Apr', key: 'apr', width: 10 },
    { header: 'Mei', key: 'mei', width: 10 },
    { header: 'Jun', key: 'jun', width: 10 },
    { header: 'Jul', key: 'jul', width: 10 },
    { header: 'Agu', key: 'agu', width: 10 },
    { header: 'Sep', key: 'sep', width: 10 },
    { header: 'Okt', key: 'okt', width: 10 },
    { header: 'Nov', key: 'nov', width: 10 },
    { header: 'Des', key: 'des', width: 10 },
  ]

  worksheet.mergeCells('A1:A2')
  worksheet.mergeCells('B1:B2')
  worksheet.mergeCells('C1:C2')
  worksheet.mergeCells('D1:D2')
  worksheet.mergeCells('E1:E2')
  worksheet.mergeCells('F1:Q1')

  worksheet.getCell('A1').value = 'Nama'
  worksheet.getCell('B1').value = 'Tanggal Lahir'
  worksheet.getCell('C1').value = 'Nama Orang Tua'
  worksheet.getCell('D1').value = 'No Orang Tua'
  worksheet.getCell('E1').value = 'Sibling'
  worksheet.getCell('F1').value = 'Bulan'

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
  const monthCols = {
    jan: 6,
    feb: 7,
    mar: 8,
    apr: 9,
    mei: 10,
    jun: 11,
    jul: 12,
    agu: 13,
    sep: 14,
    okt: 15,
    nov: 16,
    des: 17,
  }
  months.forEach((month, idx) => {
    worksheet.getRow(2).getCell(6 + idx).value = month
  })

  const row1 = worksheet.getRow(1)
  row1.height = 20
  row1.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222d49' },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  })
  const row2 = worksheet.getRow(2)
  row2.height = 20
  row2.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '222d49' },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }
  })

  datas.value.forEach((item) => {
    const row = {
      name: item.name,
      date_of_birth: new Date(item.date_of_birth).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      parent_name: item.parent_name,
      parent_phone_number: item.parent_phone_number,
      sibling: item.sibling ? item.sibling.map((s) => s.name).join(', \n') : '',
      jan: item.jan.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      feb: item.feb.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      mar: item.mar.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      apr: item.apr.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      mei: item.mei.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      jun: item.jun.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      jul: item.jul.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      agu: item.agu.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      sep: item.sep.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      okt: item.okt.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      nov: item.nov.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
      des: item.des.map((itm) => {
        const date =
          selectedFilterType.value.type === 'attendance'
            ? new Date(itm.date).toLocaleDateString('id-ID', { day: '2-digit' })
            : new Date(itm?.payment_detail?.[0]?.payment?.payment_date).toLocaleDateString(
                'id-ID',
                { day: '2-digit' },
              )

        return {
          date,
          isPresent: selectedFilterType.value.type === 'attendance' && itm.status === 'present',
          isRegistration:
            selectedFilterType.value.type === 'payment' && itm?.bill_type === 'registration',
        }
      }),
    }
    worksheet.addRow(row)
  })

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 2) {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        if (colNumber === 1 || colNumber === 3 || colNumber === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
        }
      })
      Object.entries(monthCols).forEach(([key, col]) => {
        const raw = row.getCell(col).value

        if (Array.isArray(raw)) {
          row.getCell(col).value = {
            richText: raw.flatMap((d, idx) => {
              let color = 'FF000000'

              if (selectedFilterType.value.type === 'attendance') {
                color = d.isPresent ? 'FF00AA00' : 'FFFF0000'
              } else if (selectedFilterType.value.type === 'payment') {
                color = d.isRegistration ? 'FF0066FF' : 'FF00AA00'
              }

              return [
                {
                  text: d.date,
                  font: { color: { argb: color } },
                },
                ...(idx < raw.length - 1
                  ? [{ text: ', \n', font: { color: { argb: 'FF000000' } } }]
                  : []),
              ]
            }),
          }
        }
      })
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/octet-stream' })
  saveAs(blob, 'data_member.xlsx')
}
</script>
<template>
  <AdminLayouts>
    <div class="space-y-3">
      <div class="px-5 py-3 bg-white w-full rounded-lg shadow-lg mt-3">
        <div class="flex justify-between items-center">
          <div>
            <button
              class="cursor-pointer bg-rhino-950 w-10 h-10 rounded-lg shadow-lg text-white"
              @click="exportCsv"
            >
              <i class="fa-solid fa-file-csv"></i>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <div>
              <Select
                v-model="selectedFilterType"
                :options="[
                  { type: 'attendance', label: 'Absensi' },
                  { type: 'payment', label: 'Pembayaran' },
                ]"
                @change="getMembersByAge()"
                optionLabel="label"
                placeholder="Pilih Filter Laporan"
                empty-message="Tidak Ada Pilihan Tersedia"
                empty-filter-message="Hasil Tidak Ditemukan"
                :pt="{
                  optionLabel: {
                    class: '!text-xs',
                  },
                  root: {
                    class: '!bg-rhino-950 !min-w-[180px]',
                  },
                  label: {
                    class: '!text-xs !flex !items-center !p-2 !text-gray-300',
                  },
                  dropdownIcon: {
                    class: '!w-3 h-3',
                  },
                  pcFilter: {
                    root: {
                      class: '!text-xs',
                    },
                  },
                  filterIcon: {
                    class: '!w-3',
                  },
                  emptyMessage: {
                    class: '!text-xs !text-center',
                  },
                  overlay: {
                    class: '!w-[180px]',
                  },
                  header: {
                    class: '!p-2',
                  },
                }"
              >
              </Select>
            </div>
            <div>
              <Select
                v-model="selectedAgeGroup"
                :options="ageGroup"
                @change="getMembersByAge()"
                filter
                optionLabel="age"
                placeholder="Pilih Kelompok Umur"
                empty-message="Tidak Ada Pilihan Tersedia"
                empty-filter-message="Hasil Tidak Ditemukan"
                :pt="{
                  root: {
                    class: '!bg-rhino-950 !min-w-[180px]',
                  },
                  label: {
                    class: '!text-xs !flex !items-center !p-2 !text-gray-300',
                  },
                  dropdownIcon: {
                    class: '!w-3 h-3',
                  },
                  pcFilter: {
                    root: {
                      class: '!text-xs',
                    },
                  },
                  filterIcon: {
                    class: '!w-3',
                  },
                  emptyMessage: {
                    class: '!text-xs !text-center',
                  },
                  overlay: {
                    class: '!w-[180px]',
                  },
                  header: {
                    class: '!p-2',
                  },
                }"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex items-center">
                    <div class="flex items-center">
                      <div>
                        <p class="text-xs">Umur {{ slotProps.value.age }} Tahun</p>
                      </div>
                    </div>
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
                <template #option="slotProps">
                  <div class="flex items-center">
                    <div>
                      <p class="text-xs">Umur {{ slotProps.option.age }} Tahun</p>
                    </div>
                  </div>
                </template>
              </Select>
            </div>
            <div>
              <DatePicker
                :pt="{
                  pcInputText: {
                    root: {
                      class: '!rounded-lg !text-xs !p-2 !bg-rhino-950 !text-gray-300',
                    },
                  },
                  pcPrevButton: {
                    icon: {
                      class: '!w-2',
                    },
                    root: {
                      class: '!text-xs !p-1 !w-5 !h-5',
                    },
                  },
                  pcNextButton: {
                    icon: {
                      class: '!w-2',
                    },
                    root: {
                      class: '!text-xs !p-1 !w-5 !h-5',
                    },
                  },
                  header: {
                    class: '!text-xs',
                  },
                  year: {
                    class: '!text-xs',
                  },
                  inputIconContainer: {
                    class: '!text-xs',
                  },
                  inputIcon: {
                    class: '!w-3.5',
                  },
                }"
                dateFormat="yy"
                view="year"
                :min-date="new Date(2000, 0, 1)"
                :max-date="new Date()"
                v-model="year"
                inputId="filter_year"
                showIcon
                iconDisplay="input"
                variant="filled"
                @value-change="getMembersByAge()"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="!rounded-lg !overflow-hidden shadow bg-white">
        <DataTable
          ref="dt"
          v-model:filters="filters"
          :value="datas"
          paginator
          :rows="50"
          dataKey="id"
          :loading="loading"
          :pt="{
            thead: { class: 'text-xs !font-light' },
            tbody: { class: 'text-xs font-light' },
            pcPaginator: { content: { class: 'text-xs' } },
            headerCell: {
              class: '!mb-10',
            },
          }"
        >
          <ColumnGroup
            type="header"
            :pt="{
              root: {
                class: '!text-xs !whitespace-nowrap !bg-rhino-950',
              },
            }"
          >
            <Row>
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                }"
                header="Nama"
                :rowspan="2"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                }"
                header="Tanggal Lahir"
                :rowspan="2"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                }"
                header="Nama Orang Tua"
                :rowspan="2"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                }"
                header="No Orang Tua"
                :rowspan="2"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                }"
                header="Sibling"
                :rowspan="2"
              />
              <Column
                header="Bulan"
                class="!text-center"
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                }"
                :colspan="12"
              />
            </Row>
            <Row>
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Jan"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Feb"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Mar"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Apr"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Mei"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Jun"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Jul"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Agu"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Sep"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Okt"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Nov"
              />
              <Column
                :pt="{
                  headerCell: {
                    class: '!border !border-rhino-900 !bg-transparent !text-white',
                  },
                  columnTitle: {
                    class: '!font-medium',
                  },
                  columnHeaderContent: {
                    class: '!justify-center',
                  },
                }"
                header="Des"
              />
            </Row>
          </ColumnGroup>
          <Column
            field="name"
            :pt="{
              bodyCell: {
                class: '!whitespace-nowrap',
              },
            }"
          />
          <Column field="date_of_birth">
            <template #body="slotProps">
              <div class="text-center">
                {{
                  new Date(slotProps.data.date_of_birth).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                }}
              </div>
            </template>
          </Column>
          <Column field="parent_name" />
          <Column field="parent_phone_number" />
          <Column field="sibling">
            <template #body="slotProps">
              <ul v-if="slotProps.data.sibling" class="list-disc">
                <li v-for="(sibling, index) in slotProps.data.sibling" :key="index">
                  <div>
                    <router-link
                      target="_blank"
                      class="hover:text-blue-500 transition-all duration-300"
                      :to="{
                        name: 'admin.member.show',
                        params: {
                          id: sibling?.id,
                        },
                      }"
                      >{{ sibling?.name }}</router-link
                    >
                  </div>
                </li>
              </ul>
            </template></Column
          >
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-100',
              },
            }"
            field="jan"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.jan.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.jan" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.jan.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.jan" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-50',
              },
            }"
            field="feb"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.feb.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.feb" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.feb.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.feb" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-100',
              },
            }"
            field="mar"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.mar.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.mar" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.mar.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.mar" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-50',
              },
            }"
            field="apr"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.apr.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.apr" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.apr.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.apr" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-100',
              },
            }"
            field="mei"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.mei.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.mei" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.mei.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.mei" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-50',
              },
            }"
            field="jun"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.jun.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.jun" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.jun.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.jun" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-100',
              },
            }"
            field="jul"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.jul.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.jul" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.jul.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.jul" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-50',
              },
            }"
            field="agu"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.agu.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.agu" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.agu.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.agu" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-100',
              },
            }"
            field="sep"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.sep.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.sep" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.sep.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.sep" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-50',
              },
            }"
            field="okt"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.okt.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.okt" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.okt.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.okt" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-100',
              },
            }"
            field="nov"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.nov.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.nov" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.nov.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.nov" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            :pt="{
              bodyCell: {
                class: '!bg-gray-50',
              },
            }"
            field="des"
          >
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.des.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.des" :key="inx">
                    <p
                      v-tooltip="attendance.status == 'present' ? 'Hadir' : 'Absen'"
                      class="text-center"
                      :class="attendance.status == 'present' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{
                        new Date(attendance.date).toLocaleDateString('id-ID', {
                          day: '2-digit',
                        })
                      }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="selectedFilterType.type == 'payment'">
                <div v-if="slotProps.data.des.length > 0">
                  <div v-for="(bill, inx) in slotProps.data.des" :key="inx">
                    <p
                      v-tooltip="
                        bill?.bill_type == 'registration' ? 'Biaya Pendaftaran' : 'Iuran Bulanan'
                      "
                      class="text-center"
                      :class="
                        bill?.bill_type == 'registration' ? 'text-blue-500' : 'text-green-500'
                      "
                    >
                      {{
                        new Date(
                          bill?.payment_detail?.[0]?.payment?.payment_date,
                        ).toLocaleDateString('id-ID', { day: '2-digit' })
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center text-xs">
              <p>Tidak ada Data ditemukan.</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center text-xs">
              <p>Memuat data...</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </AdminLayouts>
</template>
