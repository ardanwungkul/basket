<script setup>
import { useAuthStore } from '@/stores/auth'
import { Drawer, Menu } from 'primevue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Logo from '@/assets/images/logo.png'

const route = useRoute()
const profileMenu = ref()
const mobileSidebar = ref(false)
const profileMenuToggle = (event) => {
  profileMenu.value.toggle(event)
}

const authStore = useAuthStore()

async function logout() {
  authStore.logout()
}

const sideBarItems = ref([
  {
    icon: 'fa-solid fa-grid-2',
    label: 'Dashboard',
    to: 'admin.dashboard',
  },
  {
    icon: 'fa-solid fa-users-line',
    label: 'Member',
    to: 'admin.member.index',
  },
  {
    icon: 'fa-solid fa-users',
    label: 'User',
    to: 'admin.user.index',
  },
  {
    icon: 'fa-solid fa-money-bills',
    label: 'Tagihan',
    to: 'admin.bill.index',
  },
  {
    icon: 'fa-solid fa-money-check-dollar-pen',
    label: 'Pembayaran',
    to: 'admin.payment.index',
  },
  {
    icon: 'fa-solid fa-file',
    label: 'Laporan',
    to: 'admin.report.index',
  },
])

const props = defineProps({
  backRoute: {
    default: null,
  },
})
</script>
<template>
  <div class="min-h-screen w-full bg-gray-200 font-poppins">
    <div class="flex h-full w-full">
      <div class="p-3 h-full w-72 fixed left-0 top-0 flex-none hidden md:block">
        <div class="h-full bg-rhino-950 w-full rounded-lg p-3 flex flex-col gap-3 shadow-lg">
          <div class="border-b border-gray-300 h-16 flex items-center">
            <router-link
              :to="{ name: 'welcome' }"
              class="bg-white w-full rounded-lg p-1 flex items-center justify-center mb-3"
            >
              <img :src="Logo" class="h-11" alt="" />
            </router-link>
          </div>
          <div class="h-full overflow-y-scroll no-scrollbar">
            <div
              v-for="(item, index) in sideBarItems"
              :key="index"
              class="p-3 text-white rounded-lg hover:bg-piper-600 transition-all duration-300 cursor-pointer"
            >
              <router-link :to="{ name: item.to }" class="flex gap-3 items-center text-sm">
                <i :class="item.icon"></i>
                <p>{{ item.label }}</p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <Drawer
        v-model:visible="mobileSidebar"
        class="md:!hidden"
        :show-close-icon="false"
        :pt="{
          header: {
            class: '!hidden',
          },
          content: {
            class: '!p-0',
          },
          mask: {
            class: '!p-0',
          },
          root: {
            class: '!bg-transparent !border-none',
          },
        }"
      >
        <div class="h-full w-full">
          <div class="h-full bg-rhino-950 w-full rounded-r-lg p-3 flex flex-col gap-3 shadow-lg">
            <div class="border-b border-gray-300 h-16 flex items-center">
              <div
                class="justify-between flex items-center bg-white rounded-lg py-1 px-3 mb-3 w-full"
              >
                <router-link :to="{ name: 'welcome' }" class="flex items-center justify-center">
                  <img :src="Logo" class="h-11" alt="" />
                </router-link>
                <button
                  type="button"
                  @click="mobileSidebar = false"
                  class="cursor-pointer aspect-square group p-1 transition-all duration-300 hover:bg-piper-600 w-8 h-8 flex items-center justify-center rounded-full"
                >
                  <i class="fa-solid fa-x group-hover:text-white transition-all duration-300"></i>
                </button>
              </div>
            </div>
            <div class="h-full overflow-y-scroll no-scrollbar">
              <div
                v-for="(item, index) in sideBarItems"
                :key="index"
                class="p-3 text-white rounded-lg hover:bg-piper-600 transition-all duration-300 cursor-pointer"
              >
                <router-link :to="{ name: item.to }" class="flex gap-3 items-center text-sm">
                  <i :class="item.icon"></i>
                  <p>{{ item.label }}</p>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
      <div class="min-h-screen md:pl-72 pl-3 py-3 pr-3 w-full">
        <div
          class="w-full bg-rhino-950 h-16 rounded-lg shadow-lg flex items-center justify-between py-3 px-5"
        >
          <div class="flex gap-3 items-center w-full">
            <button
              class="flex items-center cursor-pointer md:hidden hover:bg-piper-600 p-3 rounded-lg transition-all duration-300"
              @click="mobileSidebar = true"
            >
              <i class="fa-solid fa-bars text-white text-lg"></i>
            </button>
            <router-link v-if="backRoute" :to="{ name: backRoute }">
              <div class="bg-piper-600 rounded-xl px-3 py-1">
                <svg
                  class="w-7 h-7"
                  viewBox="0 0 24 24"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <title>back_line</title>
                    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="Arrow" transform="translate(-240.000000, 0.000000)">
                        <g id="back_line" transform="translate(240.000000, 0.000000)">
                          <path
                            d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z"
                            id="MingCute"
                            fill-rule="nonzero"
                          ></path>
                          <path
                            d="M3.07615,5.61732 C3.23093,5.24364 3.59557,5 4.00003,5 L13.9999996,5 C17.866,5 20.9999996,8.13401 20.9999996,12 C20.9999996,15.866 17.866,19 13.9999996,19 L5.00003,19 C4.44774,19 4.00003,18.5523 4.00003,18 C4.00003,17.4477 4.44774,17 5.00003,17 L13.9999996,17 C16.7615,17 18.9999996,14.7614 18.9999996,12 C18.9999996,9.23858 16.7615,7 13.9999996,7 L6.41424,7 L8.20714,8.79289 C8.59766,9.18342 8.59766,9.81658 8.20714,10.2071 C7.81661,10.5976 7.18345,10.5976 6.79292,10.2071 L3.29292,6.70711 C3.00692,6.42111 2.92137,5.99099 3.07615,5.61732 Z"
                            id="路径"
                            fill="white"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            </router-link>
            <p
              class="text-white font-medium md:text-xl text-sm text-center md:text-start w-full line-clamp-1"
            >
              {{ route?.meta?.title }}
            </p>
          </div>
          <div class="flex gap-3">
            <div
              class="rounded-full w-7 h-7 bg-white flex items-center justify-center cursor-pointer"
              @click="profileMenuToggle"
            >
              <svg
                viewBox="0 0 24 24"
                class="w-6 h-6 fill-rhino-950"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_iconCarrier">
                  <circle cx="12" cy="6" r="4"></circle>
                  <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4"></ellipse>
                </g>
              </svg>
            </div>
            <Menu ref="profileMenu" :popup="true">
              <template #start>
                <div class="max-w-xs font-poppins">
                  <div class="border-b w-full border-gray-300">
                    <span class="inline-flex items-center gap-1 px-2 py-2 w-full">
                      <router-link
                        :to="{ name: 'welcome' }"
                        class="text-black flex items-center gap-2"
                      >
                        <img :src="Logo" class="h-7" alt="" />
                        <p class="text-xs font-medium text-gray-600">Victoria Basketball</p>
                      </router-link>
                    </span>
                  </div>
                  <div class="border-b w-full border-gray-300">
                    <div>
                      <router-link
                        :to="{ name: 'profile' }"
                        class="text-sm hover:bg-gray-100 w-full text-start p-2 transition-all duration-300 cursor-pointer flex items-center gap-2"
                      >
                        <div class="rounded-full w-7 h-7 flex items-center justify-center">
                          <i class="fa-solid fa-user text-gray-500"></i>
                        </div>
                        <p class="text-xs">Profile</p>
                      </router-link>
                      <button
                        @click="logout"
                        class="text-sm hover:bg-gray-100 w-full text-start p-2 transition-all duration-300 cursor-pointer flex items-center gap-2"
                      >
                        <div class="rounded-full w-7 h-7 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            class="fill-gray-500 w-6 h-6"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g id="SVGRepo_iconCarrier">
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M2 6.5C2 4.01472 4.01472 2 6.5 2H12C14.2091 2 16 3.79086 16 6V7C16 7.55228 15.5523 8 15 8C14.4477 8 14 7.55228 14 7V6C14 4.89543 13.1046 4 12 4H6.5C5.11929 4 4 5.11929 4 6.5V17.5C4 18.8807 5.11929 20 6.5 20H12C13.1046 20 14 19.1046 14 18V17C14 16.4477 14.4477 16 15 16C15.5523 16 16 16.4477 16 17V18C16 20.2091 14.2091 22 12 22H6.5C4.01472 22 2 19.9853 2 17.5V6.5ZM18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289L22.7071 11.2929C23.0976 11.6834 23.0976 12.3166 22.7071 12.7071L19.7071 15.7071C19.3166 16.0976 18.6834 16.0976 18.2929 15.7071C17.9024 15.3166 17.9024 14.6834 18.2929 14.2929L19.5858 13L11 13C10.4477 13 10 12.5523 10 12C10 11.4477 10.4477 11 11 11L19.5858 11L18.2929 9.70711C17.9024 9.31658 17.9024 8.68342 18.2929 8.29289Z"
                              ></path>
                            </g>
                          </svg>
                        </div>
                        <p class="text-xs">Logout</p>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
              <template #end>
                <div class="p-2 pt-0 flex gap-2 items-center max-w-xs font-poppins">
                  <div
                    class="rounded-full w-7 h-7 bg-white flex items-center justify-center border border-gray-300"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="w-6 h-6 fill-rhino-950"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_iconCarrier">
                        <circle cx="12" cy="6" r="4"></circle>
                        <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4"></ellipse>
                      </g>
                    </svg>
                  </div>
                  <div class="grid grid-cols-1">
                    <p class="text-xs line-clamp-1">
                      {{ authStore?.decryptedUserData?.name }}
                    </p>
                    <p class="text-xs line-clamp-1 font-medium">
                      {{ authStore?.decryptedUserData?.email }}
                    </p>
                  </div>
                </div>
              </template>
            </Menu>
          </div>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
