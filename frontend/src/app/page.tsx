'use client'

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  Send,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  PlusCircle,
  History,
  User,
  AlertTriangle,
  Paperclip,
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"

interface Message {
  role: 'user' | 'bot'
  content: string
  data?: any
}

function AgriChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Welcome to the Agricultural Data Assistant! How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [suggestions] = useState([
    'Show total sales',
    'Show sales by crop',
    'Show sales by zone',
    'Show top performing crops',
    'Show crop distribution'
  ])
  const { theme, toggleTheme } = useTheme()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num)
  }

  const formatData = (data: any) => {
    if (!data) return null

    if (data.total_estimated !== undefined) {
      return (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Total Estimated Sales:</span>
                <span className="text-green-600 dark:text-green-400">{formatNumber(data.total_estimated)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value:</span>
                <span className="text-green-600 dark:text-green-400">{formatNumber(data.total_value)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (data.crop_sales) {
      return (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Crop</th>
                    <th className="text-right pb-2">Estimated Sales</th>
                    <th className="text-right pb-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.crop_sales.map((item: any, index: number) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{item.Crop}</td>
                      <td className="text-right py-2 text-green-600 dark:text-green-400">{formatNumber(item.CME)}</td>
                      <td className="text-right py-2 text-green-600 dark:text-green-400">{formatNumber(item.YTDPV || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (data.zone_sales) {
      return (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Zone</th>
                    <th className="text-right pb-2">Estimated Sales</th>
                    <th className="text-right pb-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.zone_sales.map((item: any, index: number) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{item.ZO}</td>
                      <td className="text-right py-2 text-green-600 dark:text-green-400">{formatNumber(item.CME)}</td>
                      <td className="text-right py-2 text-green-600 dark:text-green-400">{formatNumber(item.YTDPV || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (data.top_crops) {
      return (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Top Performing Crops:</h3>
            <div className="space-y-2">
              {Object.entries(data.top_crops).map(([crop, value]: [string, any], index: number) => (
                <div key={crop} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span>{index + 1}. {crop}</span>
                  <span className="text-green-600 dark:text-green-400">{formatNumber(value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (data.distribution) {
      return (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Zone</th>
                    <th className="text-left pb-2">Crop</th>
                    <th className="text-right pb-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.distribution.map((item: any, index: number) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{item.ZO}</td>
                      <td className="py-2">{item.Crop}</td>
                      <td className="text-right py-2 text-green-600 dark:text-green-400">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        text: userMessage
      })

      setMessages(prev => [...prev, {
        role: 'bot',
        content: response.data.response,
        data: response.data.data
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again. If this persists, please check if the backend server is running.'
      }])
    }

    setIsLoading(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" className="fill-green-500" />
                  <path
                    d="M8 12L11 15L16 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 className="text-xl font-bold">Agri Assistant</h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-4"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <History className="mr-2 h-4 w-4" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 flex items-center px-6 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start max-w-[80%] space-x-2">
                  <Avatar className={message.role === 'user' ? 'order-2' : ''}>
                    <AvatarFallback>
                      {message.role === 'user' ? <User className="h-5 w-5" /> : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={message.role === 'user' ? 'order-1' : ''}>
                    <Card>
                      <CardContent className="p-3">
                        <p>{message.content}</p>
                        {message.data && formatData(message.data)}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <Card>
                    <CardContent className="p-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your query here..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ThemedAgriChatbot() {
  return (
    <ThemeProvider>
      <AgriChatbot />
    </ThemeProvider>
  )
}
