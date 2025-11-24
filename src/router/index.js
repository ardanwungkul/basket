import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { createRouter, createWebHistory } from 'vue-router'

const adminRoutes = [
  {
    path: '/admin/dashboard',
    name: 'admin.dashboard',
    component: () => import('@/pages/admin/Dashboard.vue'),
    meta: {
      auth: true,
      title: 'Admin Dashboard',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/member',
    name: 'admin.member.index',
    component: () => import('@/pages/admin/member/Index.vue'),
    meta: {
      auth: true,
      title: 'Member',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/member/create',
    name: 'admin.member.create',
    component: () => import('@/pages/admin/member/Create.vue'),
    meta: {
      auth: true,
      title: 'Tambah Member',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/member/:id/edit',
    name: 'admin.member.edit',
    component: () => import('@/pages/admin/member/Edit.vue'),
    meta: {
      auth: true,
      title: 'Edit Data Member',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/member/:id',
    name: 'admin.member.show',
    component: () => import('@/pages/admin/member/Show.vue'),
    meta: {
      auth: true,
      title: 'Data Member',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/member/:id/verification',
    name: 'admin.member.verification',
    component: () => import('@/pages/admin/member/Verification.vue'),
    meta: {
      auth: true,
      title: 'Verifikasi Data Member',
      allowedRoles: ['admin'],
    },
  },

  {
    path: '/admin/user',
    name: 'admin.user.index',
    component: () => import('@/pages/admin/user/Index.vue'),
    meta: {
      auth: true,
      title: 'User',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/user/create',
    name: 'admin.user.create',
    component: () => import('@/pages/admin/user/Create.vue'),
    meta: {
      auth: true,
      title: 'Tambah User',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/user/:id/edit',
    name: 'admin.user.edit',
    component: () => import('@/pages/admin/user/Edit.vue'),
    meta: {
      auth: true,
      title: 'Edit Data User',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/payment',
    name: 'admin.payment.index',
    component: () => import('@/pages/admin/payment/Index.vue'),
    meta: {
      auth: true,
      title: 'Pembayaran',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/payment/:id',
    name: 'admin.payment.show',
    component: () => import('@/pages/admin/payment/Show.vue'),
    meta: {
      auth: true,
      title: 'Pembayaran',
      allowedRoles: ['admin'],
    },
  },
  {
    path: '/admin/bill',
    name: 'admin.bill.index',
    component: () => import('@/pages/admin/bill/Index.vue'),
    meta: {
      auth: true,
      title: 'Tagihan',
      allowedRoles: ['admin'],
    },
  },
]

const parentRoutes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/member/Dashboard.vue'),
    meta: {
      auth: true,
      title: 'Dashboard',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member',
    name: 'member.index',
    component: () => import('@/pages/member/member/Index.vue'),
    meta: {
      auth: true,
      title: 'Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/create',
    name: 'member.create',
    component: () => import('@/pages/member/member/Create.vue'),
    meta: {
      auth: true,
      title: 'Tambah Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/:id',
    name: 'member.show',
    component: () => import('@/pages/member/member/Show.vue'),
    meta: {
      auth: true,
      title: 'Data Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/:id/edit',
    name: 'member.edit',
    component: () => import('@/pages/member/member/Edit.vue'),
    meta: {
      auth: true,
      title: 'Edit Data Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/:id/verification',
    name: 'member.verification',
    component: () => import('@/pages/member/member/Verification.vue'),
    meta: {
      auth: true,
      title: 'Verifikasi Data Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/bill',
    name: 'bill.index',
    component: () => import('@/pages/member/bill/Index.vue'),
    meta: {
      auth: true,
      title: 'Tagihan',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/payment',
    name: 'payment.index',
    component: () => import('@/pages/member/payment/Index.vue'),
    meta: {
      auth: true,
      title: 'Pembayaran',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/payment/:id',
    name: 'payment.show',
    component: () => import('@/pages/member/payment/Show.vue'),
    meta: {
      auth: true,
      title: 'Pembayaran',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member',
    name: 'member.index',
    component: () => import('@/pages/member/member/Index.vue'),
    meta: {
      auth: true,
      title: 'Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/create',
    name: 'member.create',
    component: () => import('@/pages/member/member/Create.vue'),
    meta: {
      auth: true,
      title: 'Tambah Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/:id/edit',
    name: 'member.edit',
    component: () => import('@/pages/member/member/Edit.vue'),
    meta: {
      auth: true,
      title: 'Edit Data Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/member/:id/verification',
    name: 'member.verification',
    component: () => import('@/pages/member/member/Verification.vue'),
    meta: {
      auth: true,
      title: 'Verifikasi Data Member',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/training',
    name: 'member.training.index',
    component: () => import('@/pages/member/training/Index.vue'),
    meta: {
      auth: true,
      title: 'Daftar Jadwal Latihan',
      allowedRoles: ['parent'],
    },
  },
  {
    path: '/training/:id',
    name: 'member.training.show',
    component: () => import('@/pages/member/training/Show.vue'),
    meta: {
      auth: true,
      title: 'Jadwal Latihan',
      allowedRoles: ['parent'],
    },
  },
]

const coachRoutes = [
  {
    path: '/coach/dashboard',
    name: 'coach.dashboard',
    component: () => import('@/pages/coach/Dashboard.vue'),
    meta: {
      auth: true,
      title: 'Coach Dashboard',
      allowedRoles: ['coach'],
    },
  },
  {
    path: '/coach/attendance',
    name: 'coach.attendance.index',
    component: () => import('@/pages/coach/attendance/Index.vue'),
    meta: {
      auth: true,
      title: 'Jadwal Absensi',
      allowedRoles: ['coach'],
    },
  },
  {
    path: '/coach/attendance/:id',
    name: 'coach.attendance.show',
    component: () => import('@/pages/coach/attendance/Show.vue'),
    meta: {
      auth: true,
      title: 'Absensi',
      allowedRoles: ['coach'],
    },
  },
  {
    path: '/coach/attendance/history',
    name: 'coach.attendance.history.index',
    component: () => import('@/pages/coach/attendance/history/Index.vue'),
    meta: {
      auth: true,
      title: 'Riwayat Jadwal Latihan',
      allowedRoles: ['coach'],
    },
  },
   {
    path: '/coach/attendance/history/:id',
    name: 'coach.attendance.history.show',
    component: () => import('@/pages/coach/attendance/history/Show.vue'),
    meta: {
      auth: true,
      title: 'Riwayat Absensi',
      allowedRoles: ['coach'],
    },
  },
  {
    path: '/coach/training',
    name: 'coach.training.index',
    component: () => import('@/pages/coach/training/Index.vue'),
    meta: {
      auth: true,
      title: 'Jadwal Latihan',
      allowedRoles: ['coach'],
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...parentRoutes,
    ...adminRoutes,
    ...coachRoutes,
    {
      path: '/',
      name: 'welcome',
      component: () => import('@/pages/Welcome.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/Login.vue'),
      meta: {
        guest: true,
        title: 'Log in',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/Register.vue'),
      meta: {
        guest: true,
        title: 'Register',
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/Profile.vue'),
      meta: {
        auth: true,
        title: 'Profile',
      },
    },
  ],
})

// Loading
router.beforeEach((to, from, next) => {
  const ui = useUIStore()
  ui.startLoading()
  next()
})
router.afterEach(() => {
  const ui = useUIStore()
  setTimeout(() => ui.stopLoading(), 500)
})

// Auth Middleware
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('jwt_token')
  const isLoggedIn = !!token

  if (to.matched.some((record) => record.meta.auth)) {
    if (!isLoggedIn) {
      return next({ name: 'login' })
    }

    try {
      const authStore = useAuthStore()
      const data = authStore.decryptedUserData

      if (!data) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('userData')
        return next({ name: 'login' })
      }

      const userRole = data.role
      const allowedRoles = to.meta.allowedRoles

      if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'admin') {
          return next({ name: 'admin.dashboard' })
        } else if (userRole === 'coach') {
          return next({ name: 'coach.dashboard' })
        } else {
          return next({ name: 'dashboard' })
        }
        console.log('Akses ditolak: role tidak sesuai')
      }

      return next()
    } catch (err) {
      console.error('Terjadi error saat ambil data user:', err)
      return next({ name: 'login' })
    }
  } else if (to.matched.some((record) => record.meta.guest)) {
    if (isLoggedIn) {
      const authStore = useAuthStore()
      const data = authStore.decryptedUserData
      if (!data) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('userData')
        return next()
      }

      const userRole = data.role
      if (userRole === 'admin') {
        return next({ name: 'admin.dashboard' })
      } else if (userRole === 'coach') {
        return next({ name: 'coach.dashboard' })
      } else {
        return next({ name: 'dashboard' })
      }
    }
    return next()
  } else {
    return next()
  }
})

const APP_NAME = import.meta.env.VITE_APP_NAME
router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title)

  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.metaTags)

  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title + ' - ' + APP_NAME
  } else {
    document.title = APP_NAME
  }

  Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map((el) =>
    el.parentNode.removeChild(el),
  )

  if (!nearestWithMeta) return next()

  nearestWithMeta.meta.metaTags
    .map((tagDef) => {
      const tag = document.createElement('meta')

      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key])
      })

      tag.setAttribute('data-vue-router-controlled', '')

      return tag
    })

    .forEach((tag) => document.head.appendChild(tag))

  next()
})
export default router
