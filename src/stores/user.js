import { defineStore } from 'pinia'
import { getProfile, login as loginApi, logout as logoutApi } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login(username, password) {
      try {
        const res = await loginApi(username, password)
        this.token = res.data.token
        this.userInfo = res.data.admin
        localStorage.setItem('admin_token', this.token)
        return res
      } catch (error) {
        throw error
      }
    },

    async fetchUserInfo() {
      try {
        const res = await getProfile()
        this.userInfo = res.data
        return res
      } catch (error) {
        this.logout()
        throw error
      }
    },

    async ensureProfileLoaded() {
      if (!this.token) {
        throw new Error('未登录')
      }
      if (this.userInfo) {
        return this.userInfo
      }
      const res = await this.fetchUserInfo()
      return res.data
    },

    logout() {
      if (this.token) {
        logoutApi().catch(() => {})
      }
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('admin_token')
    }
  }
})
