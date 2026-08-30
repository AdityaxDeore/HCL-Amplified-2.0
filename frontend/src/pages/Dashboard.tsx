import React from 'react'
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { Bot, Sparkles, Code2, BookOpen } from "lucide-react"

export default function Dashboard() {
  const handleSendMessage = (message: string, files?: File[]) => {
    console.log('Message:', message)
    console.log('Files:', files)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in duration-500">
        
        {/* Welcome Section */}
        <div className="text-center space-y-4 max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Good morning, Aditya</h1>
          <p className="text-lg text-muted-foreground">What do you want to learn today?</p>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card text-sm font-medium hover:bg-accent/5 transition-colors">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Generate an AI Engineering roadmap</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card text-sm font-medium hover:bg-primary/5 transition-colors">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Test my Python skills</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card text-sm font-medium hover:bg-orange-500/5 transition-colors">
            <BookOpen className="h-4 w-4 text-orange-500" />
            <span>Explain backpropagation</span>
          </button>
        </div>

        {/* Claude-like Input Box */}
        <div className="w-full max-w-3xl pt-8">
          <PromptInputBox 
            onSend={handleSendMessage} 
            placeholder="Ask anything or request a learning path..."
          />
          <p className="text-center text-xs text-muted-foreground mt-4">
            LearnPath AI can make mistakes. Consider verifying important information.
          </p>
        </div>

      </div>
    </div>
  )
}
