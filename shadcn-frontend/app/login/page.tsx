"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")

  const handleLogin = (e: React.FormEvent | React.KeyboardEvent) => {
    if (!name.trim()) return
    localStorage.setItem("username", name)
    router.push("/codecast")
  }

  // 處理鍵盤事件，按下 Enter 鍵送出訊息
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleLogin(e)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">歡迎來到CodeCast AI</h1>
        <Input
          className="w-[50%] h-[50%] flex items-center justify-center text-center line-height-1.5 mx-auto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}        
          placeholder="請輸入您的名字"
        />
        <Button onClick={handleLogin} className="w-[25%] h-[25%] flex items-center justify-center w-half mx-auto">
          開始使用
        </Button>
      </div>
    </div>
  )
}
