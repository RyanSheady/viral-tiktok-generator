'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "omg hey bestie! 🎬✨ your resident viral TikTok expert and podcast girlies tea spiller here! i'm literally obsessed with creating viral moments and exposing what podcasts everyone's secretly binging rn! type 'Hit Me' for 5 viral TikTok ideas that'll have everyone downloading our podcast sharing app fr fr! let's make some content go off bestie! 💅🎧"
      }
    ]
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || "Oof, something's not giving rn... Try again?")
      console.error('Chat error:', error)
    }
  }, [error])

  const sampleQuestions = [
    "Hit Me",
    "what's the tea on podcast listener behavior?",
    "give me a viral sound that'd work for our app",
    "how do we expose someone's guilty pleasure pods?"
  ]

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      await handleSubmit(e)
    } catch (err: any) {
      setErrorMessage(err.message || "Bestie, we're having technical difficulties rn")
      console.error('Form submission error:', err)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === 'assistant' ? 'bg-white' : 'bg-blue-100'
            } p-4 rounded-lg shadow-sm`}
          >
            <div className="flex-1 max-w-4xl mx-auto">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center mr-4">
                  {message.role === 'assistant' ? '🎬' : '💁'}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-blue-900">
                    {message.role === 'assistant' ? 'Your Content Bestie' : 'You'}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-blue-600">bestie is creating content... 🎬✨</div>
          </div>
        )}
        {errorMessage && (
          <div className="flex justify-center">
            <div className="text-red-500">{errorMessage}</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className="border-t border-blue-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleFormSubmit} className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="type 'Hit Me' for viral ideas bestie..."
                className="flex-1 rounded-md border border-blue-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`rounded-md px-4 py-2 text-white focus:outline-none ${
                  isLoading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'creating...' : 'go viral'}
              </button>
            </div>
            
            {/* Sample questions */}
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((question, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const form = document.querySelector('form')
                    const input = form?.querySelector('input')
                    if (input) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        "value"
                      )?.set
                      if (nativeInputValueSetter) {
                        nativeInputValueSetter.call(input, question)
                        input.dispatchEvent(new Event('input', { bubbles: true }))
                      }
                    }
                  }}
                  className="rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 border border-blue-200"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 