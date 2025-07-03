import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString()
}

export function canEditComment(createdAt: Date): boolean {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))
  return diffInMinutes <= 15
}

export function canRestoreComment(deletedAt: Date | null): boolean {
  if (!deletedAt) return false
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - deletedAt.getTime()) / (1000 * 60))
  return diffInMinutes <= 15
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}