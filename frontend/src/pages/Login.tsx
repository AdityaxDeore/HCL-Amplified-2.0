import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Bot, ArrowRight, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate network request
    setTimeout(() => {
      navigate('/onboarding')
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pt-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue your personalized learning journey
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <input 
                type="email"
                defaultValue="aditya@example.com"
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <a href="#" className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors">
                  Forgot password?
                </a>
              </div>
              <input 
                type="password"
                defaultValue="password123"
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button 
              type="submit" 
              className="w-full group h-11 text-base bg-primary hover:bg-primary/90 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account? <a href="#" className="text-primary hover:underline font-medium">Sign up</a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
