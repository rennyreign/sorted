"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Clock, CheckCircle, Loader2 } from "lucide-react"

// Client-specific configuration
const CLIENT_CONFIG = {
  name: "{{CLIENT_NAME}}",
  siteUrl: "{{CLIENT_SITE_URL}}",
  operatorId: "{{OPERATOR_ID}}",
  apiEndpoint: "{{API_ENDPOINT}}",
  brand: {
    primaryColor: "{{PRIMARY_COLOR}}",
    logo: "{{LOGO_URL}}",
  }
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  status?: "typing" | "sent" | "error"
  attachments?: string[]
}

export default function ClientUpdatesPortal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your Sorted Updates agent for ${CLIENT_CONFIG.name}. What would you like to change?`,
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<"instant" | "preview">("instant")
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "(attachments only)",
      attachments: attachments.map(f => f.name),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setAttachments([])
    setIsProcessing(true)

    // TODO: Connect to Sorted Updates API
    // const response = await fetch(CLIENT_CONFIG.apiEndpoint, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     message: input,
    //     mode,
    //     attachments: attachments.map(f => f.name),
    //     clientId: CLIENT_CONFIG.operatorId,
    //   }),
    // })

    // Simulate for now
    setTimeout(() => {
      const isSafeChange = input.length < 100 && 
        !input.toLowerCase().includes("pricing") && 
        !input.toLowerCase().includes("legal")
      const autoApply = mode === "instant" && isSafeChange

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: autoApply
          ? "Sorted — safe change detected. Applying now. Live in ~30s."
          : mode === "instant"
          ? "This looks like it needs a preview first. Preparing now — you'll have a link in ~30s."
          : "Preview ready. Here's your private link: [preview-link]. Review and click apply when ready.",
        status: "sent",
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsProcessing(false)

      if (autoApply) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: `Done: ${CLIENT_CONFIG.siteUrl}`,
              status: "sent",
            },
          ])
        }, 3000)
      }
    }, 1500)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/[0.06] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-sans font-bold text-[#0A0A0A] text-lg">Sorted Updates</h1>
            <p className="text-[#525252] text-xs">{CLIENT_CONFIG.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? "bg-yellow-500 animate-pulse" : "bg-[#25D366]"}`} />
            <span className="text-[#525252] text-xs">{isProcessing ? "Working..." : "Ready"}</span>
          </div>
        </div>
      </header>

      {/* Mode Toggle */}
      <div className="bg-white border-b border-black/[0.06] px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <span className="text-[#525252] text-xs font-medium">Mode:</span>
          <div className="flex bg-[#F5F5F5] rounded-lg p-1">
            <button
              onClick={() => setMode("instant")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === "instant"
                  ? "bg-white text-[#0A0A0A] shadow-sm"
                  : "text-[#525252] hover:text-[#0A0A0A]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Apply now
              </span>
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === "preview"
                  ? "bg-white text-[#0A0A0A] shadow-sm"
                  : "text-[#525252] hover:text-[#0A0A0A]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Preview first
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#0A0A0A] text-white"
                    : "bg-white border border-black/[0.06] text-[#0A0A0A]"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((name, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs ${
                          message.role === "user" ? "text-white/70" : "text-[#525252]"
                        }`}
                      >
                        <Paperclip className="w-3 h-3" />
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-black/[0.06] rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#525252]" />
                <span className="text-[#525252] text-sm">Working on it...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-black/[0.06] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-1.5 text-xs"
                >
                  <Paperclip className="w-3 h-3 text-[#525252]" />
                  <span className="text-[#0A0A0A]">{file.name}</span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-[#525252] hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-black/[0.06] hover:bg-[#F5F5F5] transition-colors"
            >
              <Paperclip className="w-5 h-5 text-[#525252]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="What do you need changed?"
                className="w-full rounded-xl border border-black/[0.06] bg-[#FAFAFA] px-4 py-3 pr-12 text-sm placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/20 resize-none min-h-[48px] max-h-[120px]"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isProcessing || (!input.trim() && attachments.length === 0)}
              className="p-3 rounded-xl bg-[#0A0A0A] text-white hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#A3A3A3] text-xs mt-3">
            {mode === "instant" ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3" />
                Safe changes apply in 30s. Complex ones automatically get a preview.
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                You'll always get a preview link before anything goes live.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
