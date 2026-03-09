import { defineStore } from 'pinia'
import { login as loginApi, getProfile } from '../api/auth'

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

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('admin_token')
    }
  }
})
