import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '../services/authService'
import { UserService } from '../services/userService'
import type { User, LoginForm, RegisterForm } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const session = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin')
  const userInitials = computed(() => {
    if (!user.value?.fullName) return 'U'
    return user.value.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  // 方法
  const login = async (credentials: LoginForm) => {
    try {
      loading.value = true
      error.value = null

      const result = await AuthService.login(credentials)
      user.value = result.user
      session.value = result.session

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterForm) => {
    try {
      loading.value = true
      error.value = null

      const result = await AuthService.register(userData)
      user.value = result.user
      session.value = result.session

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      await AuthService.logout()
      user.value = null
      session.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登出失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null

      await AuthService.forgotPassword(email)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送重置邮件失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (newPassword: string) => {
    try {
      loading.value = true
      error.value = null

      await AuthService.resetPassword(newPassword)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置密码失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData: any) => {
    try {
      loading.value = true
      error.value = null

      if (!user.value) throw new Error('用户未登录')

      const updatedUser = await UserService.updateProfile(user.value.id, profileData)
      user.value = updatedUser

      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新资料失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshSession = async () => {
    try {
      const newSession = await AuthService.refreshSession()
      session.value = newSession
      return newSession
    } catch (err) {
      console.error('刷新会话失败:', err)
      // 如果刷新失败，清除用户状态
      user.value = null
      session.value = null
      throw err
    }
  }

  const checkAuth = async () => {
    try {
      const currentUser = await UserService.getCurrentUser()
      const currentSession = await AuthService.getSession()

      if (currentUser && currentSession) {
        user.value = currentUser
        session.value = currentSession
        return true
      } else {
        user.value = null
        session.value = null
        return false
      }
    } catch (err) {
      console.error('检查认证状态失败:', err)
      user.value = null
      session.value = null
      return false
    }
  }

  const initialize = async () => {
    if (initialized.value) return

    try {
      loading.value = true
      await checkAuth()

      // 监听认证状态变化
      AuthService.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          checkAuth()
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          session.value = null
        } else if (event === 'TOKEN_REFRESHED') {
          session.value = session
        }
      })

      initialized.value = true
    } catch (err) {
      console.error('初始化认证状态失败:', err)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const requireAuth = () => {
    if (!isAuthenticated.value) {
      throw new Error('需要登录才能访问')
    }
  }

  const requireAdmin = () => {
    requireAuth()
    if (!isAdmin.value) {
      throw new Error('需要管理员权限')
    }
  }

  return {
    // 状态
    user,
    session,
    loading,
    error,
    initialized,

    // 计算属性
    isAuthenticated,
    isAdmin,
    userInitials,

    // 方法
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshSession,
    checkAuth,
    initialize,
    clearError,
    requireAuth,
    requireAdmin
  }
})
