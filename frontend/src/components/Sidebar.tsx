'use client'

import { Button } from './ui/button'
import { ChatBubbleIcon, GearIcon, PersonIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { icon: ChatBubbleIcon, label: 'New Chat', href: '#' },
    { icon: ChatBubbleIcon, label: 'Chat History', href: '#' },
    { icon: PersonIcon, label: 'About Me', href: '#' },
    { icon: ExclamationTriangleIcon, label: 'Report Error', href: '#' },
    { icon: GearIcon, label: 'Settings', href: '#' },
  ]

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-semibold">A</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Agri Assistant</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Info */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Last login:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
