'use client'

import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback } from "./ui/avatar"

interface Message {
  text: string
  isUser: boolean
  data?: any
}

export function AgriChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setMessages(prev => [...prev, { text: userMessage, isUser: true }])
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage }),
      })

      const data = await response.json()
      setMessages(prev => [...prev, { text: data.response, isUser: false, data: data.data }])
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I encountered an error. Please try again.", isUser: false }])
    } finally {
      setIsLoading(false)
    }
  }

  const renderData = (data: any) => {
    if (!data) return null

    if (data.crop_sales) {
      return (
        <div className="mt-2 space-y-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Crop</th>
                <th className="px-4 py-2 text-right">Estimated Sales</th>
                <th className="px-4 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.crop_sales.map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2">{item.Crop}</td>
                  <td className="px-4 py-2 text-right">{item.CME.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{item.YTDPV.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                  <Avatar className={message.isUser ? "bg-green-500" : "bg-blue-500"}>
                    <AvatarFallback>
                      {message.isUser ? "U" : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg p-3 ${
                    message.isUser
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    {!message.isUser && renderData(message.data)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="bg-blue-500">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about sales data..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
