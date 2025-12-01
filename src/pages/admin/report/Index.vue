<script setup>
import AdminLayouts from '@/layouts/AdminLayouts.vue'
import { Column, ColumnGroup, DataTable, DatePicker, InputText, Row, Select } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useReportStore } from '@/stores/report'

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

        member.attendance.forEach((att) => {
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
      datas.value = [{ name: 'ardan' }]
    }
    loading.value = false
  }
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const exportCsv = () => {
  dt.value.exportCSV({ fileName: 'data_member.csv' })
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
                    <p>{{ sibling?.name }}</p>
                  </div>
                </li>
              </ul>
            </template></Column
          >
          <Column field="jan">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.jan.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.jan" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="feb">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.feb.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.feb" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="mar">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.mar.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.mar" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="apr">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.apr.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.apr" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="mei">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.mei.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.mei" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="jun">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.jun.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.jun" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="jul">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.jul.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.jul" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="agu">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.agu.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.agu" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="sep">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.sep.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.sep" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="okt">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.okt.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.okt" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="nov">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.nov.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.nov" :key="inx">
                    <p
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
            </template>
          </Column>
          <Column field="des">
            <template #body="slotProps">
              <div v-if="selectedFilterType.type == 'attendance'">
                <div v-if="slotProps.data.des.length > 0">
                  <div v-for="(attendance, inx) in slotProps.data.des" :key="inx">
                    <p
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
