export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  parentId: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  likes: { userId: string }[]
  _count: {
    replies: number
  }
}

export interface Notification {
  id: string
  userId: string
  commentId: string
  type: 'REPLY' | 'LIKE' | 'MENTION'
  message: string
  isRead: boolean
  createdAt: string
  comment: {
    id: string
    content: string
    author: {
      username: string
    }
  }
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}