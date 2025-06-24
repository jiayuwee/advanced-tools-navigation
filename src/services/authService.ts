import { supabase } from '../lib/supabase'
import { UserService } from './userService'
import type { User, LoginForm, RegisterForm, ApiResponse } from '../types'

export class AuthService {
  // 登录
  static async login(credentials: LoginForm): Promise<{ user: User; session: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error
      if (!data.user) throw new Error('登录失败')

      // 更新最后登录时间
      await UserService.updateLastLogin(data.user.id)

      // 获取用户资料
      const userProfile = await UserService.getCurrentUser()
      if (!userProfile) throw new Error('获取用户信息失败')

      return {
        user: userProfile,
        session: data.session
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw new Error(error instanceof Error ? error.message : '登录失败')
    }
  }

  // 注册
  static async register(userData: RegisterForm): Promise<{ user: User; session: any }> {
    try {
      // 检查用户名是否可用
      if (userData.username) {
        const isUsernameAvailable = await UserService.checkUsernameAvailability(userData.username)
        if (!isUsernameAvailable) {
          throw new Error('用户名已被使用')
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username
          }
        }
      })

      if (error) throw error
      if (!data.user) throw new Error('注册失败')

      // 创建用户资料
      const userProfile = await UserService.createUserProfile(data.user.id, userData.email)

      // 如果有额外信息，更新用户资料
      if (userData.fullName || userData.username) {
        const updatedProfile = await UserService.updateProfile(data.user.id, {
          fullName: userData.fullName,
          username: userData.username
        })
        
        return {
          user: updatedProfile,
          session: data.session
        }
      }

      return {
        user: userProfile,
        session: data.session
      }
    } catch (error) {
      console.error('注册失败:', error)
      throw new Error(error instanceof Error ? error.message : '注册失败')
    }
  }

  // 登出
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('登出失败:', error)
      throw new Error('登出失败')
    }
  }

  // 忘记密码
  static async forgotPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error
    } catch (error) {
      console.error('发送重置密码邮件失败:', error)
      throw new Error('发送重置密码邮件失败')
    }
  }

  // 重置密码
  static async resetPassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('重置密码失败:', error)
      throw new Error('重置密码失败')
    }
  }

  // 更改密码
  static async changePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('更改密码失败:', error)
      throw new Error('更改密码失败')
    }
  }

  // 更新邮箱
  static async updateEmail(newEmail: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error
    } catch (error) {
      console.error('更新邮箱失败:', error)
      throw new Error('更新邮箱失败')
    }
  }

  // 验证邮箱
  static async verifyEmail(token: string, type: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      })

      if (error) throw error
    } catch (error) {
      console.error('验证邮箱失败:', error)
      throw new Error('验证邮箱失败')
    }
  }

  // 重新发送验证邮件
  static async resendVerificationEmail(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!
      })

      if (error) throw error
    } catch (error) {
      console.error('重新发送验证邮件失败:', error)
      throw new Error('重新发送验证邮件失败')
    }
  }

  // 获取当前会话
  static async getSession(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('获取会话失败:', error)
      return null
    }
  }

  // 刷新会话
  static async refreshSession(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return data.session
    } catch (error) {
      console.error('刷新会话失败:', error)
      throw new Error('刷新会话失败')
    }
  }

  // 检查用户是否已登录
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch (error) {
      return false
    }
  }

  // 监听认证状态变化
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // 第三方登录 - Google
  static async signInWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Google 登录失败:', error)
      throw new Error('Google 登录失败')
    }
  }

  // 第三方登录 - GitHub
  static async signInWithGitHub(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('GitHub 登录失败:', error)
      throw new Error('GitHub 登录失败')
    }
  }

  // 删除账户
  static async deleteAccount(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('用户未登录')

      await UserService.deleteAccount(user.id)
    } catch (error) {
      console.error('删除账户失败:', error)
      throw new Error('删除账户失败')
    }
  }
}
