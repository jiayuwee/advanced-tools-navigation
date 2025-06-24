import { supabase } from '../lib/supabase'
import type { User, ProfileForm, ApiResponse } from '../types'
import type { Database } from '../types/database'

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export class UserService {
  // 获取当前用户信息
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // 如果用户资料不存在，创建一个
        if (error.code === 'PGRST116') {
          return this.createUserProfile(user.id, user.email!)
        }
        throw error
      }

      return this.transformUser(profile)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 获取用户资料
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      if (!data) return null

      return this.transformUser(data)
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return null
    }
  }

  // 更新用户资料
  static async updateProfile(userId: string, profileData: ProfileForm): Promise<User> {
    try {
      const updateData: UserProfileUpdate = {
        full_name: profileData.fullName,
        username: profileData.username,
        bio: profileData.bio,
        website: profileData.website,
        location: profileData.location,
        updated_at: new Date().toISOString()
      }

      // 如果有头像文件，先上传
      if (profileData.avatar) {
        const avatarUrl = await this.uploadAvatar(userId, profileData.avatar)
        updateData.avatar_url = avatarUrl
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .single()

      if (error) throw error
      if (!data) throw new Error('更新用户资料失败')

      return this.transformUser(data)
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw new Error('更新用户资料失败')
    }
  }

  // 创建用户资料
  static async createUserProfile(userId: string, email: string): Promise<User> {
    try {
      const profileData: UserProfileInsert = {
        id: userId,
        email,
        role: 'user',
        is_active: true,
        email_verified: false
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select('*')
        .single()

      if (error) throw error
      if (!data) throw new Error('创建用户资料失败')

      return this.transformUser(data)
    } catch (error) {
      console.error('创建用户资料失败:', error)
      throw new Error('创建用户资料失败')
    }
  }

  // 上传头像
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 删除旧头像
      const { data: oldFiles } = await supabase.storage
        .from('avatars')
        .list('', {
          search: userId
        })

      if (oldFiles && oldFiles.length > 0) {
        const filesToRemove = oldFiles.map(file => file.name)
        await supabase.storage
          .from('avatars')
          .remove(filesToRemove)
      }

      // 上传新头像
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('上传头像失败:', error)
      throw new Error('上传头像失败')
    }
  }

  // 更新最后登录时间
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('更新最后登录时间失败:', error)
    }
  }

  // 检查用户名是否可用
  static async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error

      return !data || data.length === 0
    } catch (error) {
      console.error('检查用户名可用性失败:', error)
      return false
    }
  }

  // 获取用户统计信息
  static async getUserStats(userId: string): Promise<{
    favoriteToolsCount: number
    favoriteProductsCount: number
    ordersCount: number
    totalSpent: number
  }> {
    try {
      const [favoritesResult, ordersResult] = await Promise.all([
        supabase
          .from('favorites')
          .select('tool_id, product_id')
          .eq('user_id', userId),
        supabase
          .from('orders')
          .select('total_amount, status')
          .eq('user_id', userId)
      ])

      const favorites = favoritesResult.data || []
      const orders = ordersResult.data || []

      const favoriteToolsCount = favorites.filter(f => f.tool_id).length
      const favoriteProductsCount = favorites.filter(f => f.product_id).length
      const ordersCount = orders.length
      const totalSpent = orders
        .filter(order => order.status === 'paid')
        .reduce((sum, order) => sum + order.total_amount, 0)

      return {
        favoriteToolsCount,
        favoriteProductsCount,
        ordersCount,
        totalSpent
      }
    } catch (error) {
      console.error('获取用户统计信息失败:', error)
      return {
        favoriteToolsCount: 0,
        favoriteProductsCount: 0,
        ordersCount: 0,
        totalSpent: 0
      }
    }
  }

  // 删除用户账户
  static async deleteAccount(userId: string): Promise<void> {
    try {
      // 删除用户相关数据
      await Promise.all([
        supabase.from('favorites').delete().eq('user_id', userId),
        supabase.from('orders').delete().eq('user_id', userId),
        supabase.from('user_profiles').delete().eq('id', userId)
      ])

      // 删除用户认证账户
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
    } catch (error) {
      console.error('删除用户账户失败:', error)
      throw new Error('删除用户账户失败')
    }
  }

  // 转换数据库行为业务对象
  private static transformUser(row: UserProfileRow): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      website: row.website,
      location: row.location,
      role: row.role,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    }
  }
}
