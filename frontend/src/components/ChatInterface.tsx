'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ReloadIcon, PaperPlaneIcon } from '@radix-ui/react-icons'

interface Message {
  text: string
  isUser: boolean
  data?: any
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { text: userMessage, isUser: true }])
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, { text: data.response, isUser: false, data: data.data }])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: 'Sorry, I encountered an error. Please try again.', isUser: false },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const renderData = (data: any) => {
    if (!data) return null

    const renderTable = (headers: string[], rows: any[]) => (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {Object.values(row).map((cell: any, j) => (
                  <td key={j} className="px-4 py-2 whitespace-nowrap text-gray-900">
                    {typeof cell === 'number' ? cell.toLocaleString() : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

    if (data.crop_sales) {
      return renderTable(['Crop', 'Estimated Sales', 'Value'], data.crop_sales)
    }
    if (data.zone_sales) {
      return renderTable(['Zone', 'Estimated Sales', 'Value'], data.zone_sales)
    }
    if (data.top_crops) {
      return renderTable(
        ['Crop', 'Estimated Sales'],
        Object.entries(data.top_crops).map(([crop, sales]) => ({ Crop: crop, Sales: sales }))
      )
    }
    if (data.distribution) {
      return renderTable(['Zone', 'Crop', 'Count'], data.distribution)
    }

    return null
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">Chat with Agri Assistant</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <ReloadIcon className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start gap-3`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                A
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.isUser
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {!message.isUser && renderData(message.data)}
            </div>
            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                U
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              A
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ReloadIcon className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about Agri operations..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <PaperPlaneIcon className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}
