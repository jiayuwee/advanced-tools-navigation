<template>
  <div 
    class="notification-item" 
    :class="{ 
      'is-unread': !notification.is_read,
      'is-important': notification.is_important,
      [`type-${notification.type}`]: true
    }"
  >
    <div class="notification-content">
      <div class="notification-header">
        <div class="notification-icon">
          <component :is="getTypeIcon()" class="icon" />
        </div>
        <div class="notification-meta">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
        </div>
        <div class="notification-actions">
          <button 
            v-if="!notification.is_read"
            @click="markAsRead"
            class="action-button read-button"
            title="标记为已读"
          >
            <CheckIcon class="icon" />
          </button>
          <button 
            @click="deleteNotification"
            class="action-button delete-button"
            title="删除通知"
          >
            <XIcon class="icon" />
          </button>
        </div>
      </div>
      
      <div class="notification-body">
        <p class="notification-message">{{ notification.message }}</p>
        
        <div v-if="notification.action_url" class="notification-action">
          <button 
            @click="handleAction"
            class="action-link"
          >
            {{ notification.action_text || '查看详情' }}
            <ExternalLinkIcon class="icon" />
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!notification.is_read" class="unread-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  InfoIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  XCircleIcon,
  BellIcon,
  PackageIcon,
  ShoppingCartIcon,
  CheckIcon,
  XIcon,
  ExternalLinkIcon
} from 'lucide-vue-next'
import type { Notification } from '@/services/notificationService'

interface Props {
  notification: Notification
}

interface Emits {
  (e: 'read', notificationId: string): void
  (e: 'delete', notificationId: string): void
  (e: 'action', notification: Notification): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取类型图标
const getTypeIcon = () => {
  switch (props.notification.type) {
    case 'success':
      return CheckCircleIcon
    case 'warning':
      return AlertTriangleIcon
    case 'error':
      return XCircleIcon
    case 'system':
      return BellIcon
    case 'product':
      return PackageIcon
    case 'order':
      return ShoppingCartIcon
    default:
      return InfoIcon
  }
}

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 方法
const markAsRead = () => {
  emit('read', props.notification.id)
}

const deleteNotification = () => {
  emit('delete', props.notification.id)
}

const handleAction = () => {
  emit('action', props.notification)
}
</script>

<style scoped>
.notification-item {
  position: relative;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background: var(--color-surface-hover);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.is-unread {
  background: rgba(var(--color-primary-rgb), 0.02);
}

.notification-item.is-important {
  border-left: 3px solid #f59e0b;
}

.notification-content {
  width: 100%;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.notification-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.125rem;
}

.type-info .notification-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.type-success .notification-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.type-warning .notification-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.type-error .notification-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.type-system .notification-icon {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.type-product .notification-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.type-order .notification-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.notification-icon .icon {
  width: 1rem;
  height: 1rem;
}

.notification-meta {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.read-button {
  color: var(--color-text-muted);
}

.read-button:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.delete-button {
  color: var(--color-text-muted);
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-button .icon {
  width: 0.875rem;
  height: 0.875rem;
}

.notification-body {
  margin-left: 2.75rem;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

.notification-action {
  margin-top: 0.75rem;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-link:hover {
  background: color-mix(in srgb, var(--color-primary) 90%, black);
  transform: translateY(-1px);
}

.action-link .icon {
  width: 0.75rem;
  height: 0.75rem;
}

.unread-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-primary);
  border-radius: 50%;
}

@media (max-width: 480px) {
  .notification-item {
    padding: 0.75rem 1rem;
  }
  
  .notification-header {
    gap: 0.5rem;
  }
  
  .notification-body {
    margin-left: 2.25rem;
  }
  
  .notification-actions {
    opacity: 1;
  }
}
</style>
