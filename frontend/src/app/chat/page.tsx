'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AgriChatbot from '@/components/AgriChatbot'

export default function ChatPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return <AgriChatbot />
}
