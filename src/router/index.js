import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/switchshare',
    component: () => import('@/views/switch/switch-share'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'SriLanka', icon: 'dashboard' }
    }]
  },

  {
    path: '/switch',
    component: Layout,
    redirect: '/switch/switch',
    name: 'Switch',
    meta: { title: '开关管理', icon: 'el-icon-fork-spoon' },
    children: [
      {
        path: 'switch',
        name: '新建开关',
        component: () => import('@/views/switch/switch'),
        meta: { title: '新建开关', icon: 'el-icon-food' }
      },
      {
        path: 'switch-list',
        name: '我的开关',
        component: () => import('@/views/switch/switch-list'),
        meta: { title: '我的开关', icon: 'el-icon-cherry' }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/product',
    name: 'Admin',
    meta: { title: '后台管理', icon: 'el-icon-s-help', roles: ['admin', 'editor'] },
    children: [
      {
        path: 'product',
        component: () => import('@/views/admin/product'),
        name: 'product',
        meta: { title: '产品管理', icon: 'el-icon-hot-water' }
      },
      {
        path: 'project',
        component: () => import('@/views/admin/project'),
        name: 'project',
        meta: { title: '项目管理', icon: 'el-icon-ice-tea' }
      },
      {
        path: 'version',
        name: 'version',
        component: () => import('@/views/admin/version'),
        meta: { title: '版本管理', icon: 'el-icon-pear' }
      },
      {
        path: 'switch_template',
        name: 'switch_template',
        component: () => import('@/views/admin/switch-template'),
        meta: { title: '开关模板管理', icon: 'el-icon-goblet-full' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'User',
    meta: { title: '系统管理', icon: 'el-icon-setting', roles: ['admin'] },
    children: [
      {
        path: 'user',
        name: '用户管理',
        component: () => import('@/views/system/user'),
        meta: { title: '用户管理', icon: 'el-icon-user' }
      },
      {
        path: 'role',
        name: '角色管理',
        component: () => import('@/views/system/role'),
        meta: { title: '角色管理', icon: 'el-icon-user-solid' }
      }
    ]
  },
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: '帮助文档', icon: 'link' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
